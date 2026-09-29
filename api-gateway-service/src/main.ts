import './tracing';
import dotenv from 'dotenv';
import http from 'http';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import axios, { AxiosError } from 'axios';
import FormData from 'form-data';
import { Server } from 'socket.io';
import { io as ioClient, Socket } from 'socket.io-client';
// @ts-ignore - local environment may not have swagger-ui-express declarations installed.
const swaggerUi = require('swagger-ui-express');

dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const upload = multer();

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL ?? 'http://localhost:3000';
const ORDER_SERVICE_WS_URL = process.env.ORDER_SERVICE_WS_URL ?? ORDER_SERVICE_URL;
const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL ?? 'http://localhost:3001';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL ?? 'http://localhost:3333';
const PORT = Number(process.env.PORT ?? 8080);
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);
const RATE_LIMIT_MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 120);

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '2mb' }));

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'API Gateway Service',
    description: 'API documentation for api-gateway-service',
    version: '1.0.0',
  },
  servers: [{ url: '/' }],
  paths: {
    '/healthy': {
      get: {
        summary: 'Health check',
        responses: {
          '200': { description: 'Service is healthy' },
        },
      },
    },
    '/order/healthy': {
      get: {
        summary: 'Order Catalog service health check via gateway',
        responses: {
          '200': { description: 'Order Catalog service is healthy' },
        },
      },
    },
    '/inventory/healthy': {
      get: {
        summary: 'Inventory service health check via gateway',
        responses: {
          '200': { description: 'Inventory service is healthy' },
        },
      },
    },
    '/payment/healthy': {
      get: {
        summary: 'Payment service health check via gateway',
        responses: {
          '200': { description: 'Payment service is healthy' },
        },
      },
    },
    '/products': {
      get: {
        summary: 'List products',
        responses: {
          '200': { description: 'Products listed' },
        },
      },
      post: {
        summary: 'Create product',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
            },
          },
        },
        responses: {
          '201': { description: 'Product created' },
        },
      },
    },
    '/orders/checkout': {
      post: {
        summary: 'Request checkout',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
            },
          },
        },
        responses: {
          '200': { description: 'Checkout requested' },
        },
      },
    },
    '/orders/tracking/{code}': {
      get: {
        summary: 'Get order tracking by code',
        parameters: [
          {
            name: 'code',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Tracking returned' },
        },
      },
    },
    '/prescriptions/upload': {
      post: {
        summary: 'Upload prescription file',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: {
                    type: 'string',
                    format: 'binary',
                  },
                },
                required: ['file'],
              },
            },
          },
        },
        responses: {
          '200': { description: 'Prescription uploaded' },
        },
      },
    },
  },
} as const;

function getClientKey(ip: string | undefined) {
  return ip?.trim() || 'unknown';
}

function resolveIp(forwardedFor: string | string[] | undefined, fallbackIp: string | undefined) {
  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return forwardedFor[0];
  }

  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0]?.trim();
  }

  return fallbackIp;
}

function rateLimitMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.path === '/healthy' || RATE_LIMIT_MAX_REQUESTS <= 0 || RATE_LIMIT_WINDOW_MS <= 0) {
    next();
    return;
  }

  const now = Date.now();
  const ip = resolveIp(req.headers['x-forwarded-for'], req.ip);
  const key = getClientKey(ip);
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    next();
    return;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    res.setHeader('Retry-After', String(retryAfterSeconds));
    res.status(429).json({
      message: 'Too many requests',
      limit: RATE_LIMIT_MAX_REQUESTS,
      windowMs: RATE_LIMIT_WINDOW_MS,
      retryAfterSeconds,
    });
    return;
  }

  current.count += 1;
  rateLimitStore.set(key, current);
  next();
}

app.use(rateLimitMiddleware);
app.get('/docs.json', (_req, res) => {
  res.json(openApiSpec);
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

const api = axios.create({
  baseURL: ORDER_SERVICE_URL,
  timeout: 10000,
});

const inventoryApi = axios.create({
  baseURL: INVENTORY_SERVICE_URL,
  timeout: 10000,
});

const paymentApi = axios.create({
  baseURL: PAYMENT_SERVICE_URL,
  timeout: 10000,
});

function formatProxyError(error: unknown, upstream: string) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    return {
      status: axiosError.response?.status ?? 502,
      payload: {
        message: 'Upstream service error',
        upstream,
        detail: axiosError.response?.data ?? axiosError.message,
      },
    };
  }

  return {
    status: 500,
    payload: {
      message: 'Internal gateway error',
    },
  };
}

