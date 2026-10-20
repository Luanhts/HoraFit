import { z } from 'zod';

const productFields = {
  name: z
    .string()
    .trim()
    .min(1, 'Nome é obrigatório.')
    .max(120, 'Nome muito longo.'),
  description: z.string().trim().max(5000, 'Descrição muito longa.').optional(),
  price: z.coerce
    .number()
    .positive('Preço deve ser maior que zero.')
    .max(99_999_999.99, 'Preço excede o limite permitido.')
    .multipleOf(0.01, 'Preço deve ter no máximo duas casas decimais.'),
  sku: z
    .string()
    .trim()
    .min(1, 'SKU é obrigatório.')
    .max(64, 'SKU muito longo.'),
  stock: z.coerce
    .number()
    .int('Estoque deve ser um número inteiro.')
    .min(0, 'Estoque não pode ser negativo.')
    .max(2_147_483_647, 'Estoque excede o limite permitido.'),
  categoryId: z.coerce
    .number()
    .int()
    .positive('Selecione uma categoria válida.'),
  imageUrl: z
    .string()
    .trim()
    .max(2048, 'URL da imagem muito longa.')
    .refine(
      (value) => value === '' || /^https?:\/\//i.test(value),
      'URL da imagem deve usar HTTP ou HTTPS.',
    )
    .optional(),
  active: z.boolean(),
};

export const createProductSchema = z
  .object({
    ...productFields,
    stock: productFields.stock.optional().default(0),
    active: productFields.active.optional().default(true),
  })
  .strict();

export const updateProductSchema = z
  .object(productFields)
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualizar.',
  });

export type ProductFormData = z.infer<typeof createProductSchema>;
