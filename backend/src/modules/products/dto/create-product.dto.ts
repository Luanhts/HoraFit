export class CreateProductDto {
    name: string;
    price: number;
    sku: string;
    categoryId: number; // Precisamos do ID da categoria para relacionar
    description?: string;
    imageUrl?: string;
}
