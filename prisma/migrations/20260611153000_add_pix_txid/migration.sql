ALTER TABLE "Order" ADD COLUMN "pixTxid" TEXT;

CREATE UNIQUE INDEX "Order_pixTxid_key" ON "Order"("pixTxid");
