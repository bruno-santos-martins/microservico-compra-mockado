import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tracking_checkpoints')
export class TrackingCheckpointEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  trackingCode!: string;

  @Column()
  orderId!: string;

  @Column()
  stage!: string;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  details!: string;

  @Column()
  location!: string;

  @Column({ type: 'timestamptz' })
  timestamp!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
