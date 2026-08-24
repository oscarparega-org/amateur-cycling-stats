import { execFileSync } from 'node:child_process';
import { once } from 'node:events';
import net from 'node:net';
import { generateKeyPair, exportJWK, SignJWT } from 'jose';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import makeFetchCookie from 'fetch-cookie';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import type { Server } from 'node:http';

type SentEmail = { to: string; subject: string; html: string };

let postgres: StartedPostgreSqlContainer;
let httpServer: Server;
let baseUrl: string;
let prisma: import('@prisma/client').PrismaClient;
const outbox: SentEmail[] = [];
let googleEmail = 'google-new@example.com';
let googleNonce: string | undefined;
let googlePrivateKey: CryptoKey;
let googlePublicJwk: JsonWebKey;

const googleMocks = setupServer(
  http.post('https://oauth2.googleapis.com/token', async () => {
    const now = Math.floor(Date.now() / 1000);
    const idToken = await new SignJWT({
      sub: `google-${googleEmail}`,
      email: googleEmail,
      email_verified: true,
      name: 'Google Cyclist',
      picture: 'https://example.com/avatar.png',
      nonce: googleNonce
    })
      .setProtectedHeader({ alg: 'RS256', kid: 'test-google-key' })
      .setIssuer('https://accounts.google.com')
      .setAudience('google-test-client')
      .setIssuedAt(now)
      .setExpirationTime(now + 3600)
      .sign(googlePrivateKey);

    return HttpResponse.json({
      access_token: 'google-access-token',
      token_type: 'Bearer',
      expires_in: 3600,
      id_token: idToken,
      scope: 'openid email profile'
    });
  }),
  http.get('https://www.googleapis.com/oauth2/v3/certs', () => HttpResponse.json({ keys: [googlePublicJwk] }))
);

async function availablePort(): Promise<number> {
  const server = net.createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Could not allocate an E2E port');
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  return address.port;
}

function client() {
  return makeFetchCookie(fetch);
}

async function post(fetcher: typeof fetch, path: string, body?: unknown) {
  return fetcher(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: baseUrl },
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: 'manual'
  });
}

function latestEmail(subject: RegExp, recipient?: string) {
  const email = [...outbox].reverse().find((item) => subject.test(item.subject) && (!recipient || item.to === recipient));
  if (!email) throw new Error(`No email matching ${subject} was captured`);
  return email;
}

function emailUrl(email: SentEmail) {
  const match = email.html.match(/href="([^"]+)"/);
  if (!match) throw new Error('Captured email did not contain a link');
  return match[1];
}

async function registerAndVerify(email: string, password = 'password1234') {
  const browser = client();
  const signup = await post(browser, '/api/auth/sign-up/email', {
    name: 'Email Cyclist', email, password, callbackURL: `${baseUrl}/verified`
  });
  expect(signup.status).toBe(200);
  const verification = latestEmail(/Verify your email/, email);
  const verify = await browser(emailUrl(verification), { redirect: 'manual' });
  expect(verify.status).toBe(302);
  return browser;
}

async function signInWithGoogle(browser: ReturnType<typeof client>, email: string) {
  googleEmail = email;
  const start = await post(browser, '/api/auth/sign-in/social', {
    provider: 'google', callbackURL: `${baseUrl}/google-complete`
  });
  expect(start.status).toBe(200);
  const payload = await start.json() as { url: string };
  const authorizationUrl = new URL(payload.url);
  googleNonce = authorizationUrl.searchParams.get('nonce') || undefined;
  const state = authorizationUrl.searchParams.get('state');
  expect(state).toBeTruthy();

  return browser(`${baseUrl}/api/auth/callback/google?code=test-code&state=${encodeURIComponent(state!)}`, {
    redirect: 'manual'
  });
}

