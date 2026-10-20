import { z } from 'zod';

export const createCategorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Nome é obrigatório.')
      .max(100, 'Nome muito longo.'),
  })
  .strict();

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
