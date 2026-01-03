export interface Produto {
    id: number;
    name: string,
    description: string,
    price: number,
    sku: string,
    stock: number,
    imageUrl: null,
    active: boolean,
    createdAt: Date,
    updatedAt: Date,
    categoryId: number,
    category: Category
}

export interface Category {
    id: number;
    name: string;
}