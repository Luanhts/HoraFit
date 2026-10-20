import { z } from 'zod';

export const positiveIdSchema = z.coerce
  .number()
  .int('Identificador deve ser um número inteiro.')
  .positive('Identificador deve ser maior que zero.');
