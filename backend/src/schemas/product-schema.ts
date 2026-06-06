// src/schemas/product-schema.ts
import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "A descrição deve ser razoável"),
  price: z.coerce.number().min(0.01, "O preço deve ser maior que zero"),
  sku: z.string().min(3, "SKU é obrigatório"),
  stock: z.coerce.number().int().min(0, "Estoque não pode ser negativo"),
  categoryId: z.coerce.number().min(1, "Selecione uma categoria"),
  active: z.boolean().default(true),
});

export type ProductFormData = z.infer<typeof productSchema>;