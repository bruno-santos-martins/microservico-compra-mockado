export interface CheckoutItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  trackingCode: string;
  customerName: string;
  customerEmail: string;
  prescriptionUrl: string;
  totalAmount: number;
  items: CheckoutItem[];
  createdAt: Date;
}
