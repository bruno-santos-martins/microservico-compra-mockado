export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  cbdPercentage: number;
  thcPercentage: number;
  stockQuantity: number;
}

export interface CheckoutItemInput {
  productId: string;
  quantity: number;
  price: number;
}

export interface RequestCheckoutInput {
  customerName: string;
  customerEmail: string;
  items: CheckoutItemInput[];
  prescriptionUrl: string;
  totalAmount: number;
}
