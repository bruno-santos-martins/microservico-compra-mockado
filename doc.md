[ Web / Mobile Clients ]
           │
           ▼
┌───────────────────────────┐
│     API Gateway / BFF     │  ( Rate Limit, Roteamento)
└─────────────┬─────────────┘
              │ (HTTP / WebSocket)
              ▼
┌───────────────────────────┐
│       Order Service       │ ──(Emite: OrderPlaced)──┐
└───────────────────────────┘                         │
                                                      ▼
════════════════════════════════════════════════════════════════════════════
                  EVENT BROKER (RabbitMQ)
════════════════════════════════════════════════════════════════════════════
           │                         │                        │
           ▼                         ▼                        ▼
┌─────────────────────┐   ┌─────────────────────┐  ┌─────────────────────┐
│  Inventory Service  │   │   Payment Service   │  │ Fulfillment/Shipping│
│  (Estoque Multi-    │   │  (Split de Sellers, │  │ (Logística, Coleta, │
│   Seller: reserva e │   │   Taxa de Plataforma│  │  Transportadora)    │
│   baixa de itens)   │   │   e Adquirente)     │  │                     │
└──────────┬──────────┘   └──────────┬──────────┘  └──────────┬──────────┘
           │                         │                        │
  (StockReserved /          (PaymentApproved /       (TrackingUpdated /
   StockUnavailable)         PaymentFailed)           OrderDelivered)
           │                         │                        │
           └─────────────────────────┼────────────────────────┘
                                     │
                                     ▼
                    ═════════════════════════════════
                               EVENT BROKER
                    ═════════════════════════════════
                                     │
                                     ▼
                        ┌─────────────────────────┐
                        │   Notification Service  │
                        │ (WebSockets)           │
                        └─────────────────────────┘

1. [Order Service]
   Salva o pedido com status 'PENDING'
   -> Publica evento: 'order.placed'
        { orderId: "123", items: [{ sellerA: prod1 }, { sellerB: prod2 }], total: 500 }

2. [Inventory Service] (Consome 'order.placed')
   Verifica saldo dos sellers, separa os itens no estoque (reserva) e dá baixa na quantidade disponível.
   -> Se sucesso: Publica 'inventory.reserved'
   -> Se sem estoque: Publica 'inventory.out_of_stock' (Dispara cancelamento no Order Service)

3. [Payment Service] (Consome 'inventory.reserved')
   Processa o cartão/Pix e executa a divisão das quantias:
   - Plataforma: 10% (R$ 50)
   - Seller A: R$ 250
   - Seller B: R$ 200
   -> Se aprovado: Publica 'payment.approved'
   -> Se recusado: Publica 'payment.failed' (Inventory Service ouve e desfaz a reserva - Compensação)

4. [Fulfillment Service] (Consome 'payment.approved')
   Gera código de rastreio e emite ordens de coleta para os lojistas.
   -> Publica 'fulfillment.tracking_generated'

5. [Notification Service / Nest Gateway] (Consome 'fulfillment.tracking_generated')
   Empurra o novo status e o código via WebSocket diretamente para a tela do comprador.

A estrutura desenhada anteriormente é uma implementação enxuta desse exato padrão:

NestJS (Catálogo & Gateway): Atua na ponta consumidora e produtora inicial, gerenciando o catálogo e transmitindo via WebSocket o estado final da Saga.

RabbitMQ (O Broker de Eventos): Desacopla completamente a requisição do usuário do processamento das transações.

AdonisJS (Payment & Settlement Worker): Age como o worker financeiro isolado, consumindo eventos, calculando taxas/aprovações e emitindo os fatos de pagamento.

Inventory Worker: Dedicado a manter a consistência do estoque, garantindo que nenhum produto sem autorização regulatória ou saldo físico seja comercializado.

1. Modelo de Status Baseado nas Queixas ReaisOs status do domínio eliminam o "vazio" entre o pagamento e a entrega:Status no SistemaDescrição Visível ao UsuárioEvita qual reclamação?PAYMENT_CONFIRMEDPagamento aprovado. Código de rastreio emitido."Paguei e não recebi código de rastreio"PRESCRIPTION_VALIDATEDReceita e autorização Anvisa conferidas (com link para download no S3)."Retenção da receita / falta de acesso ao laudo"INTERNATIONAL_DISPATCHMedicamento despachado pelo fornecedor internacional.Insegurança sobre a saída da mercadoriaCUSTOMS_INSPECTIONEm fiscalização aduaneira / Receita e Anvisa (Aeroporto de Viracopos/Guarulhos)."Parou e ninguém me explica o motivo"DOMESTIC_TRANSITLiberado pela alfândega. Em transporte nacional para o seu endereço.Confusão entre transportadora e CorreiosDELIVEREDPacote entregue ao paciente.Conclusão do tratamento

4. Como esse design responde diretamente aos gaps da empresa
Código Imediato: O usuário não espera 72h por e-mail; ao concluir o checkout, a tela já redireciona para /rastreio?code=CK-2026-XXXX.

Receita Desbloqueada: O botão de download da receita médica fica visível na própria tela de rastreamento, eliminando atritos com o suporte.

Localização em Linguagem Humana: Cada checkpoint exibe o local físico exato (ex: "Receita Federal / Anvisa - Aeroporto de Viracopos"), evitando que o cliente veja apenas o status genérico "Aguardando postagem" dos Correios.

Sem F5: Novas etapas surgem instantaneamente graças ao gateway WebSocket no NestJS.

5. Para prototipar essa evolução gradual de status sem travar o sistema e mantendo a arquitetura orientada a eventos pura, a melhor abordagem é delegar essa simulação para um Scheduler/Simulator no AdonisJS (ou em um cron worker).

O Adonis consome a compra aprovada, agenda a esteira e, a cada intervalo configurável (ex: 60 segundos ou 10 segundos para demonstrar na entrevista), dispara o próximo evento no RabbitMQ. O NestJS consome esse evento, persiste no banco e empurra para a tela do React via Socket.IO.

meu-ecossistema/
├── docker-compose.yml
│
├── api-gateway-service/      # BFF: Roteamento HTTP, Upload passthrough e ponte WebSocket
│   ├── Dockerfile
│   └── package.json
│
├── order-catalog-service/    # NestJS: CRUD Produtos, Upload S3, Socket Gateway, Swagger
│   ├── Dockerfile
│   └── package.json
│
├── inventory-service/        # Worker: Escuta 'order.placed', reserva com Redis/Postgres
│   ├── Dockerfile
│   └── package.json
│
├── payment-service/          # AdonisJS: Escuta 'inventory.reserved', aprova e simula pipeline
│   ├── Dockerfile
│   └── package.json
│
└── frontend/                 # Vite + React + Tailwind: Catálogo, Carrinho, Timeline Live
    ├── Dockerfile
    └── package.json