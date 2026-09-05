-- Add tenant-scoped AI knowledge file ingestion metadata.
-- Safety review:
-- - No tables are dropped.
-- - No columns are dropped.
-- - No existing column types are changed.
-- - New required columns include defaults for existing rows.
-- - New indexes are non-unique and tenant-scoped.

ALTER TABLE "ai_knowledge_documents"
  ADD COLUMN "original_file_name" TEXT,
  ADD COLUMN "mime_type" TEXT,
  ADD COLUMN "size_bytes" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "sha256" TEXT,
  ADD COLUMN "status" TEXT NOT NULL DEFAULT 'INDEXED',
  ADD COLUMN "effective_date" TIMESTAMP(3),
  ADD COLUMN "expires_at" TIMESTAMP(3),
  ADD COLUMN "audience" TEXT NOT NULL DEFAULT 'TENANT_ADMIN',
  ADD COLUMN "chunk_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "indexed_at" TIMESTAMP(3),
  ADD COLUMN "last_error" TEXT,
  ADD COLUMN "uploaded_by_id" UUID,
  ADD COLUMN "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "archived_at" TIMESTAMP(3);

ALTER TABLE "ai_knowledge_chunks"
  ADD COLUMN "source_page" INTEGER,
  ADD COLUMN "source_section" TEXT,
  ADD COLUMN "metadata" JSONB NOT NULL DEFAULT '{}';

CREATE INDEX "ai_knowledge_documents_tenant_id_sha256_is_active_idx"
  ON "ai_knowledge_documents"("tenant_id", "sha256", "is_active");

CREATE INDEX "ai_knowledge_documents_tenant_id_status_idx"
  ON "ai_knowledge_documents"("tenant_id", "status");
