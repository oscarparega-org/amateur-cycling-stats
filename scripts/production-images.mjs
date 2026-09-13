import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const composePath = resolve(repositoryRoot, 'docker-compose.coolify.yml');
const compose = (await readFile(composePath, 'utf8')).replace(/^\s*exclude_from_hc:\s*true\s*$/gm, '');
const environment = {
  ...process.env,
  SERVICE_USER_POSTGRES: process.env.SERVICE_USER_POSTGRES ?? 'acs_ci',
  SERVICE_PASSWORD_64_POSTGRES: process.env.SERVICE_PASSWORD_64_POSTGRES ?? 'ci-only-placeholder',
  SERVICE_BASE64_64_AUTH: process.env.SERVICE_BASE64_64_AUTH ?? 'ci-only-secret-with-at-least-32-characters',
  FRONTEND_URL: process.env.FRONTEND_URL ?? 'https://dev.example.invalid',
  PUBLIC_API_URL: process.env.PUBLIC_API_URL ?? 'https://api-dev.example.invalid',
  TRUSTED_ORIGINS: process.env.TRUSTED_ORIGINS ?? 'https://dev.example.invalid',
  RESEND_API_KEY: process.env.RESEND_API_KEY ?? 're_ci_placeholder',
  EMAIL_FROM: process.env.EMAIL_FROM ?? 'noreply@example.invalid',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? 'ci.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? 'ci-only-placeholder'
};

function runCompose(args) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn('docker', ['compose', '--project-directory', repositoryRoot, '-f', '-', ...args], {
      cwd: repositoryRoot,
      env: environment,
      stdio: ['pipe', 'inherit', 'inherit']
    });

    child.stdin.end(compose);
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolvePromise();
        return;
      }
      reject(new Error(`docker compose exited with ${signal ? `signal ${signal}` : `code ${code}`}`));
    });
  });
}

try {
  await runCompose(['config', '--quiet']);
  for (const service of ['migrate', 'backend', 'frontend']) {
    await runCompose(['build', service]);
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Production image verification failed: ${message}`);
  process.exitCode = 1;
}
