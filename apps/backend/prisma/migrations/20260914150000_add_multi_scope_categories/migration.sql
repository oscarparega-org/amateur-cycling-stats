-- Existing committed reference data is global. Organization-owned rows already
-- carry organization_id; event ownership is introduced here.
ALTER TABLE "race_categories" ADD COLUMN "event_id" TEXT;
ALTER TABLE "race_category_genders" ADD COLUMN "event_id" TEXT;
ALTER TABLE "race_category_lengths" ADD COLUMN "event_id" TEXT;

-- Normalize inconsistent legacy ownership before deriving scope from owners.
UPDATE "race_categories" SET "organization_id" = NULL WHERE "is_global" = true;
UPDATE "race_category_genders" SET "organization_id" = NULL WHERE "is_global" = true;
UPDATE "race_category_lengths" SET "organization_id" = NULL WHERE "is_global" = true;

ALTER TABLE "race_categories" DROP COLUMN "is_global";
ALTER TABLE "race_category_genders" DROP COLUMN "is_global";
ALTER TABLE "race_category_lengths" DROP COLUMN "is_global";

DROP INDEX "race_categories_name_key";
DROP INDEX "race_category_genders_name_key";
DROP INDEX "race_category_lengths_name_key";

ALTER TABLE "race_categories" ADD CONSTRAINT "race_categories_scope_check"
  CHECK (NOT ("organization_id" IS NOT NULL AND "event_id" IS NOT NULL));
ALTER TABLE "race_category_genders" ADD CONSTRAINT "race_category_genders_scope_check"
  CHECK (NOT ("organization_id" IS NOT NULL AND "event_id" IS NOT NULL));
ALTER TABLE "race_category_lengths" ADD CONSTRAINT "race_category_lengths_scope_check"
  CHECK (NOT ("organization_id" IS NOT NULL AND "event_id" IS NOT NULL));

CREATE UNIQUE INDEX "race_categories_global_name_key" ON "race_categories" (LOWER("name"))
  WHERE "organization_id" IS NULL AND "event_id" IS NULL;
CREATE UNIQUE INDEX "race_categories_organization_name_key" ON "race_categories" ("organization_id", LOWER("name"))
  WHERE "organization_id" IS NOT NULL AND "event_id" IS NULL;
CREATE UNIQUE INDEX "race_categories_event_name_key" ON "race_categories" ("event_id", LOWER("name"))
  WHERE "event_id" IS NOT NULL;

CREATE UNIQUE INDEX "race_category_genders_global_name_key" ON "race_category_genders" (LOWER("name"))
  WHERE "organization_id" IS NULL AND "event_id" IS NULL;
CREATE UNIQUE INDEX "race_category_genders_organization_name_key" ON "race_category_genders" ("organization_id", LOWER("name"))
  WHERE "organization_id" IS NOT NULL AND "event_id" IS NULL;
CREATE UNIQUE INDEX "race_category_genders_event_name_key" ON "race_category_genders" ("event_id", LOWER("name"))
  WHERE "event_id" IS NOT NULL;

CREATE UNIQUE INDEX "race_category_lengths_global_name_key" ON "race_category_lengths" (LOWER("name"))
  WHERE "organization_id" IS NULL AND "event_id" IS NULL;
CREATE UNIQUE INDEX "race_category_lengths_organization_name_key" ON "race_category_lengths" ("organization_id", LOWER("name"))
  WHERE "organization_id" IS NOT NULL AND "event_id" IS NULL;
CREATE UNIQUE INDEX "race_category_lengths_event_name_key" ON "race_category_lengths" ("event_id", LOWER("name"))
  WHERE "event_id" IS NOT NULL;

CREATE INDEX "race_categories_organization_id_idx" ON "race_categories"("organization_id");
CREATE INDEX "race_categories_event_id_idx" ON "race_categories"("event_id");
CREATE INDEX "race_category_genders_organization_id_idx" ON "race_category_genders"("organization_id");
CREATE INDEX "race_category_genders_event_id_idx" ON "race_category_genders"("event_id");
CREATE INDEX "race_category_lengths_organization_id_idx" ON "race_category_lengths"("organization_id");
CREATE INDEX "race_category_lengths_event_id_idx" ON "race_category_lengths"("event_id");

ALTER TABLE "race_categories" ADD CONSTRAINT "race_categories_event_id_fkey"
  FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "race_category_genders" ADD CONSTRAINT "race_category_genders_event_id_fkey"
  FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "race_category_lengths" ADD CONSTRAINT "race_category_lengths_event_id_fkey"
  FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
