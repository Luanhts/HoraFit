import { z } from 'zod';
import { createProductSchema } from '../../../schemas/product-schema';

export type CreateProductDto = z.infer<typeof createProductSchema>;
