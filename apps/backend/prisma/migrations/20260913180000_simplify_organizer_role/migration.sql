-- Collapse organizer ownership/staff distinctions into one organization-scoped role.
INSERT INTO "roles" ("id", "name")
VALUES ('10000000-0000-4000-8000-000000000006', 'ORGANIZER')
ON CONFLICT ("name") DO NOTHING;

UPDATE "users"
SET "role_id" = (SELECT "id" FROM "roles" WHERE "name" = 'ORGANIZER')
WHERE "role_id" IN (
  SELECT "id"
  FROM "roles"
  WHERE "name" IN ('ORGANIZER_OWNER', 'ORGANIZER_STAFF')
);

DELETE FROM "roles"
WHERE "name" IN ('ORGANIZER_OWNER', 'ORGANIZER_STAFF');

-- PostgreSQL enum values cannot be removed, so replace the invitation enum.
CREATE TYPE "InvitationRoleType_new" AS ENUM ('ORGANIZER');

ALTER TABLE "organization_invitations"
ALTER COLUMN "role_type" TYPE "InvitationRoleType_new"
USING ('ORGANIZER'::"InvitationRoleType_new");

DROP TYPE "InvitationRoleType";
ALTER TYPE "InvitationRoleType_new" RENAME TO "InvitationRoleType";
