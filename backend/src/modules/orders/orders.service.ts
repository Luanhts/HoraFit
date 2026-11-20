import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import type { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  private readonly maxMoney = new Prisma.Decimal('99999999.99');

  async create(createOrderDto: CreateOrderDto) {
    const customerName = createOrderDto.customerName?.trim();
    const customerPhone = createOrderDto.customerPhone?.trim();

    if (!customerName) {
      throw new BadRequestException('Informe o nome do cliente.');
    }

    if (!customerPhone) {
      throw new BadRequestException('Informe o telefone do cliente.');
    }

    if (
      !Array.isArray(createOrderDto.items) ||
      createOrderDto.items.length === 0
    ) {
      throw new BadRequestException(
        'Adicione pelo menos um produto ao pedido.',
      );
    }

    const itemsByProduct = new Map<number, number>();

    for (const item of createOrderDto.items) {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);

      if (!Number.isInteger(productId) || productId <= 0) {
        throw new BadRequestException('Produto inválido no pedido.');
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new BadRequestException(
          'A quantidade dos itens deve ser maior que zero.',
        );
      }

      itemsByProduct.set(
        productId,
        (itemsByProduct.get(productId) ?? 0) + quantity,
      );
    }

    const normalizedItems = Array.from(itemsByProduct.entries())
      .map(([productId, quantity]) => ({ productId, quantity }))
      .sort((left, right) => left.productId - right.productId);

    return this.prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: normalizedItems.map((item) => item.productId) } },
      });

      if (products.length !== normalizedItems.length) {
        throw new BadRequestException(
          'Um ou mais produtos não foram encontrados.',
        );
      }

      const productsById = new Map(
        products.map((product) => [product.id, product]),
      );
      let total = new Prisma.Decimal(0);

      const orderItems: Array<{
        productId: number;
        quantity: number;
        unitPrice: Prisma.Decimal;
        subtotal: Prisma.Decimal;
      }> = [];

      for (const item of normalizedItems) {
        const product = productsById.get(item.productId);

        if (!product || !product.active) {
          throw new BadRequestException(
            `Produto #${item.productId} indisponível.`,
          );
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Estoque insuficiente para ${product.name}.`,
          );
        }

        const unitPrice = new Prisma.Decimal(product.price);
        const subtotal = unitPrice.mul(item.quantity);
        total = total.add(subtotal);

        if (subtotal.gt(this.maxMoney) || total.gt(this.maxMoney)) {
          throw new BadRequestException(
            'Valor do pedido excede o limite permitido.',
          );
        }

        const stockUpdate = await tx.product.updateMany({
          where: {
            id: product.id,
            active: true,
            stock: { gte: item.quantity },
          },
          data: { stock: { decrement: item.quantity } },
        });

        if (stockUpdate.count !== 1) {
          throw new BadRequestException(
            `Estoque insuficiente para ${product.name}.`,
          );
        }

        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice,
          subtotal,
        });
      }

      return tx.order.create({
        data: {
          customerName,
          customerPhone,
          customerEmail: createOrderDto.customerEmail?.trim() || null,
          notes: createOrderDto.notes?.trim() || null,
          total,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: { product: { include: { category: true } } },
          },
        },
      });
    });
  }

  findAll() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: { include: { category: true } } },
        },
      },
    });
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: { include: { category: true } } },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Pedido #${id} não encontrado.`);
    }

    return order;
  }

  async updateStatus(id: number, status: OrderStatus) {
    if (!Object.values(OrderStatus).includes(status)) {
      throw new BadRequestException('Status de pedido inválido.');
    }

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: {
          items: {
            include: { product: { include: { category: true } } },
          },
        },
      });

      if (!order) {
        throw new NotFoundException(`Pedido #${id} não encontrado.`);
      }

      if (order.status === status) {
        return order;
      }

      if (!this.isAllowedStatusTransition(order.status, status)) {
        throw new BadRequestException(
          `Não é possível alterar um pedido de ${order.status} para ${status}.`,
        );
      }

      const statusUpdate = await tx.order.updateMany({
        where: { id, status: order.status },
        data: { status },
      });

      if (statusUpdate.count !== 1) {
        throw new ConflictException(
          'O pedido foi atualizado por outra operação. Recarregue os dados e tente novamente.',
        );
      }

      if (status === OrderStatus.CANCELED) {
        const items = [...order.items].sort(
          (left, right) => left.productId - right.productId,
        );

        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      const updatedOrder = await tx.order.findUnique({
        where: { id },
        include: {
          items: {
            include: { product: { include: { category: true } } },
          },
        },
      });

      if (!updatedOrder) {
        throw new NotFoundException(`Pedido #${id} não encontrado.`);
      }

      return updatedOrder;
    });
  }

  private isAllowedStatusTransition(from: OrderStatus, to: OrderStatus) {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELED],
      CONFIRMED: [OrderStatus.PREPARING, OrderStatus.CANCELED],
      PREPARING: [OrderStatus.READY, OrderStatus.CANCELED],
      READY: [OrderStatus.DELIVERED, OrderStatus.CANCELED],
      DELIVERED: [],
      CANCELED: [],
    };

    return transitions[from].includes(to);
  }
}
