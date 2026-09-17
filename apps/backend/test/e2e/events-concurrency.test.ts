import { execFileSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type * as EventsService from '../../src/services/events.service.js';

let postgres: StartedPostgreSqlContainer | undefined;
let prisma: PrismaClient;
let service: typeof EventsService;
let pauseRead: (() => Promise<void>) | undefined;

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function gateNextRead() {
  const read = deferred();
  const release = deferred();
  pauseRead = async () => {
    pauseRead = undefined;
    read.resolve();
    await release.promise;
  };
  return { read: read.promise, release: release.resolve };
}

beforeAll(async () => {
  postgres = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('events_concurrency_test')
    .withUsername('acs_test')
    .withPassword('acs_test')
    .start();
  const url = postgres.getConnectionUri();
  execFileSync('npx', ['prisma', 'migrate', 'deploy'], {
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'pipe'
  });
  prisma = new PrismaClient({ datasourceUrl: url });
  const serviceClient = prisma.$extends({
    query: {
      event: {
        async findUnique({ args, query }) {
          const result = await query(args);
          if (pauseRead) await pauseRead();
          return result;
        }
      }
    }
  });
  vi.doMock('../../src/lib/prisma.js', () => ({ prisma: serviceClient }));
  service = await import('../../src/services/events.service.js');
});

beforeEach(() => {
  pauseRead = undefined;
});
afterAll(async () => {
  await prisma?.$disconnect();
  await postgres?.stop();
  vi.doUnmock('../../src/lib/prisma.js');
});

async function fixture() {
  const user = await prisma.user.create({ data: {} });
  const cyclist = await prisma.cyclist.create({ data: { userId: user.id } });
  const event = await prisma.event.create({
    data: {
      name: 'Concurrency event',
      dateTime: new Date('2030-01-01T12:00:00Z'),
      year: 2030,
      country: 'Mexico',
      state: 'Jalisco',
      createdBy: user.id
    }
  });
  const age = await prisma.raceCategory.create({ data: { name: event.id } });
  const gender = await prisma.raceCategoryGender.create({ data: { name: event.id } });
  const distance = await prisma.raceCategoryLength.create({ data: { name: event.id } });
  const race = await prisma.race.create({
    data: {
      eventId: event.id,
      dateTime: event.dateTime,
      raceCategoryAgeId: age.id,
      raceCategoryGenderId: gender.id,
      raceCategoryDistanceId: distance.id
    }
  });
  return { event, race, cyclist };
}

describe('event concurrency safeguards', () => {
  it.each(['result', 'publish'] as const)(
    'blocks a concurrent %s write during deletion eligibility checks',
    async (write) => {
      const { event, race, cyclist } = await fixture();
      const gate = gateNextRead();
      const deletion = service.deleteEvent(event.id);
      try {
        await gate.read;
        await expect(
          prisma.$transaction(async (tx) => {
            await tx.$executeRaw`SET LOCAL lock_timeout = '250ms'`;
            if (write === 'result') {
              await tx.raceResult.create({ data: { raceId: race.id, cyclistId: cyclist.id, place: 1 } });
            } else {
              await tx.event.update({ where: { id: event.id }, data: { eventStatus: 'AVAILABLE' } });
            }
          })
        ).rejects.toThrow(/lock timeout/);
      } finally {
        gate.release();
        await deletion;
      }
      expect(await prisma.event.findUnique({ where: { id: event.id } })).toBeNull();
    }
  );

  it('preserves a newer lifecycle status when a stale update resumes', async () => {
    const { event } = await fixture();
    await prisma.event.update({ where: { id: event.id }, data: { eventStatus: 'AVAILABLE' } });
    const gate = gateNextRead();
    const staleUpdate = service.updateEvent(event.id, { eventStatus: 'SOLD_OUT' });
    const rejected = expect(staleUpdate).rejects.toMatchObject({ code: 'ACS08' });
    try {
      await gate.read;
      await prisma.event.update({ where: { id: event.id }, data: { eventStatus: 'ON_GOING' } });
    } finally {
      gate.release();
      await rejected;
    }
    expect(await prisma.event.findUnique({ where: { id: event.id } })).toMatchObject({ eventStatus: 'ON_GOING' });
  });
});
