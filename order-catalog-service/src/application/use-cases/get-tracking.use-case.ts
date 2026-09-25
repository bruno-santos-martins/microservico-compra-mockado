import { Inject, Injectable } from '@nestjs/common';
import { ORDER_REPOSITORY_PORT, type OrderRepositoryPort } from '../../domain/ports/order-repository.port';
import { RedisCacheService } from '../../infra/cache/redis-cache.service';

@Injectable()
export class GetTrackingUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly orderRepository: OrderRepositoryPort,
    private readonly cache: RedisCacheService
  ) {}

  async execute(trackingCode: string) {
    const cacheKey = `tracking:${trackingCode}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as unknown;
    }

    const checkpoints = await this.orderRepository.getTrackingByCode(trackingCode);
    await this.cache.set(cacheKey, JSON.stringify(checkpoints), 60);
    return checkpoints;
  }
}
