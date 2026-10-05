import { BadRequestException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  const baseOrder = { id: 42, status: OrderStatus.PENDING };

  it('only updates an order through an allowed status transition', async () => {
    const prisma = {
      order: {
        findUnique: jest.fn().mockResolvedValue(baseOrder),
        update: jest
          .fn()
          .mockResolvedValue({ ...baseOrder, status: OrderStatus.CONFIRMED }),
      },
    };
    const service = new OrdersService(prisma as never);

    await expect(
      service.updateStatus(42, OrderStatus.CONFIRMED),
    ).resolves.toMatchObject({ status: OrderStatus.CONFIRMED });
    expect(prisma.order.update).toHaveBeenCalledTimes(1);
  });

  it('rejects a status transition that skips the fulfillment flow', async () => {
    const prisma = {
      order: {
        findUnique: jest.fn().mockResolvedValue(baseOrder),
        update: jest.fn(),
      },
    };
    const service = new OrdersService(prisma as never);

    await expect(
      service.updateStatus(42, OrderStatus.DELIVERED),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.order.update).not.toHaveBeenCalled();
  });
});