beforeAll(async () => {
  const keys = await generateKeyPair('RS256');
  googlePrivateKey = keys.privateKey;
  googlePublicJwk = await exportJWK(keys.publicKey);
  googlePublicJwk.kid = 'test-google-key';
  googlePublicJwk.alg = 'RS256';
  googlePublicJwk.use = 'sig';

  postgres = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('acs_test')
    .withUsername('acs_test')
    .withPassword('acs_test')
    .start();
  googleMocks.listen({
    onUnhandledRequest(request, print) {
      const hostname = new URL(request.url).hostname;
      if (hostname === '127.0.0.1' || hostname === 'localhost') return;
      print.error();
    }
  });

  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = postgres.getConnectionUri();
  process.env.BETTER_AUTH_SECRET = 'e2e-auth-secret-that-is-at-least-32-characters';
  const port = await availablePort();
  baseUrl = `http://127.0.0.1:${port}`;
  process.env.BETTER_AUTH_URL = baseUrl;
  process.env.FRONTEND_URL = baseUrl;
  process.env.TRUSTED_ORIGINS = baseUrl;
  process.env.GOOGLE_CLIENT_ID = 'google-test-client';
  process.env.GOOGLE_CLIENT_SECRET = 'google-test-secret';

  execFileSync('npx', ['prisma', 'migrate', 'deploy'], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'pipe'
  });

  const [{ prisma: prismaClient }, { createAuth }, { loadAuthEnvironment }, { createApp }, { serve }] = await Promise.all([
    import('../../src/lib/prisma.js'),
    import('../../src/lib/auth.js'),
    import('../../src/lib/env.js'),
    import('../../src/app.js'),
    import('@hono/node-server')
  ]);
  prisma = prismaClient;
  await prisma.role.createMany({
    data: ['PUBLIC', 'CYCLIST', 'ORGANIZER_STAFF', 'ORGANIZER_OWNER', 'ADMIN'].map((name) => ({ name })),
    skipDuplicates: true
  });
  const testAuth = createAuth({
    database: prisma,
    environment: loadAuthEnvironment(process.env),
    emailSender: async (message) => { outbox.push(message); }
  });
  httpServer = serve({ fetch: createApp(testAuth).fetch, port, hostname: '127.0.0.1' });
  if (!httpServer.listening) await once(httpServer, 'listening');
}, 120_000);

afterAll(async () => {
  googleMocks.close();
  if (httpServer) await new Promise<void>((resolve, reject) => httpServer.close((error) => error ? reject(error) : resolve()));
  if (prisma) await prisma.$disconnect();
  if (postgres) await postgres.stop();
});

