BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS "migrations" (
	"migration_name" TEXT NOT NULL UNIQUE,
	"created_at"     TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
