import { describe, expect, it } from 'vitest';
import { eventInstant, eventLocalDateTime, eventYear, isTimeZone } from './time.js';

describe('event timezone helpers', () => {
  it('round trips an event wall-clock time through an instant', () => {
    const instant = eventInstant('2026-10-18T08:30', 'America/Mexico_City');
    expect(instant).toBe('2026-10-18T14:30:00Z');
    expect(eventLocalDateTime(instant, 'America/Mexico_City')).toBe('2026-10-18T08:30');
    expect(eventYear(instant, 'America/Mexico_City')).toBe(2026);
  });

  it('validates IANA zones', () => {
    expect(isTimeZone('America/Mexico_City')).toBe(true);
    expect(isTimeZone('not/a-zone')).toBe(false);
  });
});