app.get('/healthy', async (_req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

app.get('/order/healthy', async (_req, res) => {
  try {
    const response = await api.get('/healthy');
    res.status(response.status).json(response.data);
  } catch (error) {
    const proxyError = formatProxyError(error, ORDER_SERVICE_URL);
    res.status(proxyError.status).json(proxyError.payload);
  }
});

app.get('/inventory/healthy', async (_req, res) => {
  try {
    const response = await inventoryApi.get('/healthy');
    res.status(response.status).json(response.data);
  } catch (error) {
    const proxyError = formatProxyError(error, INVENTORY_SERVICE_URL);
    res.status(proxyError.status).json(proxyError.payload);
  }
});

app.get('/payment/healthy', async (_req, res) => {
  try {
    const response = await paymentApi.get('/healthy');
    res.status(response.status).json(response.data);
  } catch (error) {
    const proxyError = formatProxyError(error, PAYMENT_SERVICE_URL);
    res.status(proxyError.status).json(proxyError.payload);
  }
});

app.get('/products', async (req, res) => {
  try {
    const response = await api.get('/products', { params: req.query });
    res.status(response.status).json(response.data);
  } catch (error) {
    const proxyError = formatProxyError(error, ORDER_SERVICE_URL);
    res.status(proxyError.status).json(proxyError.payload);
  }
});

app.post('/products', async (req, res) => {
  try {
    const response = await api.post('/products', req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    const proxyError = formatProxyError(error, ORDER_SERVICE_URL);
    res.status(proxyError.status).json(proxyError.payload);
  }
});

app.post('/orders/checkout', async (req, res) => {
  try {
    const response = await api.post('/orders/checkout', req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    const proxyError = formatProxyError(error, ORDER_SERVICE_URL);
    res.status(proxyError.status).json(proxyError.payload);
  }
});

app.get('/orders/tracking/:code', async (req, res) => {
  try {
    const response = await api.get(`/orders/tracking/${encodeURIComponent(req.params.code)}`);
    res.status(response.status).json(response.data);
  } catch (error) {
    const proxyError = formatProxyError(error, ORDER_SERVICE_URL);
    res.status(proxyError.status).json(proxyError.payload);
  }
});

app.post('/prescriptions/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'file is required' });
      return;
    }

    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await api.post('/prescriptions/upload', form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    const proxyError = formatProxyError(error, ORDER_SERVICE_URL);
    res.status(proxyError.status).json(proxyError.payload);
  }
});

io.on('connection', (clientSocket) => {
  let upstreamSocket: Socket | null = null;

  const cleanup = () => {
    if (upstreamSocket) {
      upstreamSocket.disconnect();
      upstreamSocket = null;
    }
  };

  clientSocket.on('join_tracking', (payload: { trackingCode?: string }) => {
    const trackingCode = payload?.trackingCode;
    if (!trackingCode) {
      clientSocket.emit('tracking_error', { message: 'trackingCode is required' });
      return;
    }

    cleanup();

    upstreamSocket = ioClient(ORDER_SERVICE_WS_URL, { transports: ['websocket'] });

    upstreamSocket.on('connect', () => {
      upstreamSocket?.emit('join_tracking', { trackingCode });
    });

    upstreamSocket.on('tracking_update', (eventPayload) => {
      clientSocket.emit('tracking_update', eventPayload);
    });

    upstreamSocket.on('connect_error', (err) => {
      clientSocket.emit('tracking_error', {
        message: 'failed to connect to tracking stream',
        detail: err.message,
      });
    });
  });

  clientSocket.on('disconnect', () => {
    cleanup();
  });
});

async function startServerWithRetry() {
  for (let attempt = 1; attempt <= 8; attempt += 1) {
    try {
      await new Promise<void>((resolve, reject) => {
        server.once('error', reject);
        server.listen(PORT, () => {
          server.off('error', reject);
          resolve();
        });
      });

      // eslint-disable-next-line no-console
      console.log(`api-gateway-service running on ${PORT}`);
      // eslint-disable-next-line no-console
      console.log(`[api-gateway-service] ORDER_SERVICE_URL=${ORDER_SERVICE_URL}`);
      // eslint-disable-next-line no-console
      console.log(`[api-gateway-service] ORDER_SERVICE_WS_URL=${ORDER_SERVICE_WS_URL}`);
      // eslint-disable-next-line no-console
      console.log(`[api-gateway-service] INVENTORY_SERVICE_URL=${INVENTORY_SERVICE_URL}`);
      // eslint-disable-next-line no-console
      console.log(`[api-gateway-service] PAYMENT_SERVICE_URL=${PAYMENT_SERVICE_URL}`);

      const gracefulShutdown = () => {
        io.close();
        server.close(() => {
          process.exit(0);
        });
      };

      process.once('SIGINT', gracefulShutdown);
      process.once('SIGTERM', gracefulShutdown);
      return;
    } catch (error) {
      const message = (error as Error).message ?? '';
      if (!message.includes('EADDRINUSE') || attempt === 8) {
        throw error;
      }

      // eslint-disable-next-line no-console
      console.warn(`[api-gateway-service] port ${PORT} busy (attempt ${attempt}/8). Retrying in 1s...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

void startServerWithRetry();
