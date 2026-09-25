# Microservices Demo - Click Cannabis

Projeto de arquitetura de microservicos com frontend React, API Gateway, servicos de dominio, mensageria e observabilidade.

## Visao Geral

A aplicacao e composta por:

- `frontend` (React + Vite)
- `api-gateway-service` (Express + Socket.IO)
- `order-catalog-service` (NestJS)
- `inventory-service` (NestJS worker)
- `payment-service` (Node/Express worker)
- Infra: PostgreSQL, Redis, RabbitMQ, LocalStack, Jaeger, Uptime Kuma

## Requisitos

- Docker Desktop ativo
- Docker Compose v2
- Windows/PowerShell: prefira `yarn.cmd` no lugar de `yarn`

## Subir o Projeto

Na raiz do repositorio:

```bash
yarn.cmd dev
```

O script:

1. sobe todos os containers (`docker compose up -d --build`)
2. tenta rodar migrations Prisma (`yarn migrate`)

## Desenvolvimento Local Sem Container (recomendado para produtividade)

Use este modo para rodar os apps no host e manter somente a infraestrutura em Docker.

```bash
yarn.cmd dev:local
```

O fluxo faz:

1. sobe apenas infra (`postgres`, `redis`, `rabbitmq`, `localstack`, `jaeger`) com `--wait`
2. para containers de aplicacao para reduzir consumo da maquina
3. inicia todos os apps locais com portas dedicadas (sem conflito com stack docker)

Portas no modo local:

- Frontend: `http://localhost:15173`
- API Gateway: `http://localhost:18080`
- Order Catalog: `http://localhost:13000`
- Inventory: `http://localhost:13001`
- Payment: `http://localhost:13333`

Portas no modo container (com `yarn.cmd dev`) permanecem:

- Frontend: `http://localhost:5173`
- API Gateway: `http://localhost:8080`
- Order Catalog: `http://localhost:3000`
- Inventory: `http://localhost:3001`
- Payment: `http://localhost:3333`

Observacao de performance:

- o `payment-service` nao roda mais `npm install` e `prisma generate` a cada `dev`, reduzindo tempo de bootstrap.
- quando precisar regenerar Prisma manualmente no payment, rode:

```bash
npm.cmd --prefix ./payment-service run dev:bootstrap
```

## Comandos Uteis

```bash
# sobe com logs anexados (foreground)
yarn.cmd dev:attach

# status dos servicos
yarn.cmd status

# parar sem remover
yarn.cmd stop

# derrubar stack
yarn.cmd down

# logs de tudo
yarn.cmd logs

# logs por servico
yarn.cmd logs:api
yarn.cmd logs:order
yarn.cmd logs:inventory
yarn.cmd logs:payment
yarn.cmd logs:frontend
```

## Links de Acesso

### Aplicacao

- Frontend: http://localhost:5173
- API Gateway: http://localhost:8080
- Order Catalog Service: http://localhost:3000
- Inventory Service: http://localhost:3001
- Payment Service: http://localhost:3333

### Infra e Observabilidade

- RabbitMQ Management: http://localhost:15672
- Jaeger (telemetria): http://localhost:16686
- Uptime Kuma (monitoramento de disponibilidade): http://localhost:3002
- LocalStack endpoint: http://localhost:4566

## Credenciais

### UIs

- Uptime Kuma (http://localhost:3002)
	- primeiro acesso: criar usuario e senha na tela inicial
	- ja sobe com acesso ao Docker Socket para monitorar containers
- RabbitMQ Management (http://localhost:15672)
	- usuario: `admin`
	- senha: `admin`
- Jaeger (http://localhost:16686)
	- sem autenticacao

### Banco e Mensageria

- PostgreSQL
	- host: `localhost`
	- porta: `5432`
	- usuario: `root`
	- senha: `password`
	- bancos: `order_catalog_db`, `inventory_db`, `payment_db`
- RabbitMQ AMQP
	- host: `localhost`
	- porta: `5672`
	- usuario: `admin`
	- senha: `admin`

### Credenciais usadas entre servicos (ambiente local)

- AWS/LocalStack (S3)
	- access key: `test`
	- secret key: `test`

### Portas tecnicas

- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- RabbitMQ AMQP: `localhost:5672`
- OTLP HTTP receiver (Jaeger): `localhost:4318`

## Telemetria (OpenTelemetry)

Todos os servicos backend foram instrumentados para exportar traces via OTLP HTTP para o Jaeger.

Configuracao usada nos servicos:

- variavel `OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger:4318/v1/traces`
- bootstrap de tracing carregado no startup de cada servico

Servicos com tracing ativo:

- `api-gateway-service`
- `order-catalog-service`
- `inventory-service`
- `payment-service`

Para validar:

1. gere trafego na aplicacao (ex.: listar produtos, checkout, tracking)
2. abra http://localhost:16686
3. selecione o service name e clique em "Find Traces"

## Saude da Aplicacao

### Endpoints de health/healthy

- API Gateway: http://localhost:8080/healthy
- API Gateway -> Order Catalog: http://localhost:8080/order/healthy
- API Gateway -> Inventory: http://localhost:8080/inventory/healthy
- API Gateway -> Payment: http://localhost:8080/payment/healthy
- Order Catalog: http://localhost:3000/healthy
- Inventory: http://localhost:3001/healthy
- Payment: http://localhost:3333/healthy
- Payment (legado): http://localhost:3333/health

### Verificar se algo caiu

Opcoes praticas:

1. `yarn.cmd status` para ver `Up/Exited/Restarting`
2. abrir Uptime Kuma em http://localhost:3002
3. seguir logs com `yarn.cmd logs` ou `yarn.cmd logs:<servico>`

Monitores sugeridos no Uptime Kuma (tipo HTTP):

- http://api-gateway-service:8080/healthy
- http://order-catalog-service:3000/healthy
- http://inventory-service:3001/healthy
- http://payment-service:3333/healthy
- http://frontend:5173

## Hot Reload no Desenvolvimento

O ambiente esta configurado com bind mount dos codigos (`./servico:/app`) e comandos `npm run dev` nos containers.

Isso permite:

- salvar arquivo
- recompilar/reiniciar automaticamente
- acompanhar no log do servico

Fluxo recomendado:

1. `yarn.cmd dev`
2. em outro terminal: `yarn.cmd logs:api` (ou outro servico)
3. editar e salvar arquivo
4. conferir restart/hot reload no log

## Observacoes sobre Migrations

O script `migrate` roda `prisma migrate deploy` com fallback por servico.

Em bancos ja populados sem historico de migration, o Prisma pode retornar `P3005` (baseline). Nesses casos o script imprime "migrate skipped" e segue o fluxo.

