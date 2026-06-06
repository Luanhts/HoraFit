export interface Produto {
  id: number;
  name: string;
  description: string;
  price: number;
  sku: string;
  stock: number;
  imageUrl: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  categoryId: number;
  category: Category;
}

export interface Category {
  id: number;
  name: string;
}

// Dados que o formulário envia (sem campos gerados pelo servidor)
export interface ProdutoFormData {
  name: string;
  sku: string;
  price: number;
  stock: number;
  categoryId: number;
  description?: string;
  imageUrl?: string;
  active: boolean;
}
