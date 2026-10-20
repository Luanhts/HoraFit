import { OrderStatus } from '@prisma/client';
import { z } from 'zod';

export const updateOrderStatusSchema = z
  .object({
    status: z.nativeEnum(OrderStatus, { error: 'Status de pedido inválido.' }),
  })
  .strict();

export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>;
