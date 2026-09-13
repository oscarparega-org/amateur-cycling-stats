import assert from 'node:assert/strict';
import test from 'node:test';
import {
  cleanupTarget,
  composeArguments,
  deriveWorktreeIdentity,
  parseEnv,
  selectPortSlot,
  serializeEnv,
  shortHash,
  slugify,
  validateWorktreeConfig
} from './worktree.mjs';

function validConfig(root) {
  const identity = deriveWorktreeIdentity(root);
  return {
    WORKTREE_CONFIG_VERSION: '1',
    WORKTREE_ID: identity.id,
    COMPOSE_PROJECT_NAME: identity.projectName,
    POSTGRES_USER: 'acs',
    POSTGRES_PASSWORD: 'local-secret',
    POSTGRES_DB: identity.databaseName,
    POSTGRES_PORT: '55432',
    API_PORT: '3100',
    PORT: '3100',
    WEB_PORT: '5200',
    DATABASE_URL: `postgresql://acs:local-secret@localhost:55432/${identity.databaseName}`,
    FRONTEND_URL: `http://${identity.hostname}:5200`,
    TRUSTED_ORIGINS: `http://${identity.hostname}:5200`,
    BETTER_AUTH_URL: `http://api.${identity.hostname}:3100`,
    NEXT_PUBLIC_API_URL: `http://api.${identity.hostname}:3100`,
    PUBLIC_API_URL: `http://api.${identity.hostname}:3100`,
    BETTER_AUTH_SECRET: 'a'.repeat(32)
  };
}

test('slugify creates Compose- and hostname-safe identifiers', () => {
  assert.equal(slugify('Feature/My New Race!'), 'feature-my-new-race');
  assert.equal(slugify('---'), 'worktree');
  assert.ok(slugify('a'.repeat(50)).length <= 30);
});

test('worktree hashes are stable and bounded', () => {
  assert.equal(shortHash('/tmp/example'), shortHash('/tmp/example'));
  assert.match(shortHash('/tmp/example'), /^[a-f0-9]{8}$/);
});

test('environment serialization round trips generated values', () => {
  const values = { COMPOSE_PROJECT_NAME: 'acs-test', API_PORT: '3100', SECRET: 'abc_123-XYZ' };
  assert.deepEqual(parseEnv(serializeEnv(values)), values);
});

test('worktree identity and cleanup project derive from the absolute path', () => {
  const root = '/tmp/amateur-cycling-stats/Feature One';
  const identity = deriveWorktreeIdentity(root);
  assert.match(identity.id, /^feature-one-[a-f0-9]{8}$/);
  assert.equal(cleanupTarget(root, null).projectName, identity.projectName);
  assert.equal(cleanupTarget(root, null).envPath, undefined);
});

test('configuration validation rejects copied identities and shared databases', () => {
  const root = '/tmp/amateur-cycling-stats/feature-one';
  const config = validConfig(root);
  assert.equal(validateWorktreeConfig(root, config), config);
  assert.throws(
    () => validateWorktreeConfig(root, { ...config, WORKTREE_ID: 'another-worktree-deadbeef' }),
    /does not belong to this worktree/
  );
  assert.throws(
    () =>
      validateWorktreeConfig(root, { ...config, DATABASE_URL: 'postgresql://acs:local-secret@localhost:55432/shared' }),
    /does not match its isolated PostgreSQL configuration/
  );
});

test('Compose lifecycle commands pin the intended project and environment', () => {
  assert.deepEqual(composeArguments('acs-feature-12345678', ['down', '--volumes'], '/tmp/feature/.env.worktree'), [
    'compose',
    '--project-name',
    'acs-feature-12345678',
    '--env-file',
    '/tmp/feature/.env.worktree',
    'down',
    '--volumes'
  ]);
});

test('port selection skips reserved and occupied slots', async () => {
  const first = await selectPortSlot('stable identity', new Set(), async () => true);
  const used = new Set([first.api, first.web, first.postgres]);
  const second = await selectPortSlot('stable identity', used, async () => true);
  assert.equal(second.api, first.api + 1);
  const third = await selectPortSlot('another identity', new Set(), async (port) => port !== first.api);
  assert.notEqual(third.api, first.api);
});
