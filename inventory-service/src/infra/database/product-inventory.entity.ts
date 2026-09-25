import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('products')
export class ProductInventoryEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'int' })
  stockQuantity!: number;
}
