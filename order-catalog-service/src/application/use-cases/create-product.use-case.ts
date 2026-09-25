import { Inject, Injectable } from '@nestjs/common';
import type { CreateProductInput } from '../dto';
import { PRODUCT_REPOSITORY_PORT, type ProductRepositoryPort } from '../../domain/ports/product-repository.port';

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly productRepository: ProductRepositoryPort
  ) {}

  async execute(input: CreateProductInput) {
    return this.productRepository.create(input);
  }
}
