import './tracing';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  app.enableCors({ origin: '*' });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Inventory Service API')
    .setDescription('API documentation for inventory-service')
    .setVersion('1.0.0')
    .addTag('inventory')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  const port = Number(process.env.PORT ?? 3001);

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

      console.warn(`[inventory-service] port ${port} is busy (attempt ${attempt}/8). Retrying in 1s...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  if (!started) {
    throw (lastError as Error) ?? new Error(`Could not bind port ${port}`);
  }

  console.log(`inventory-service running on port ${port}`);
  console.log(`Swagger: http://localhost:${port}/docs`);
}

void bootstrap();
