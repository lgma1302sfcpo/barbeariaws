CREATE TYPE "OrderStatus" AS ENUM (
  'PENDING',
  'PAID',
  'PREPARING',
  'READY_FOR_PICKUP',
  'SHIPPED',
  'DELIVERED',
  'CANCELED'
);

CREATE TYPE "PaymentStatus" AS ENUM (
  'UNPAID',
  'PAID',
  'FAILED',
  'REFUNDED'
);

CREATE TABLE "Product" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "priceCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'brl',
  "image" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "stripePriceId" TEXT,
  "weightKg" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
  "widthCm" DOUBLE PRECISION NOT NULL DEFAULT 10,
  "heightCm" DOUBLE PRECISION NOT NULL DEFAULT 4,
  "lengthCm" DOUBLE PRECISION NOT NULL DEFAULT 16,
  "stock" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Order" (
  "id" TEXT NOT NULL,
  "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
  "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
  "stripeSessionId" TEXT,
  "stripePaymentIntentId" TEXT,
  "customerName" TEXT,
  "customerEmail" TEXT,
  "customerPhone" TEXT,
  "cep" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "street" TEXT,
  "neighborhood" TEXT,
  "shippingName" TEXT,
  "shippingLine1" TEXT,
  "shippingLine2" TEXT,
  "shippingCity" TEXT,
  "shippingState" TEXT,
  "shippingPostalCode" TEXT,
  "shippingCountry" TEXT,
  "freightOptionId" TEXT NOT NULL,
  "freightType" TEXT NOT NULL,
  "freightLabel" TEXT NOT NULL,
  "freightAmountCents" INTEGER NOT NULL,
  "freightCurrency" TEXT NOT NULL DEFAULT 'brl',
  "freightEstimate" TEXT NOT NULL,
  "subtotalCents" INTEGER NOT NULL,
  "totalCents" INTEGER NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "paidAt" TIMESTAMP(3),
  CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrderItem" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "productId" TEXT,
  "name" TEXT NOT NULL,
  "image" TEXT,
  "priceCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'brl',
  "quantity" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Product_active_idx" ON "Product"("active");
CREATE INDEX "Product_createdAt_idx" ON "Product"("createdAt");
CREATE UNIQUE INDEX "Order_stripeSessionId_key" ON "Order"("stripeSessionId");
CREATE INDEX "Order_status_idx" ON "Order"("status");
CREATE INDEX "Order_paymentStatus_idx" ON "Order"("paymentStatus");
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

ALTER TABLE "OrderItem"
  ADD CONSTRAINT "OrderItem_orderId_fkey"
  FOREIGN KEY ("orderId")
  REFERENCES "Order"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "OrderItem"
  ADD CONSTRAINT "OrderItem_productId_fkey"
  FOREIGN KEY ("productId")
  REFERENCES "Product"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;
