BEGIN TRANSACTION;
ALTER TABLE films ADD COLUMN "review" TEXT;
COMMIT;
