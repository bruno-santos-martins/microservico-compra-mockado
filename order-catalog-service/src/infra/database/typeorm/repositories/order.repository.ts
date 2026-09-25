import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { OrderRepositoryPort } from '../../../../domain/ports/order-repository.port';
import type { Order } from '../../../../domain/entities/order';
import type { TrackingCheckpoint } from '../../../../domain/entities/tracking-checkpoint';
import { OrderEntity } from '../entities/order.entity';
import { TrackingCheckpointEntity } from '../entities/tracking-checkpoint.entity';

@Injectable()
export class OrderRepository implements OrderRepositoryPort {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(TrackingCheckpointEntity)
    private readonly checkpointRepo: Repository<TrackingCheckpointEntity>
  ) {}

  async create(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    const entity = this.orderRepo.create(order);
    return this.orderRepo.save(entity);
  }

  async saveCheckpoint(checkpoint: TrackingCheckpoint): Promise<void> {
    await this.checkpointRepo.save(
      this.checkpointRepo.create({
        ...checkpoint,
        timestamp: new Date(checkpoint.timestamp),
      })
    );
  }

  async getTrackingByCode(trackingCode: string): Promise<TrackingCheckpoint[]> {
    const rows = await this.checkpointRepo.find({
      where: { trackingCode },
      order: { timestamp: 'ASC' },
    });

    return rows.map((row) => ({
      trackingCode: row.trackingCode,
      orderId: row.orderId,
      stage: row.stage,
      title: row.title,
      details: row.details,
      location: row.location,
      timestamp: row.timestamp.toISOString(),
    }));
  }
}
