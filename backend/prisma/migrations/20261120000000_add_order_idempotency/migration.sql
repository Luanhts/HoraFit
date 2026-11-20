CREATE TYPE "IdempotencyStatus" AS ENUM ('PROCESSING', 'COMPLETED');

CREATE TABLE "idempotency_requests" (
    "id" SERIAL NOT NULL,
    "scope" VARCHAR(40) NOT NULL,
    "keyHash" CHAR(64) NOT NULL,
    "payloadHash" CHAR(64) NOT NULL,
    "status" "IdempotencyStatus" NOT NULL DEFAULT 'PROCESSING',
    "httpStatus" INTEGER NOT NULL DEFAULT 201,
    "orderId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "idempotency_requests_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "idempotency_requests_scope_keyHash_key"
    ON "idempotency_requests"("scope", "keyHash");

CREATE UNIQUE INDEX "idempotency_requests_orderId_key"
    ON "idempotency_requests"("orderId");

ALTER TABLE "idempotency_requests"
    ADD CONSTRAINT "idempotency_requests_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "orders"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
