import { spawn } from 'node:child_process';
import process from 'node:process';
import { createServer } from 'node:net';
import { GenericContainer, Wait } from 'testcontainers';

const databaseName = 'acs_browser_test';
const databaseUser = 'acs_browser_test';
const databasePassword = 'acs_browser_test';

function run(command, args, environment) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env: environment,
      stdio: 'inherit'
    });

    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} exited with ${signal ? `signal ${signal}` : `code ${code}`}`));
    });
  });
}

function validateTestDatabaseUrl(value) {
  const url = new URL(value);
  if (!url.pathname.endsWith('_test')) {
    throw new Error('TEST_DATABASE_URL must reference a disposable database ending in _test.');
  }
  return value;
}

function availablePort() {
  return new Promise((resolvePromise, reject) => {
    const server = createServer();
    server.unref();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close();
        reject(new Error('Could not allocate a browser-test port.'));
        return;
      }
      server.close((error) => (error ? reject(error) : resolvePromise(address.port)));
    });
  });
}

let postgres;

try {
  let databaseUrl = process.env.TEST_DATABASE_URL;

  if (databaseUrl) {
    databaseUrl = validateTestDatabaseUrl(databaseUrl);
  } else {
    console.log('TEST_DATABASE_URL is not set; starting a disposable PostgreSQL container.');
    postgres = await new GenericContainer('postgres:16-alpine')
      .withEnvironment({
        POSTGRES_DB: databaseName,
        POSTGRES_USER: databaseUser,
        POSTGRES_PASSWORD: databasePassword
      })
      .withExposedPorts(5432)
      .withHealthCheck({
        test: ['CMD-SHELL', `pg_isready --username ${databaseUser} --dbname ${databaseName}`],
        interval: 250,
        timeout: 1_000,
        retries: 1_000
      })
      .withWaitStrategy(Wait.forAll([Wait.forHealthCheck(), Wait.forListeningPorts()]))
      .withStartupTimeout(300_000)
      .start();

    databaseUrl = `postgresql://${databaseUser}:${databasePassword}@${postgres.getHost()}:${postgres.getMappedPort(5432)}/${databaseName}`;
  }

  const environment = {
    ...process.env,
    TEST_DATABASE_URL: databaseUrl,
    BROWSER_TEST_API_PORT: process.env.BROWSER_TEST_API_PORT ?? String(await availablePort()),
    BROWSER_TEST_WEB_PORT: process.env.BROWSER_TEST_WEB_PORT ?? String(await availablePort())
  };
  await run('npx', ['prisma', 'migrate', 'deploy', '--schema', 'apps/backend/prisma/schema.prisma'], {
    ...environment,
    DATABASE_URL: databaseUrl
  });
  await run('npx', ['playwright', 'test', ...process.argv.slice(2)], environment);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Browser verification failed: ${message}`);
  if (!process.env.TEST_DATABASE_URL && message.includes('container runtime')) {
    console.error('Start Docker or Podman, then rerun npm run test:browser.');
  }
  process.exitCode = 1;
} finally {
  await postgres?.stop();
}
