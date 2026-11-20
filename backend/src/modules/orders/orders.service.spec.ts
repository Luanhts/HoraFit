import { BadRequestException, ConflictException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  type CreateInput = {
    data: {
      total: Prisma.Decimal;
      items: {
        create: Array<{
          unitPrice: Prisma.Decimal;
          subtotal: Prisma.Decimal;
        }>;
      };
    };
  };

  function createOrderPrismaMock(prices: string[]) {
    const products = prices.map((price, index) => ({
      id: index + 1,
      name: `Produto ${index + 1}`,
      price,
      stock: 10,
      active: true,
    }));
    const tx = {
      product: {
        findMany: jest.fn().mockResolvedValue(products),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      order: {
        create: jest.fn((input: CreateInput) => {
          void input;
          return Promise.resolve({ id: 42 });
        }),
      },
    };
    const prisma = {
      $transaction: jest.fn((callback: (client: typeof tx) => unknown) =>
        callback(tx),
      ),
    };

    return { prisma, tx };
  }

  it('calculates item subtotals and the order total with exact decimals', async () => {
    const { prisma, tx } = createOrderPrismaMock(['0.10', '0.20']);
    const service = new OrdersService(prisma as never);

    await service.create({
      customerName: 'Cliente',
      customerPhone: '41999999999',
      items: [
        { productId: 1, quantity: 3 },
        { productId: 2, quantity: 1 },
      ],
    });

    const data = tx.order.create.mock.calls[0][0].data;
    expect(data.items.create[0].unitPrice.toFixed(2)).toBe('0.10');
    expect(data.items.create[0].subtotal.toFixed(2)).toBe('0.30');
    expect(data.items.create[1].subtotal.toFixed(2)).toBe('0.20');
    expect(data.total.toFixed(2)).toBe('0.50');
  });

  it('rejects an order whose total exceeds Decimal(10,2)', async () => {
    const { prisma, tx } = createOrderPrismaMock([
      '50000000.00',
      '50000000.00',
    ]);
    const service = new OrdersService(prisma as never);

    await expect(
      service.create({
        customerName: 'Cliente',
        customerPhone: '41999999999',
        items: [
          { productId: 1, quantity: 1 },
          { productId: 2, quantity: 1 },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.order.create).not.toHaveBeenCalled();
  });

  it('rejects an item whose subtotal exceeds Decimal(10,2)', async () => {
    const { prisma, tx } = createOrderPrismaMock(['99999999.99']);
    const service = new OrdersService(prisma as never);

    await expect(
      service.create({
        customerName: 'Cliente',
        customerPhone: '41999999999',
        items: [{ productId: 1, quantity: 2 }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.product.updateMany).not.toHaveBeenCalled();
    expect(tx.order.create).not.toHaveBeenCalled();
  });

  const baseOrder = {
    id: 42,
    status: OrderStatus.PENDING,
    items: [
      { productId: 10, quantity: 2 },
      { productId: 20, quantity: 3 },
    ],
  };

  function createPrismaMock(
    currentOrder = baseOrder,
    updatedOrder = { ...baseOrder, status: OrderStatus.CONFIRMED },
  ) {
    const tx = {
      order: {
        findUnique: jest
          .fn()
          .mockResolvedValueOnce(currentOrder)
          .mockResolvedValueOnce(updatedOrder),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      product: {
        update: jest.fn().mockResolvedValue({}),
      },
    };
    const prisma = {
      $transaction: jest.fn((callback: (client: typeof tx) => unknown) =>
        callback(tx),
      ),
    };

    return { prisma, tx };
  }

  it('only updates an order through an allowed status transition', async () => {
    const { prisma, tx } = createPrismaMock();
    const service = new OrdersService(prisma as never);

    await expect(
      service.updateStatus(42, OrderStatus.CONFIRMED),
    ).resolves.toMatchObject({ status: OrderStatus.CONFIRMED });
    expect(tx.order.updateMany).toHaveBeenCalledWith({
      where: { id: 42, status: OrderStatus.PENDING },
      data: { status: OrderStatus.CONFIRMED },
    });
    expect(tx.product.update).not.toHaveBeenCalled();
  });

  it('rejects a status transition that skips the fulfillment flow', async () => {
    const { prisma, tx } = createPrismaMock();
    const service = new OrdersService(prisma as never);

    await expect(
      service.updateStatus(42, OrderStatus.DELIVERED),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.order.updateMany).not.toHaveBeenCalled();
    expect(tx.product.update).not.toHaveBeenCalled();
  });

  it('restores every item when canceling an order', async () => {
    const canceledOrder = { ...baseOrder, status: OrderStatus.CANCELED };
    const { prisma, tx } = createPrismaMock(baseOrder, canceledOrder);
    const service = new OrdersService(prisma as never);

    await expect(
      service.updateStatus(42, OrderStatus.CANCELED),
    ).resolves.toMatchObject({ status: OrderStatus.CANCELED });
    expect(tx.order.updateMany).toHaveBeenCalledWith({
      where: { id: 42, status: OrderStatus.PENDING },
      data: { status: OrderStatus.CANCELED },
    });
    expect(tx.product.update).toHaveBeenNthCalledWith(1, {
      where: { id: 10 },
      data: { stock: { increment: 2 } },
    });
    expect(tx.product.update).toHaveBeenNthCalledWith(2, {
      where: { id: 20 },
      data: { stock: { increment: 3 } },
    });
  });

  it('does not restore stock again when the order is already canceled', async () => {
    const canceledOrder = { ...baseOrder, status: OrderStatus.CANCELED };
    const { prisma, tx } = createPrismaMock(canceledOrder, canceledOrder);
    const service = new OrdersService(prisma as never);

    await expect(
      service.updateStatus(42, OrderStatus.CANCELED),
    ).resolves.toMatchObject({ status: OrderStatus.CANCELED });
    expect(tx.order.updateMany).not.toHaveBeenCalled();
    expect(tx.product.update).not.toHaveBeenCalled();
  });

  it('rejects a concurrent transition before changing stock', async () => {
    const canceledOrder = { ...baseOrder, status: OrderStatus.CANCELED };
    const { prisma, tx } = createPrismaMock(baseOrder, canceledOrder);
    tx.order.updateMany.mockResolvedValue({ count: 0 });
    const service = new OrdersService(prisma as never);

    await expect(
      service.updateStatus(42, OrderStatus.CANCELED),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(tx.product.update).not.toHaveBeenCalled();
  });
});
