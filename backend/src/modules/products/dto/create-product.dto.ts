export class CreateProductDto {
  name: string;
  price: number;
  sku: string;
  categoryId: number;
  description?: string;
  imageUrl?: string;
  stock?: number;
  active?: boolean;
}
