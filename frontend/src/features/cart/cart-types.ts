export type CartProduct = {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  stock: number;
};

export type CartItem = {
  product: CartProduct;
  quantity: number;
};
