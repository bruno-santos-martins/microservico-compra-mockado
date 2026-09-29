import './tracing';
import dotenv from 'dotenv';
import express from 'express';
import type { Server as HttpServer } from 'http';
import { RabbitWorker } from './infra/workers/rabbit.worker';
import { prisma } from './infra/database/prisma';
import swaggerUi from 'swagger-ui-express';
import { PaymentRepository } from './infra/database/payment.repository';
import { CreatePaymentUseCase } from './application/use_cases/create-payment.use-case';
import { ListPaymentsUseCase } from './application/use_cases/list-payments.use-case';
import { GetPaymentUseCase } from './application/use_cases/get-payment.use-case';
import { UpdatePaymentUseCase } from './application/use_cases/update-payment.use-case';
import { DeletePaymentUseCase } from './application/use_cases/delete-payment.use-case';
import type { CreatePaymentInput, UpdatePaymentInput } from './domain/ports/payment-repository.port';

dotenv.config({ path: '.env.local' });
dotenv.config();

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
    '/payments': {
      get: {
        summary: 'List payments',
        responses: { '200': { description: 'Payments list' } },
      },
      post: {
        summary: 'Create payment',
        responses: { '201': { description: 'Payment created' } },
      },
    },
    '/payments/{id}': {
      get: {
        summary: 'Get payment by id',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Payment found' }, '404': { description: 'Not found' } },
      },
      patch: {
        summary: 'Update payment by id',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Payment updated' }, '404': { description: 'Not found' } },
      },
      delete: {
        summary: 'Delete payment by id',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '204': { description: 'Payment deleted' }, '404': { description: 'Not found' } },
      },
    },
  },
} as const;

function parseCreatePaymentBody(body: Record<string, unknown>): CreatePaymentInput {
  if (typeof body.orderId !== 'string' || body.orderId.length === 0) {
    throw new Error('orderId is required and must be a string.');
  }
  if (typeof body.amount !== 'number' || Number.isNaN(body.amount) || body.amount < 0) {
    throw new Error('amount is required and must be a non-negative number.');
  }
  if (typeof body.status !== 'string' || body.status.length === 0) {
    throw new Error('status is required and must be a non-empty string.');
  }

  return {
    orderId: body.orderId,
    amount: body.amount,
    status: body.status,
    providerRef: typeof body.providerRef === 'string' ? body.providerRef : undefined,
  };
}

function parseUpdatePaymentBody(body: Record<string, unknown>): UpdatePaymentInput {
  const input: UpdatePaymentInput = {};

  if (body.amount !== undefined) {
    if (typeof body.amount !== 'number' || Number.isNaN(body.amount) || body.amount < 0) {
      throw new Error('amount must be a non-negative number.');
    }
    input.amount = body.amount;
  }
  if (body.status !== undefined) {
    if (typeof body.status !== 'string' || body.status.length === 0) {
      throw new Error('status must be a non-empty string.');
    }
    input.status = body.status;
  }
  if (body.providerRef !== undefined) {
    input.providerRef = body.providerRef === null ? null : String(body.providerRef);
  }

  return input;
}

async function bootstrap() {
  const app = express();
  app.use(express.json());
  app.get('/docs.json', (_req, res) => {
    res.json(openApiSpec);
  });
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

  const paymentRepository = new PaymentRepository();
  const createPaymentUseCase = new CreatePaymentUseCase(paymentRepository);
  const listPaymentsUseCase = new ListPaymentsUseCase(paymentRepository);
  const getPaymentUseCase = new GetPaymentUseCase(paymentRepository);
  const updatePaymentUseCase = new UpdatePaymentUseCase(paymentRepository);
  const deletePaymentUseCase = new DeletePaymentUseCase(paymentRepository);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/healthy', (_req, res) => {
    res.json({ status: 'ok', service: 'payment-service' });
  });

  app.post('/payments', async (req, res) => {
    try {
      const payload = parseCreatePaymentBody((req.body ?? {}) as Record<string, unknown>);
      const created = await createPaymentUseCase.execute(payload);
      res.status(201).json(created);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid request';
      res.status(400).json({ message });
    }
  });

  app.get('/payments', async (_req, res) => {
    const items = await listPaymentsUseCase.execute();
    res.json(items);
  });

  app.get('/payments/:id', async (req, res) => {
    const item = await getPaymentUseCase.execute(req.params.id);
    if (!item) {
      res.status(404).json({ message: `Payment ${req.params.id} not found.` });
      return;
    }
    res.json(item);
  });

  app.patch('/payments/:id', async (req, res) => {
    try {
      const payload = parseUpdatePaymentBody((req.body ?? {}) as Record<string, unknown>);
      const updated = await updatePaymentUseCase.execute(req.params.id, payload);
      if (!updated) {
        res.status(404).json({ message: `Payment ${req.params.id} not found.` });
        return;
      }
      res.json(updated);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid request';
      res.status(400).json({ message });
    }
  });

  app.delete('/payments/:id', async (req, res) => {
    const deleted = await deletePaymentUseCase.execute(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: `Payment ${req.params.id} not found.` });
      return;
    }
    res.status(204).send();
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
