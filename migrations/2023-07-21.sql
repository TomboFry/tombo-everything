BEGIN TRANSACTION;
ALTER TABLE games ADD COLUMN "url" TEXT;
COMMIT;
