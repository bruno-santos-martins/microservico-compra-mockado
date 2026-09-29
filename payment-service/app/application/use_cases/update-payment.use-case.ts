import type {
  PaymentRepositoryPort,
  UpdatePaymentInput,
} from '../../domain/ports/payment-repository.port';

export class UpdatePaymentUseCase {
  constructor(private readonly paymentRepository: PaymentRepositoryPort) {}

  async execute(id: string, input: UpdatePaymentInput) {
    return this.paymentRepository.update(id, input);
  }
}
