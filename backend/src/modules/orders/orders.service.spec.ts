import { BadRequestException, ConflictException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
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
