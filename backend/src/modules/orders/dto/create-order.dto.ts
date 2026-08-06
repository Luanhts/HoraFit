export class CreateOrderDto {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
  items: Array<{
    productId: number;
    quantity: number;
  }>;
}
