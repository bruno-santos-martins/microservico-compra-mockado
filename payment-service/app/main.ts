import './tracing';
import 'dotenv/config';
import express from 'express';
import type { Server as HttpServer } from 'http';
import { RabbitWorker } from './infra/workers/rabbit.worker';
import { prisma } from './infra/database/prisma';
import swaggerUi from 'swagger-ui-express';

const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Payment Service API',
    description: 'API documentation for payment-service',
    version: '1.0.0',
  },
  servers: [{ url: '/' }],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        responses: {
          '200': { description: 'Service is healthy' },
        },
      },
    },
    '/healthy': {
      get: {
        summary: 'Detailed health check',
        responses: {
          '200': { description: 'Service is healthy with metadata' },
        },
      },
    },
  },
} as const;

async function bootstrap() {
  const app = express();
  app.use(express.json());
  app.get('/docs.json', (_req, res) => {
    res.json(openApiSpec);
  });
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/healthy', (_req, res) => {
    res.json({ status: 'ok', service: 'payment-service' });
  });

  await prisma.$connect();

  const worker = new RabbitWorker();
  await worker.start();

  const port = Number(process.env.PORT ?? 3333);
  let server: HttpServer | null = null;
  for (let attempt = 1; attempt <= 8; attempt += 1) {
    try {
      await new Promise<void>((resolve, reject) => {
        server = app.listen(port, () => {
          // eslint-disable-next-line no-console
          console.log(`payment-service running on ${port}`);
          console.log(`http://localhost:${port}/docs`);
          resolve();
        });
        server.once('error', reject);
      });
      break;
    } catch (error) {
      const message = (error as Error).message ?? '';
      if (!message.includes('EADDRINUSE') || attempt === 8) {
        throw error;
      }

      // eslint-disable-next-line no-console
      console.warn(`[payment-service] port ${port} busy (attempt ${attempt}/8). Retrying in 1s...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  const shutdown = async () => {
    if (server) {
      await new Promise<void>((resolve) => server?.close(() => resolve()));
    }
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

void bootstrap();
