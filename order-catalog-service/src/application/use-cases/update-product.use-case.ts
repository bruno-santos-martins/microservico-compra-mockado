import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PRODUCT_REPOSITORY_PORT, type ProductRepositoryPort } from '../../domain/ports/product-repository.port';
import type { CreateProductInput } from '../dto';

export type UpdateProductInput = Partial<CreateProductInput>;

@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly productRepository: ProductRepositoryPort
  ) {}

  async execute(id: string, input: UpdateProductInput) {
    const updated = await this.productRepository.update(id, input);
    if (!updated) {
      throw new NotFoundException(`Product ${id} not found.`);
    }

    return updated;
  }
}
