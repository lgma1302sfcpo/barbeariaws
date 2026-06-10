# Barbershop WS Landing Page

Landing page em React + Vite + Tailwind CSS com backend Express, PostgreSQL, Prisma, Stripe Checkout e calculo de frete.

## Rodar Localmente

Instale as dependencias:

```bash
npm install
```

Crie o arquivo `.env` a partir de `.env.example` e configure:

```text
PORT=4242
APP_URL=http://localhost:5173
VITE_API_BASE_URL=
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/barbeariaws?schema=public
# Opcional para migrations no Supabase:
DIRECT_URL=
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CURRENCY=brl
AUTH_SECRET=troque-este-segredo-de-login
ADMIN_EMAIL=admin@seudominio.com
ADMIN_PASSWORD=troque-esta-senha
RESET_ADMIN_PASSWORD=false
ORIGIN_CEP=11700120
LOCAL_DELIVERY_CITY=Praia Grande
LOCAL_DELIVERY_FEE_CENTS=1000
CEP_TIMEOUT_MS=5000
FREIGHT_TIMEOUT_MS=7000
```

Suba o PostgreSQL local, se for usar Docker:

```bash
docker compose up -d
```

Crie as tabelas e cadastre o produto inicial:

```bash
npm run db:deploy
npm run db:seed
```

Em dois terminais:

```bash
npm run dev:server
npm run dev
```

URLs locais:

```text
Frontend: http://localhost:5173/
Admin:    http://localhost:5173/admin
Backend:  http://localhost:4242/api/health
```

## Banco De Dados

O banco usa PostgreSQL com Prisma.

Arquivos principais:

```text
prisma/schema.prisma
prisma/migrations/20260605153000_init/migration.sql
prisma/seed.js
```

Comandos:

```bash
npm run db:generate
npm run db:migrate
npm run db:deploy
npm run db:seed
npm run db:studio
```

Use `db:migrate` em desenvolvimento quando alterar o schema. Use `db:deploy` em producao.

### Aplicar migrations no Supabase

Se a producao retornar `The table public.User does not exist`, o banco foi criado mas as migrations ainda nao rodaram.

Para Supabase, use a connection string de **Session pooler** ou **Direct connection** para executar migrations. A URL de **Transaction pooler** e recomendada para o runtime no Vercel, mas nao para criar tabelas.

No terminal local, configure temporariamente:

```bash
DATABASE_URL="postgresql://postgres.ywafjucfozxfuyrjrgxp:SUA_SENHA@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"
ADMIN_EMAIL="barbershopws13@gmail.com"
ADMIN_PASSWORD="barbearia-ws"
RESET_ADMIN_PASSWORD="true"
```

Depois rode:

```bash
npm run db:deploy
npm run db:seed
```

No Vercel, use a URL de **Transaction pooler** como `DATABASE_URL`:

```text
postgresql://postgres.ywafjucfozxfuyrjrgxp:SUA_SENHA@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## Produtos

Produtos ficam na tabela `Product`.

Campos importantes:

- `priceCents`: preco em centavos.
- `weightKg`: peso para frete.
- `widthCm`, `heightCm`, `lengthCm`: medidas para frete.
- `stock`: opcional; se ficar vazio, o estoque e ilimitado.
- `stripePriceId`: opcional; se ficar vazio, o backend envia `price_data` para a Stripe.
- `active`: controla se aparece no site.

O site publico nao tem cadastro de produto. O painel admin fica em:

```text
http://localhost:5173/admin
```

Entre com a conta definida por `ADMIN_EMAIL` e `ADMIN_PASSWORD` no seed. O seed nao troca senha de admin existente, exceto quando `RESET_ADMIN_PASSWORD=true`.

Para usar imagem em produto, coloque o arquivo em:

```text
public/assets/products
```

Depois use no admin:

```text
/assets/products/nome-do-arquivo.webp
```

## Pedidos

Quando o cliente clica em pagar:

1. O backend calcula produto, frete e total.
2. Cria um pedido `PENDING` no PostgreSQL.
3. Cria uma sessao no Stripe Checkout.
4. Salva o `stripeSessionId` no pedido.
5. O webhook da Stripe marca o pedido como `PAID` quando o pagamento for confirmado.
6. Se o produto tiver estoque, o estoque e reduzido no pagamento confirmado.

O admin mostra:

- pedidos;
- status de pagamento;
- itens comprados;
- frete escolhido;
- endereco retornado pela Stripe;
- total;
- mudanca de status operacional.

O estoque e baixado apenas quando o pagamento e confirmado pela Stripe. A baixa e feita em transacao com checagem condicional de estoque para evitar dupla baixa em webhooks repetidos.

## Stripe

A chave `STRIPE_SECRET_KEY` fica apenas no backend. Nunca coloque chave secreta no React.

Checkout:

```text
POST /api/checkout
```

Webhook:

```text
POST /api/webhooks/stripe
```

No Dashboard da Stripe, crie um endpoint de webhook apontando para:

```text
https://seu-dominio.com/api/webhooks/stripe
```

Eventos recomendados:

```text
checkout.session.completed
checkout.session.async_payment_succeeded
checkout.session.async_payment_failed
checkout.session.expired
```

Copie o segredo do webhook para:

```text
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Frete

O backend calcula:

- Retirada na barbearia: R$ 0,00.
- Delivery em Praia Grande: valor de `LOCAL_DELIVERY_FEE_CENTS`.
- Envio para outras cidades/estados:
  - usa Melhor Envio se `MELHOR_ENVIO_TOKEN` estiver configurado;
  - caso contrario, usa `FREIGHT_FALLBACK_RATES_JSON`.

Para frete real por transportadora, configure:

```text
MELHOR_ENVIO_TOKEN=
MELHOR_ENVIO_BASE_URL=https://www.melhorenvio.com.br
```

Sem Melhor Envio, o site usa uma tabela simples por UF:

```text
FREIGHT_FALLBACK_RATES_JSON={"SP":1800,"RJ":2800,"MG":3000,"PR":2600,"SC":3200,"RS":3600,"default":4500}
```

## Producao

Em producao, configure as variaveis de ambiente no servidor:

```text
DATABASE_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
APP_URL=https://seu-dominio.com
VITE_API_BASE_URL=https://api.seu-dominio.com
AUTH_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD=
CORS_ORIGINS=
CORS_ALLOW_ALL=false
```

Se frontend e backend estiverem no mesmo dominio, deixe `VITE_API_BASE_URL` e `CORS_ORIGINS` vazios. No Vercel, qualquer origin e permitido automaticamente para evitar bloqueio em dominios de preview/customizados. Fora do Vercel, use `CORS_ORIGINS` ou `CORS_ALLOW_ALL=true` apenas se a API precisar aceitar multiplos dominios.

Depois rode:

```bash
npm run db:deploy
npm run build
npm start
```

Se precisar trocar a senha do admin pelo seed, rode uma vez com `RESET_ADMIN_PASSWORD=true` e depois volte para `false`.

## Dados Do Site

Edite `src/data/siteContent.js` para alterar:

- WhatsApp: `whatsappNumber` e `whatsappMessage`
- Instagram: `instagramUrl`
- Endereco e Google Maps: `address`, `mapsUrl` e `mapsEmbedUrl`
- Logo e midias: `logo`, `heroImage`, `video`, `galleryItems` e `comparison`
- Servicos e precos: array `services`
- Antes e depois: objeto `comparison`

Os arquivos publicos ficam em `public/assets`.
