import { z } from 'zod';
import { updateProductSchema } from '../../../schemas/product-schema';

export type UpdateProductDto = z.infer<typeof updateProductSchema>;
