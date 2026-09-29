import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './infra/database/typeorm/entities/product.entity';
import { OrderEntity } from './infra/database/typeorm/entities/order.entity';
import { TrackingCheckpointEntity } from './infra/database/typeorm/entities/tracking-checkpoint.entity';
import { ProductRepository } from './infra/database/typeorm/repositories/product.repository';
import { OrderRepository } from './infra/database/typeorm/repositories/order.repository';
import { LocalstackS3Adapter } from './infra/storage/localstack-s3.adapter';
import { RabbitMQProducer } from './infra/messaging/rabbitmq.producer';
import { TrackingGateway } from './infra/gateways/tracking.gateway';
import { TrackingConsumer } from './infra/messaging/tracking.consumer';
import { ProductController } from './infra/http/controllers/product.controller';
import { PrescriptionController } from './infra/http/controllers/prescription.controller';
import { OrderController } from './infra/http/controllers/order.controller';
import { HealthyController } from './infra/http/controllers/healthy.controller';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { ListProductsUseCase } from './application/use-cases/list-products.use-case';
import { GetProductUseCase } from './application/use-cases/get-product.use-case';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case';
import { DeleteProductUseCase } from './application/use-cases/delete-product.use-case';
import { UploadPrescriptionUseCase } from './application/use-cases/upload-prescription.use-case';
import { RequestCheckoutUseCase } from './application/use-cases/request-checkout.use-case';
import { GetTrackingUseCase } from './application/use-cases/get-tracking.use-case';
import { ORDER_REPOSITORY_PORT } from './domain/ports/order-repository.port';
import { PRODUCT_REPOSITORY_PORT } from './domain/ports/product-repository.port';
import { STORAGE_PORT } from './domain/ports/storage.port';
import { MESSAGE_BUS_PORT } from './domain/ports/message-bus.port';
import { RedisCacheService } from './infra/cache/redis-cache.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER ?? 'root',
      password: process.env.DB_PASS ?? 'password',
      database: process.env.DB_NAME ?? 'order_catalog_db',
      entities: [ProductEntity, OrderEntity, TrackingCheckpointEntity],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([ProductEntity, OrderEntity, TrackingCheckpointEntity]),
  ],
  controllers: [ProductController, PrescriptionController, OrderController, HealthyController],
  providers: [
    ProductRepository,
    OrderRepository,
    RedisCacheService,
    LocalstackS3Adapter,
    RabbitMQProducer,
    TrackingGateway,
    TrackingConsumer,
    CreateProductUseCase,
    ListProductsUseCase,
    GetProductUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    UploadPrescriptionUseCase,
    RequestCheckoutUseCase,
    GetTrackingUseCase,
    { provide: PRODUCT_REPOSITORY_PORT, useExisting: ProductRepository },
    { provide: ORDER_REPOSITORY_PORT, useExisting: OrderRepository },
    { provide: STORAGE_PORT, useExisting: LocalstackS3Adapter },
    { provide: MESSAGE_BUS_PORT, useExisting: RabbitMQProducer },
  ],
})
export class AppModule {}
