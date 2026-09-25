import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { NodeSDK } from '@opentelemetry/sdk-node';

if (process.env.OTEL_DEBUG === 'true') {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
}

const traceExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:4318/v1/traces',
});

const sdk = new NodeSDK({
  serviceName: process.env.OTEL_SERVICE_NAME ?? 'inventory-service',
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()],
});

void sdk.start();

const shutdown = async () => {
  await sdk.shutdown();
};

process.once('SIGTERM', () => {
  void shutdown();
});

process.once('SIGINT', () => {
  void shutdown();
});