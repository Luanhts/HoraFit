import { z } from 'zod';

const orderItemSchema = z
  .object({
    productId: z.coerce.number().int().positive('Produto inválido no pedido.'),
    quantity: z.coerce
      .number()
      .int('Quantidade deve ser um número inteiro.')
      .positive('Quantidade deve ser maior que zero.')
      .max(1000, 'Quantidade excede o limite permitido.'),
  })
  .strict();

export const createOrderSchema = z
  .object({
    customerName: z
      .string()
      .trim()
      .min(1, 'Nome é obrigatório.')
      .max(120, 'Nome muito longo.'),
    customerPhone: z
      .string()
      .trim()
      .min(8, 'Telefone inválido.')
      .max(30, 'Telefone muito longo.'),
    customerEmail: z
      .union([
        z.literal(''),
        z
          .string()
          .trim()
          .email('E-mail inválido.')
          .max(254, 'E-mail muito longo.'),
      ])
      .optional(),
    notes: z.string().trim().max(2000, 'Observações muito longas.').optional(),
    items: z
      .array(orderItemSchema)
      .min(1, 'Adicione pelo menos um produto ao pedido.')
      .max(50, 'Pedido excede o limite de itens.'),
  })
  .strict();

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
