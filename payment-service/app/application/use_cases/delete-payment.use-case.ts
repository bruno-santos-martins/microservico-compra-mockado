import type { PaymentRepositoryPort } from '../../domain/ports/payment-repository.port';

export class DeletePaymentUseCase {
  constructor(private readonly paymentRepository: PaymentRepositoryPort) {}

  async execute(id: string) {
    return this.paymentRepository.delete(id);
  }
}
