import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    const customerName = createOrderDto.customerName?.trim();
    const customerPhone = createOrderDto.customerPhone?.trim();

    if (!customerName) {
      throw new BadRequestException('Informe o nome do cliente.');
    }

    if (!customerPhone) {
      throw new BadRequestException('Informe o telefone do cliente.');
    }

    if (!Array.isArray(createOrderDto.items) || createOrderDto.items.length === 0) {
      throw new BadRequestException('Adicione pelo menos um produto ao pedido.');
    }

    const itemsByProduct = new Map<number, number>();

    for (const item of createOrderDto.items) {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);

      if (!Number.isInteger(productId) || productId <= 0) {
        throw new BadRequestException('Produto inválido no pedido.');
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new BadRequestException('A quantidade dos itens deve ser maior que zero.');
      }

      itemsByProduct.set(productId, (itemsByProduct.get(productId) ?? 0) + quantity);
    }

    const normalizedItems = Array.from(itemsByProduct.entries()).map(([productId, quantity]) => ({
      productId,
      quantity,
    }));

    return this.prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: normalizedItems.map((item) => item.productId) } },
      });

      if (products.length !== normalizedItems.length) {
        throw new BadRequestException('Um ou mais produtos não foram encontrados.');
      }

      const productsById = new Map(products.map((product) => [product.id, product]));
      let total = 0;

      const orderItems: Array<{
        productId: number;
        quantity: number;
        unitPrice: number;
        subtotal: number;
      }> = [];

      for (const item of normalizedItems) {
        const product = productsById.get(item.productId);

        if (!product || !product.active) {
          throw new BadRequestException(`Produto #${item.productId} indisponível.`);
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(`Estoque insuficiente para ${product.name}.`);
        }

        const unitPrice = Number(product.price);
        const subtotal = Number((unitPrice * item.quantity).toFixed(2));
        total += subtotal;

        const stockUpdate = await tx.product.updateMany({
          where: {
            id: product.id,
            active: true,
            stock: { gte: item.quantity },
          },
          data: { stock: { decrement: item.quantity } },
        });

        if (stockUpdate.count !== 1) {
          throw new BadRequestException(`Estoque insuficiente para ${product.name}.`);
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
          total: Number(total.toFixed(2)),
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

    try {
      return await this.prisma.order.update({
        where: { id },
        data: { status },
        include: {
          items: {
            include: { product: { include: { category: true } } },
          },
        },
      });
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new NotFoundException(`Pedido #${id} não encontrado.`);
      }

      throw error;
    }
  }
}
