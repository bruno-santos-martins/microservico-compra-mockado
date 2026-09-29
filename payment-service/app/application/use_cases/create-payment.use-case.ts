import type {
  CreatePaymentInput,
  PaymentRepositoryPort,
} from '../../domain/ports/payment-repository.port';

export class CreatePaymentUseCase {
  constructor(private readonly paymentRepository: PaymentRepositoryPort) {}

  async execute(input: CreatePaymentInput) {
    return this.paymentRepository.create(input);
  }
}
