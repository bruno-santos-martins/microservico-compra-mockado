import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'text', nullable: true })
  imageUrl?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price!: number;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  cbdPercentage!: number;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  thcPercentage!: number;

  @Column({ type: 'int' })
  stockQuantity!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
