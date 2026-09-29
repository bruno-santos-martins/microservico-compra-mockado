import type { PaymentRepositoryPort } from '../../domain/ports/payment-repository.port';

export class GetPaymentUseCase {
  constructor(private readonly paymentRepository: PaymentRepositoryPort) {}

  async execute(id: string) {
    return this.paymentRepository.findById(id);
  }
}
