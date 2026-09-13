# Deployment

## Delivery model

GitHub Actions is the only deployment controller. Pull requests and `main` pushes run formatting, dependency audit,
strict TypeScript, linting, unit/integration tests, a production build, Playwright smoke coverage, Compose validation,
and production image builds. Coolify auto-deploy must remain disabled.

After every required check succeeds on `main`, the deployment job reconciles dedicated Coolify resources, pins the
application to `GITHUB_SHA`, starts that deployment, waits for its terminal status, and smoke-tests both public URLs.
The job records the URLs, commit, and Coolify deployment ID in the GitHub Actions summary.

## GitHub configuration

Create an environment named `development` and restrict it to `main`. The environment provides deployment protection
and records `DEV_URL`; keep the configuration itself at organization or repository scope as described below.

Organization variables shared by projects using the same Coolify installation:

- `COOLIFY_API_URL` — HTTPS base URL ending at the Coolify API root.
- `COOLIFY_SERVER_UUID` — destination server UUID.
- `DEPLOY_BASE_DOMAIN` — base domain without protocol or wildcard prefix.

Organization secrets shared by those projects:

- `COOLIFY_WRITE_TOKEN` — token allowed to create and update projects, environments, destinations, applications, and
  application environment variables.
- `COOLIFY_DEPLOY_TOKEN` — narrower token used to start deployments.

Repository variables specific to this project:

- `DEV_URL` — public frontend URL shown by GitHub Deployments.
- `EMAIL_FROM` — verified sender used by authentication email.

Repository secrets specific to this project:

- `RESEND_API_KEY` — production email provider credential.
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` — production OAuth credentials.

Do not duplicate these values in the `development` environment unless an environment-specific override is
intentional. GitHub Actions resolves the existing `vars.*` and `secrets.*` references from repository and organization
scope, while the job's `environment` declaration still applies the deployment protection rules.

Protect `main` and require the `Quality` and `Production images` checks. Do not permit direct pushes that bypass them.

## Coolify resources

`scripts/coolify.mjs` derives deterministic names and development domains from the GitHub repository ID and name. It
creates or reuses the project, environment, destination, and Compose application, then continuously reconciles the
exact commit, domains, destination, environment variables, and disabled auto-deploy setting.

Coolify generates `SERVICE_USER_POSTGRES`, `SERVICE_PASSWORD_64_POSTGRES`, and `SERVICE_BASE64_64_AUTH`. The deployment
controller writes public URLs and provider configuration. Do not upload an environment file containing secrets.

The Compose stack uses a one-shot `migrate` service that Coolify excludes from ongoing health evaluation. Backend
startup is gated on successful migrations, so application replicas never race to change the schema. Required roles
and global lookup rows are installed through immutable Prisma migrations; production does not run a separate seed
command. Both application containers expose health checks and run as non-root users.

## Production promotion

Create a separate production GitHub environment and separate Coolify project, database volume, credentials, domains,
and approval policy. Promote an already validated immutable SHA or image; do not rebuild a moving branch. Back up the
database and verify restoration before schema changes, run migrations once, smoke-test the release, and retain the
previous image for rollback.
