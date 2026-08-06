import { Produto } from './produto';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELED';

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number | string;
  subtotal: number | string;
  product: Produto;
}

export interface Order {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  notes: string | null;
  status: OrderStatus;
  total: number | string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}
