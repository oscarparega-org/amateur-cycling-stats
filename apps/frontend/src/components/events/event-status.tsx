import type { EventStatus as EventStatusValue } from '@acs/shared';
import { eventStatusClasses, formatEventStatus } from '@/lib/event-format';
import type { Locale } from '@/lib/i18n';

export function EventStatus({ status, locale = 'es' }: { status: EventStatusValue; locale?: Locale }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${eventStatusClasses(status)}`}>
      {formatEventStatus(status, locale)}
    </span>
  );
}
