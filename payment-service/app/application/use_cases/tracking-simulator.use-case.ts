import type { RabbitMQProducer } from '../../infra/messaging/rabbitmq.producer';

interface PaymentApprovedPayload {
  orderId: string;
  trackingCode: string;
}

interface TrackingStage {
  stage: string;
  title: string;
  details: string;
  location: string;
}

const stages: TrackingStage[] = [
  {
    stage: 'PAYMENT_CONFIRMED',
    title: 'Pagamento Confirmado',
    details: 'Pagamento aprovado pelo adquirente.',
    location: 'Gateway Financeiro',
  },
  {
    stage: 'ANVISA_ANALYSIS',
    title: 'Submissao Anvisa',
    details: 'Documentacao clinica em analise regulatoria.',
    location: 'Anvisa - Protocolo Digital',
  },
  {
    stage: 'INTERNATIONAL_DISPATCH',
    title: 'Despacho Exterior',
    details: 'Pedido preparado para embarque internacional.',
    location: 'Centro Internacional do Fornecedor',
  },
  {
    stage: 'CUSTOMS_INSPECTION',
    title: 'Em Fiscalizacao Aduaneira',
    details: 'Carga desembarcada aguardando liberacao da Anvisa.',
    location: 'Aeroporto de Viracopos - Campinas/SP',
  },
  {
    stage: 'DOMESTIC_TRANSIT',
    title: 'Em Transito Nacional',
    details: 'Carga liberada e em deslocamento para entrega final.',
    location: 'Malha Logistica Nacional',
  },
  {
    stage: 'DELIVERED',
    title: 'Entregue',
    details: 'Entrega finalizada no endereco do paciente.',
    location: 'Endereco do Paciente',
  },
];

export class TrackingSimulatorUseCase {
  constructor(private readonly producer: RabbitMQProducer) {}

  async execute(payload: PaymentApprovedPayload): Promise<void> {
    const intervalSeconds = Number(process.env.TRACKING_STAGE_INTERVAL_SECONDS ?? 60);

    stages.forEach((item, index) => {
      setTimeout(() => {
        void this.producer.publish('tracking.updates', {
          trackingCode: payload.trackingCode,
          orderId: payload.orderId,
          stage: item.stage,
          title: item.title,
          details: item.details,
          location: item.location,
          timestamp: new Date().toISOString(),
        });
      }, index * intervalSeconds * 1000);
    });
  }
}
