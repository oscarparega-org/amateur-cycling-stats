ALTER TABLE "events" ADD COLUMN "time_zone" TEXT NOT NULL DEFAULT 'UTC';

ALTER TABLE "races" ALTER COLUMN "is_public_visible" SET DEFAULT true;
ALTER TABLE "races" DROP COLUMN "name";

ALTER TABLE "race_results" DROP CONSTRAINT "race_results_race_id_fkey";
ALTER TABLE "race_results" ADD CONSTRAINT "race_results_race_id_fkey"
  FOREIGN KEY ("race_id") REFERENCES "races"("id") ON DELETE CASCADE ON UPDATE CASCADE;
