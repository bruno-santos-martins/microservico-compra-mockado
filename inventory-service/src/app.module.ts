import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductInventoryEntity } from './infra/database/product-inventory.entity';
import { InventoryRepository } from './infra/database/inventory.repository';
import { ReserveStockUseCase } from './application/use-cases/reserve-stock.use-case';
import { InventoryConsumer } from './infra/messaging/inventory.consumer';
import { INVENTORY_REPOSITORY_PORT } from './domain/ports/inventory-repository.port';
import { HealthyController } from './infra/http/healthy.controller';
import { MessagingContractsController } from './infra/http/messaging-contracts.controller';

@Module({
  controllers: [HealthyController, MessagingContractsController],
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER ?? 'root',
      password: process.env.DB_PASS ?? 'password',
      database: process.env.DB_NAME ?? 'inventory_db',
      entities: [ProductInventoryEntity],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([ProductInventoryEntity]),
  ],
  providers: [
    InventoryRepository,
    ReserveStockUseCase,
    InventoryConsumer,
    { provide: INVENTORY_REPOSITORY_PORT, useExisting: InventoryRepository },
  ],
})
export class AppModule {}
