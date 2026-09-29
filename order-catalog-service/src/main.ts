import './tracing';
import dotenv from 'dotenv';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

dotenv.config({ path: '.env.local' });
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  app.enableCors({ origin: '*' });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Order Catalog Service API')
    .setDescription('API documentation for order-catalog-service')
    .setVersion('1.0.0')
    .addTag('order-catalog')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  const port = Number(process.env.PORT ?? 3000);

  let started = false;
  let lastError: unknown;
  for (let attempt = 1; attempt <= 8; attempt += 1) {
    try {
      await app.listen(port);
      started = true;
      break;
    } catch (error) {
      lastError = error;
      const message = (error as Error).message ?? '';
      if (!message.includes('EADDRINUSE') || attempt === 8) {
        throw error;
      }

      console.warn(
        `[order-catalog-service] port ${port} is busy (attempt ${attempt}/8). Retrying in 1s...`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  if (!started) {
    throw (lastError as Error) ?? new Error(`Could not bind port ${port}`);
  }

  console.log(`[order-catalog-service] running on port ${port}`);
  console.log(`[order-catalog-service] Swagger: http://localhost:${port}/docs`);

  const gracefulShutdown = () => {
    void app.close().finally(() => process.exit(0));
  };

  process.once('SIGINT', gracefulShutdown);
  process.once('SIGTERM', gracefulShutdown);
  process.once('SIGUSR2', gracefulShutdown);
}

void bootstrap();
