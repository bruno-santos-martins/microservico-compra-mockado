import type { Order } from '../entities/order';
import type { TrackingCheckpoint } from '../entities/tracking-checkpoint';

export const ORDER_REPOSITORY_PORT = Symbol('ORDER_REPOSITORY_PORT');

export interface OrderRepositoryPort {
  create(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order>;
  saveCheckpoint(checkpoint: TrackingCheckpoint): Promise<void>;
  getTrackingByCode(trackingCode: string): Promise<TrackingCheckpoint[]>;
}
