export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  price: number;
  cbdPercentage: number;
  thcPercentage: number;
  stockQuantity: number;
}

export interface CartItem extends Product {
  quantity: number;
  prescriptionUrl?: string;
  prescriptionFileName?: string;
}

export interface TrackingCheckpoint {
  id: string;
  title: string;
  location: string;
  details: string;
  status: 'pending' | 'done';
  createdAt: string;
}

export interface TrackingOrder {
  trackingCode: string;
  patientName: string;
  prescriptionUrl?: string;
  checkpoints: TrackingCheckpoint[];
}
