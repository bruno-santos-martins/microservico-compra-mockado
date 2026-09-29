export const PAYMENT_REPOSITORY_PORT = Symbol('PAYMENT_REPOSITORY_PORT');

export interface PaymentRecord {
  id: string;
  orderId: string;
  amount: number;
  status: string;
  providerRef: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentInput {
  orderId: string;
  amount: number;
  status: string;
  providerRef?: string;
}

export interface UpdatePaymentInput {
  amount?: number;
  status?: string;
  providerRef?: string | null;
}

export interface PaymentRepositoryPort {
  create(input: CreatePaymentInput): Promise<PaymentRecord>;
  findAll(): Promise<PaymentRecord[]>;
  findById(id: string): Promise<PaymentRecord | null>;
  update(id: string, input: UpdatePaymentInput): Promise<PaymentRecord | null>;
  delete(id: string): Promise<boolean>;
}
