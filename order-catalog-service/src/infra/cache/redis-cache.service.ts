import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisCacheService implements OnModuleDestroy {
  private readonly redis = new Redis({
    host: process.env.REDIS_HOST ?? 'localhost',
    port: Number(process.env.REDIS_PORT ?? 6379),
  });

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async set(key: string, value: string, ttlInSeconds: number): Promise<void> {
    await this.redis.set(key, value, 'EX', ttlInSeconds);
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }
}