describe('Hono authentication', () => {
  it('registers, verifies, logs in, returns a session, and logs out', async () => {
    const email = 'email-flow@example.com';
    const preVerification = client();
    const signup = await post(preVerification, '/api/auth/sign-up/email', {
      name: 'Email Flow', email, password: 'password1234', callbackURL: `${baseUrl}/verified`
    });
    expect(signup.status).toBe(200);
    expect(signup.headers.get('set-cookie')).toBeNull();

    const userBefore = await prisma.user.findUnique({ where: { email }, include: { cyclist: true, role: true } });
    expect(userBefore).toMatchObject({ emailVerified: false, role: { name: 'CYCLIST' } });
    expect(userBefore?.cyclist).toBeTruthy();

    const duplicate = await post(client(), '/api/auth/sign-up/email', {
      name: 'Duplicate Attempt', email, password: 'another-password1234', callbackURL: `${baseUrl}/verified`
    });
    expect(duplicate.status).toBe(200);
    expect(await prisma.user.count({ where: { email } })).toBe(1);

    const verificationCount = outbox.filter((message) => message.to === email && /Verify your email/.test(message.subject)).length;
    const resend = await post(client(), '/api/auth/send-verification-email', {
      email, callbackURL: `${baseUrl}/verified`
    });
    expect(resend.status).toBe(200);
    expect(outbox.filter((message) => message.to === email && /Verify your email/.test(message.subject))).toHaveLength(verificationCount + 1);

    const blockedLogin = await post(client(), '/api/auth/sign-in/email', { email, password: 'password1234' });
    expect(blockedLogin.status).toBe(403);

    const browser = client();
    const verify = await browser(emailUrl(latestEmail(/Verify your email/, email)), { redirect: 'manual' });
    expect(verify.status).toBe(302);
    expect((await prisma.user.findUnique({ where: { email } }))?.emailVerified).toBe(true);

    const login = await post(browser, '/api/auth/sign-in/email', { email, password: 'password1234' });
    expect(login.status).toBe(200);
    expect(login.headers.get('set-cookie')).toContain('HttpOnly');

    const session = await browser(`${baseUrl}/api/auth/get-session`);
    expect(session.status).toBe(200);
    expect(await session.json()).toMatchObject({ user: { email } });

    const logout = await post(browser, '/api/auth/sign-out', {});
    expect(logout.status).toBe(200);
    expect(await (await browser(`${baseUrl}/api/auth/get-session`)).json()).toBeNull();
  });

  it('uses non-enumerating reset responses, changes the password, and revokes sessions', async () => {
    const email = 'password-reset@example.com';
    const browser = await registerAndVerify(email);
    await post(browser, '/api/auth/sign-in/email', { email, password: 'password1234' });

    const known = await post(client(), '/api/auth/request-password-reset', {
      email, redirectTo: `${baseUrl}/reset-password`
    });
    const unknown = await post(client(), '/api/auth/request-password-reset', {
      email: 'unknown@example.com', redirectTo: `${baseUrl}/reset-password`
    });
    expect(known.status).toBe(200);
    expect(await known.json()).toEqual(await unknown.json());

    const resetLink = new URL(emailUrl(latestEmail(/Reset your password/, email)));
    const token = resetLink.pathname.split('/').pop();
    const reset = await post(client(), '/api/auth/reset-password', { token, newPassword: 'new-password1234' });
    expect(reset.status).toBe(200);
    expect(await (await browser(`${baseUrl}/api/auth/get-session`)).json()).toBeNull();
    expect((await post(client(), '/api/auth/sign-in/email', { email, password: 'password1234' })).status).toBe(401);
    expect((await post(client(), '/api/auth/sign-in/email', { email, password: 'new-password1234' })).status).toBe(200);
  });

  it('provisions a Google user and links Google to an existing verified email account', async () => {
    const googleBrowser = client();
    const googleCallback = await signInWithGoogle(googleBrowser, 'google-new@example.com');
    expect(googleCallback.status).toBe(302);
    const googleUser = await prisma.user.findUnique({
      where: { email: 'google-new@example.com' }, include: { cyclist: true, accounts: true }
    });
    expect(googleUser?.emailVerified).toBe(true);
    expect(googleUser?.cyclist).toBeTruthy();
    expect(googleUser?.accounts.some((account) => account.providerId === 'google')).toBe(true);

    const linkedEmail = 'google-link@example.com';
    await registerAndVerify(linkedEmail);
    const before = await prisma.user.findUniqueOrThrow({ where: { email: linkedEmail } });
    const linkedCallback = await signInWithGoogle(client(), linkedEmail);
    expect(linkedCallback.status).toBe(302);
    const after = await prisma.user.findUniqueOrThrow({ where: { email: linkedEmail }, include: { accounts: true, cyclist: true } });
    expect(after.id).toBe(before.id);
    expect(after.accounts.map((account) => account.providerId)).toEqual(expect.arrayContaining(['credential', 'google']));
    expect(await prisma.cyclist.count({ where: { userId: after.id } })).toBe(1);
  });

  it('returns 401 without a session and 403 for an authenticated cyclist without organizer access', async () => {
    const unauthenticated = await post(client(), '/api/events', {});
    expect(unauthenticated.status).toBe(401);

    const browser = await registerAndVerify('authorization@example.com');
    const authenticated = await post(browser, '/api/events', {});
    expect(authenticated.status).toBe(400);

    const organization = await prisma.organization.create({ data: { name: 'Restricted Org' } });
    const cyclist = await prisma.user.findUniqueOrThrow({ where: { email: 'authorization@example.com' } });
    const forbidden = await post(browser, '/api/events', {
      name: 'Private Event', description: '', dateTime: new Date().toISOString(), year: new Date().getFullYear(),
      country: 'MX', state: 'CDMX', organizationId: organization.id, createdBy: cyclist.id
    });
    expect(forbidden.status).toBe(403);
  });
});
