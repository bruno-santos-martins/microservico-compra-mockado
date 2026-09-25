import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  trackingCode!: string;

  @Column()
  customerName!: string;

  @Column()
  customerEmail!: string;

  @Column({ type: 'text' })
  prescriptionUrl!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount!: number;

  @Column({ type: 'jsonb' })
  items!: Array<{ productId: string; quantity: number; price: number }>;

  @CreateDateColumn()
  createdAt!: Date;
}
