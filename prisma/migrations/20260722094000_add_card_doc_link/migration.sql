ALTER TABLE "Card" ADD COLUMN "linkedDocId" INTEGER REFERENCES "Doc"("id") ON DELETE SET NULL;
ALTER TABLE "Card" ADD COLUMN "linkedDocMode" TEXT;
CREATE INDEX "Card_linkedDocId_idx" ON "Card"("linkedDocId");
