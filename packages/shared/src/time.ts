import { Temporal } from '@js-temporal/polyfill';

export function eventInstant(localDateTime: string, timeZone: string): string {
  return Temporal.PlainDateTime.from(localDateTime).toZonedDateTime(timeZone).toInstant().toString();
}

export function eventLocalDateTime(instant: string, timeZone: string): string {
  return Temporal.Instant.from(instant)
    .toZonedDateTimeISO(timeZone)
    .toPlainDateTime()
    .toString({ smallestUnit: 'minute' });
}

export function eventYear(instant: string, timeZone: string): number {
  return Temporal.Instant.from(instant).toZonedDateTimeISO(timeZone).year;
}

export function isTimeZone(value: string): boolean {
  try {
    Temporal.Now.zonedDateTimeISO(value);
    return true;
  } catch {
    return false;
  }
}
