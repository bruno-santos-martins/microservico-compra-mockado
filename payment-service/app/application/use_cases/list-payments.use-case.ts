import type { PaymentRepositoryPort } from '../../domain/ports/payment-repository.port';

export class ListPaymentsUseCase {
  constructor(private readonly paymentRepository: PaymentRepositoryPort) {}

  async execute() {
    return this.paymentRepository.findAll();
  }
}
