# microservico-compra-mockado

## Microservices Demo - Click Cannabis

Projeto de arquitetura de microservicos com frontend React, API Gateway, servicos de dominio, mensageria e observabilidade.

Cada microsservico possui seu proprio PostgreSQL e volume Docker. Redis, RabbitMQ, LocalStack, Jaeger e Uptime Kuma ficam na infraestrutura compartilhada.

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

O script sobe a infraestrutura compartilhada, os tres bancos, builda as aplicacoes e aplica o schema Prisma nos bancos.

## Desenvolvimento Local Sem Container (recomendado para produtividade)

Use este modo para rodar os apps no host e manter somente a infraestrutura em Docker.

```bash
yarn.cmd dev:local
```

O fluxo faz:

1. sobe a infraestrutura compartilhada e os tres bancos com `--wait`
2. para containers de aplicacao para reduzir consumo da maquina
3. inicia todos os apps locais com portas dedicadas (sem conflito com stack docker)

Portas no modo local:

- Frontend: `http://localhost:15173`
- API Gateway: `http://localhost:18080`
- Order Catalog: `http://localhost:13000`
- Inventory: `http://localhost:13001`
- Payment: `http://localhost:13333`
- PostgreSQL Orders: `localhost:5432`
- PostgreSQL Inventory: `localhost:5433`
- PostgreSQL Payment: `localhost:5434`

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

### Subida Isolada de Infraestrutura e Bancos

Na raiz do repositorio, crie primeiro a rede compartilhada e inicie a infraestrutura:

```powershell
docker compose -f docker-compose.infra.yml up -d --wait
```

Inicie cada banco independentemente (ou execute todos):

```powershell
docker compose -f order-catalog-service/docker-compose.db.yml up -d --wait
docker compose -f inventory-service/docker-compose.db.yml up -d --wait
docker compose -f payment-service/docker-compose.db.yml up -d --wait
```

Para iniciar todos os bancos pelo script da raiz: `yarn.cmd db:up`.

Os exemplos de conexao estao em `order-catalog-service/.env.example`, `inventory-service/.env.example` e `payment-service/.env.example`. Copie o exemplo para `.env` somente se ainda nao existir; se ja houver um `.env` local, ajuste nele a URL do banco correspondente sem substituir as demais configuracoes.

Nota de compatibilidade: o CRUD atual de `order-catalog-service` e `inventory-service` ainda usa TypeORM com `synchronize: true`; os schemas Prisma acima definem o alvo das migrations Prisma, mas ainda nao substituem os models/repositorios TypeORM desses servicos. A conversao dos CRUDs para Prisma precisa ser feita separadamente antes de tratar as migrations Prisma como schema de runtime desses dois servicos.

Com os bancos iniciados, rode a migration interativamente em cada projeto. `db push` e uma alternativa sem historico de migrations:

```powershell
Set-Location order-catalog-service
npx prisma migrate dev --name init
# Alternativa: npx prisma db push
Set-Location ..

Set-Location inventory-service
npx prisma migrate dev --name init
# Alternativa: npx prisma db push
Set-Location ..

Set-Location payment-service
npx prisma migrate dev --name init
# Alternativa: npx prisma db push
Set-Location ..
```

Os comandos tambem estao disponiveis como scripts: `npm.cmd run prisma:migrate` ou `npm.cmd run prisma:push`, executados dentro da pasta de cada servico.

Para build e execucao containerizada das aplicacoes, use `yarn.cmd containers:up`; os Compose dos bancos e da infraestrutura permanecem separados.

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

### Bancos por Microsservico e Mensageria

- PostgreSQL Orders
	- host: `localhost`
	- porta: `5432`
	- usuario: `root`
	- senha: `password`
	- banco: `order_catalog_db`
- PostgreSQL Inventory
	- host: `localhost`
	- porta: `5433`
	- usuario: `root`
	- senha: `password`
	- banco: `inventory_db`
- PostgreSQL Payment
	- host: `localhost`
	- porta: `5434`
	- usuario: `root`
	- senha: `password`
	- banco: `payment_db`
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

- PostgreSQL Orders: `localhost:5432`
- PostgreSQL Inventory: `localhost:5433`
- PostgreSQL Payment: `localhost:5434`
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

