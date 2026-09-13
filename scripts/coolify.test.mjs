import assert from 'node:assert/strict';
import test from 'node:test';
import { buildDeploymentConfig, CoolifyClient, deployAndWait, reconcile, smokeTest } from './coolify.mjs';

const environment = {
  GITHUB_REPOSITORY: 'example/amateur-cycling-stats',
  GITHUB_REPOSITORY_ID: '12345',
  GITHUB_SHA: 'abc123',
  GITHUB_REF_NAME: 'main',
  COOLIFY_API_URL: 'https://coolify.example.test/api/v1/',
  COOLIFY_SERVER_UUID: 'server-1',
  DEPLOY_BASE_DOMAIN: 'example.test',
  COOLIFY_WRITE_TOKEN: 'write-token',
  COOLIFY_DEPLOY_TOKEN: 'deploy-token',
  EMAIL_FROM: 'ACS <noreply@example.test>',
  RESEND_API_KEY: 'resend-secret',
  GOOGLE_CLIENT_ID: 'google-client',
  GOOGLE_CLIENT_SECRET: 'google-secret'
};

test('derives deterministic development resources and exact commit', () => {
  const config = buildDeploymentConfig(environment);
  assert.equal(config.projectName, 'amateur-cycling-stats');
  assert.equal(config.environmentName, 'development');
  assert.equal(config.networkName, 'repo-12345-development');
  assert.equal(config.frontendUrl, 'https://amateur-cycling-stats-dev.example.test');
  assert.equal(config.apiPublicUrl, 'https://amateur-cycling-stats-api-dev.example.test');
  assert.equal(config.sha, 'abc123');
});

test('rejects malformed or incomplete deployment configuration', () => {
  assert.throws(
    () => buildDeploymentConfig({ ...environment, GITHUB_REPOSITORY: 'example/amateur_stats' }),
    /DNS label/
  );
  assert.throws(() => buildDeploymentConfig({ ...environment, GITHUB_SHA: '' }), /GITHUB_SHA/);
  assert.throws(() => buildDeploymentConfig({ ...environment, COOLIFY_API_URL: 'http://coolify.test' }), /HTTPS/);
});

test('Coolify errors do not leak response bodies or tokens', async () => {
  const client = new CoolifyClient(
    buildDeploymentConfig(environment),
    async () => new Response('write-token secret body', { status: 401 })
  );
  await assert.rejects(
    () => client.request('/projects'),
    (error) => !error.message.includes('write-token') && !error.message.includes('secret body')
  );
});

test('reconciliation pins an existing application to the tested SHA', async () => {
  const config = buildDeploymentConfig(environment);
  const calls = [];
  const responses = new Map([
    ['/projects', [{ uuid: 'project-1', name: config.projectName }]],
    ['/projects/project-1', { environments: [{ uuid: 'env-1', name: config.environmentName }] }],
    ['/servers/server-1/destinations', [{ uuid: 'destination-1', network: config.networkName }]],
    [
      `/applications?tag=${config.resourceTag}`,
      [{ uuid: 'app-1', git_repository: `https://github.com/${config.repository}` }]
    ]
  ]);
  const client = {
    request: async (path, options = {}) => {
      calls.push([path, options.method || 'GET', options.body]);
      if (path === '/applications/app-1' || path === '/applications/app-1/envs/bulk') return { uuid: 'app-1' };
      return responses.get(path);
    }
  };
  const result = await reconcile(client, config);
  assert.equal(result.application.uuid, 'app-1');
  const update = calls.find(([path]) => path === '/applications/app-1');
  assert.equal(update[2].git_commit_sha, 'abc123');
  assert.equal(update[2].is_auto_deploy_enabled, false);
  assert.equal(calls.filter(([, method]) => method === 'POST').length, 0);
});

test('deployment waits for its Coolify operation to finish', async () => {
  let statusChecks = 0;
  const client = {
    request: async (path, options) => {
      if (path === '/deploy') {
        assert.deepEqual(options.body, { uuid: 'app-1', force: false });
        return { deployment_uuid: 'deployment-1' };
      }
      statusChecks += 1;
      return { status: statusChecks > 1 ? 'finished' : 'in_progress' };
    }
  };
  const result = await deployAndWait(client, { uuid: 'app-1' }, { pollMs: 0, timeoutMs: 100 });
  assert.equal(result.deploymentUuid, 'deployment-1');
});

test('smoke test accepts a healthy endpoint', async () => {
  await smokeTest('https://example.test/health', 'API', async () => new Response('ok', { status: 200 }));
});
