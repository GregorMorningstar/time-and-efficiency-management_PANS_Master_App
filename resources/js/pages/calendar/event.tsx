import React, { useEffect, useRef, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import EventVacationCard from '@/components/card/event-vacation-card';


type EventData = {
  id?: string | number;
  title?: string | null;
  start?: Date | string | null;
  end?: Date | string | null;
  allDay?: boolean;
  type?: string | null;
  description?: string | null;
  color?: string | null;
};

type Props = {
  event?: EventData | null;
  onClose?: () => void;
  // autoCloseMs removed from behaviour — kept only for compatibility if used elsewhere
  messageAutoCloseMs?: number;
};

export default function Event({
  event,
  onClose,
  messageAutoCloseMs = 5000,
}: Props) {
  const { props: pageProps } = usePage<any>();
  const errors = pageProps?.errors ?? {};
  const flash = pageProps?.flash ?? {};

  const fmt = (d?: Date | string | null) => (d ? new Date(d).toLocaleDateString('pl-PL') : '-');
  const fmtEnd = (d?: Date | string | null, all?: boolean) => {
    if (!d) return '-';
    const dt = new Date(d);
    if (all) dt.setDate(dt.getDate() - 1);
    return dt.toLocaleDateString('pl-PL');
  };

  const [message, setMessage] = useState<string | null>(null);
  const messageTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const err = errors?.start_date
      ? (Array.isArray(errors.start_date) ? errors.start_date.join(' ') : String(errors.start_date))
      : null;
    const fl = flash?.error ?? flash?.message ?? null;
    const initial = err ?? fl ?? null;

    setMessage(initial);

    if (initial) {
      if (messageTimeoutRef.current) {
        window.clearTimeout(messageTimeoutRef.current);
      }
      messageTimeoutRef.current = window.setTimeout(() => {
        setMessage(null);
        messageTimeoutRef.current = null;
      }, messageAutoCloseMs) as unknown as number;
    }

    return () => {
      if (messageTimeoutRef.current) {
        window.clearTimeout(messageTimeoutRef.current);
        messageTimeoutRef.current = null;
      }
    };
  }, [JSON.stringify(errors), JSON.stringify(flash), messageAutoCloseMs]);

  if (!event) return null;

  return (
    <div
      onMouseEnter={() => {
        if (messageTimeoutRef.current) {
          window.clearTimeout(messageTimeoutRef.current);
          messageTimeoutRef.current = null;
        }
      }}
      onMouseLeave={() => {
        if (message) {
          messageTimeoutRef.current = window.setTimeout(() => setMessage(null), messageAutoCloseMs) as unknown as number;
        }
      }}
      className="select-none"
    >
      <EventVacationCard
        {...({ event,onClose: () => onClose?.() } as any)}
      />
    </div>
  );
}
