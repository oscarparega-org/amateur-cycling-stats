-- Better Auth 1.7 identifies accounts by the OpenID Connect issuer and subject.
ALTER TABLE "accounts" ADD COLUMN "issuer" TEXT;

UPDATE "accounts"
SET "issuer" = CASE
  WHEN "provider_id" = 'credential' THEN 'local:credential'
  WHEN "provider_id" = 'google' THEN 'https://accounts.google.com'
  ELSE 'local:oauth:' || "provider_id"
END;

ALTER TABLE "accounts" ALTER COLUMN "issuer" SET NOT NULL;

CREATE UNIQUE INDEX "accounts_issuer_account_id_key" ON "accounts"("issuer", "account_id");
