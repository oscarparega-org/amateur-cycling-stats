import type { EventStatus as EventStatusValue } from '@acs/shared';
import { eventStatusClasses, formatEventStatus } from '@/lib/event-format';

export function EventStatus({ status }: { status: EventStatusValue }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${eventStatusClasses(status)}`}>
      {formatEventStatus(status)}
    </span>
  );
}
