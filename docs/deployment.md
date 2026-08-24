# Deployment

## Delivery model

GitHub-hosted CI runs after a commit is pushed. Use pull requests and required status checks to prevent unvalidated changes from reaching `main`; use the deployment job to prevent Coolify from deploying a `main` commit until the checks for that exact commit pass.

The development flow is:

1. Open a pull request into `main`.
2. GitHub Actions runs the `Quality` and `Production images` jobs.
3. Branch protection permits the merge only after both jobs pass.
4. The same workflow validates the resulting `main` commit.
5. The `Deploy development` job calls Coolify only after both jobs pass.

The workflow cancels an older run when a newer commit reaches the same branch, reducing the chance that an obsolete commit triggers a deployment.

## GitHub configuration

Create a GitHub environment named `development` and restrict its deployment branch to `main`.

Add these environment secrets:

- `COOLIFY_API_TOKEN` — a Coolify API token with Deploy permission.
- `COOLIFY_DEV_WEBHOOK` — the deployment webhook from the Coolify development resource.

Add `DEV_URL` as an environment variable containing the public frontend URL.

Protect `main`, require pull requests, and require the `Quality` and `Production images` status checks. Do not allow direct pushes that bypass these checks.

## Coolify development resource

Create a development environment and a Docker Compose application with:

- Repository branch: `main`
- Base directory: `/`
- Compose file: `/docker-compose.coolify.yml`
- Auto Deploy: disabled

Auto Deploy must be disabled because the GitHub Actions deployment job is the only deployment trigger. Otherwise Coolify starts building immediately on every push and bypasses the CI gate.

Configure the values listed in `.env.coolify.example` in Coolify. Do not upload an environment file containing secrets. Assign development domains to the `frontend` and `backend` services on container port `3000`, for example `dev.example.com` and `api-dev.example.com`.

The Compose file deliberately defines no custom networks. Coolify creates the application network and attaches its reverse proxy to it; service names such as `backend` and `postgres` remain resolvable inside the stack.

## Current CI coverage and gaps

The initial gate verifies dependency installation, strict TypeScript, configured lint scripts, configured tests, application builds, Compose parsing, and both production Docker images.

The following must be completed before treating the same pipeline as production-ready:

- Replace backend/shared placeholder lint scripts with real linting.
- Add frontend automated tests. The current frontend test script is a placeholder.
- Stabilize and enable the Docker-backed backend end-to-end tests before requiring them as a production check.
- Move database migration execution out of the backend container startup path before enabling multiple replicas or rolling production deployments.
- Configure scheduled PostgreSQL backups and verify a restore procedure.
- Add post-deployment smoke checks and external uptime/error monitoring.
- Define a rollback procedure. For production, prefer immutable images tagged with the Git commit SHA rather than rebuilding a moving branch.
- Use a separate Coolify production environment, database volume, domains, credentials, API token, and deployment approval. Never promote the development database or secrets.

## Promotion to production

Keep development deployment automatic after `main` passes. Add production later as a separate GitHub environment with required approval. Promote the already validated commit/image rather than running an unrelated build, then run migrations once, deploy, verify health, and retain the previous image for rollback.
