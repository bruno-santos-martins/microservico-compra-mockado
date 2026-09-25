export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  price: number;
  cbdPercentage: number;
  thcPercentage: number;
  stockQuantity: number;
  createdAt: Date;
}
