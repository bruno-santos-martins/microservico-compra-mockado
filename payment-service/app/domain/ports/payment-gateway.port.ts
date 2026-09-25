export interface PaymentGatewayPort {
  approve(totalAmount: number): Promise<{ transactionId: string }>;
}
