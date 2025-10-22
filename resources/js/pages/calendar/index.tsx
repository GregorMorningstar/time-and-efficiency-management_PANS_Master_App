import React, { useEffect, useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import EmployeeLayout from "../employee/employee-layout";
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from "@fullcalendar/interaction"
import plLocale from '@fullcalendar/core/locales/pl'
import timeGridPlugin from '@fullcalendar/timegrid'
import CalendarAdd from "@/components/card/calendar-add";
import Event from './event';
import Breadcrumbs from '@/components/ui/breadcrumbs';
export default function CalendarPage() {

     const breadcrumbs = [
    { label: 'Panel', href: route('dashboard') },
    { label: 'Kalendarz', href: route('employee.calendar') },
  ];

  const { props } = usePage<any>();
  const flash = props?.flash ?? {};
  const errors = props?.errors ?? {};

  const [isOpen, setIsOpen] = useState(false);
  const [clickedStart, setClickedStart] = useState<string | null>(null);
  const [clickedEnd, setClickedEnd] = useState<string | null>(null);
  const [workingDays, setWorkingDays] = useState<number>(0);
  const types = props.types ?? [];
  const events = props.events ?? [];

  const holidays = [
    '2025-01-01', // Nowy Rok
    '2025-01-06', // Trzech Króli
    '2025-04-20', // Wielkanoc (przykład)
    '2025-05-01', // Święto Pracy
    '2025-05-03', // Konstytucji 3 Maja
    '2025-12-25', // Boże Narodzenie
  ];

  const isHolidayIso = (isoDate: string | null) => {
    if (!isoDate) return false;
    return holidays.includes(isoDate);
  };

  const isWeekend = (date: Date) => {
    const d = date.getDay();
    return d === 0 || d === 6;
  };

  const rangeContainsBlockedDay = (startStr: string, endStr: string | null) => {
    try {
      const start = new Date(startStr);
      const endExclusive = endStr ? new Date(endStr) : new Date(startStr);
      let cur = new Date(start);
      while (cur < endExclusive) {
        const iso = cur.toISOString().slice(0, 10);
        if (isWeekend(cur) || isHolidayIso(iso)) return true;
        cur.setDate(cur.getDate() + 1);
      }
      return false;
    } catch {
      return false;
    }
  };


  const countWorkingDays = (startStr: string, endStr: string | null) => {
    if (!startStr) return 0;
    const start = new Date(startStr);
    let endInclusive = endStr ? new Date(endStr) : new Date(startStr);
    if (endStr) endInclusive.setDate(endInclusive.getDate() - 1);

    let cur = new Date(start);
    let count = 0;
    while (cur <= endInclusive) {
      const iso = cur.toISOString().slice(0,10);
      const day = cur.getDay();
      const isWeekendDay = day === 0 || day === 6;
      if (!isWeekendDay && !isHolidayIso(iso)) count++;
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  };

  const allowSelect = (selectInfo: any) => {
    return true;
  };

  const handleDateClick = (clickInfo: any) => {
    const dateStr = clickInfo.dateStr ?? null;
    if (!dateStr) return;
    const dateObj = new Date(dateStr);
    if (isWeekend(dateObj) || isHolidayIso(dateStr)) {
      alert('Nie można wybrać weekendów ani dni ustawowo wolnych od pracy.');
      return;
    }
    setClickedStart(dateStr);
    setClickedEnd(dateStr);
    setWorkingDays(1);
    setIsOpen(true);
  };

  const handleDateSelect = (selectInfo: any) => {
    const startStr = selectInfo.startStr ?? null;
    const endStr = selectInfo.endStr ?? null;
    const workingDays = startStr ? countWorkingDays(startStr, endStr) : 0;

    if (workingDays === 0) {
      alert('Wybrany zakres nie zawiera dni roboczych (tylko weekendy/święta). Wybierz inny zakres.');
      return;
    }

    setClickedStart(startStr);
    setClickedEnd(endStr ?? startStr);
    setWorkingDays(workingDays);
    setIsOpen(true);
  };

  const [popover, setPopover] = useState<{
    open: boolean;
    x: number;
    y: number;
    data: null | {
      id?: string | number;
      title?: string;
      start?: Date | string | null;
      end?: Date | string | null;
      allDay?: boolean;
      type?: string;
      description?: string;
      color?: string;
    };
  }>({ open: false, x: 0, y: 0, data: null });

  const [showGlobalErrors, setShowGlobalErrors] = useState(true);
  useEffect(() => {
    let t: number | undefined;
    const hasErrors = errors && Object.keys(errors).length > 0;

    if (popover.open) {
      setShowGlobalErrors(false);
      return;
    }

    if (hasErrors) {
      setShowGlobalErrors(true);
      t = window.setTimeout(() => setShowGlobalErrors(false), 5000);
    } else {
      setShowGlobalErrors(false);
    }

    return () => {
      if (t) window.clearTimeout(t);
    };
  }, [JSON.stringify(errors), popover.open]);

  const handleEventClick = (info: any) => {
    info.jsEvent.preventDefault();
    const x = info.jsEvent.clientX + 8;
    const y = info.jsEvent.clientY + 8;
    setPopover({
      open: true,
      x,
      y,
      data: {
        id: info.event.id,
        title: info.event.title,
        start: info.event.start,
        end: info.event.end,
        allDay: info.event.allDay,
        type: info.event.extendedProps?.type,
        description: info.event.extendedProps?.description,
        color: info.event.backgroundColor || info.event.borderColor,
      },
    });
  };

  const renderError = (key: string) => {
    const v = errors[key];
    if (!v) return null;
    return (
      <div className="mt-2 text-sm text-red-600">
        {Array.isArray(v) ? v.join(' ') : v}
      </div>
    );
  };

  return (
    <>
      <EmployeeLayout title="Kalendarz urlopowy">
        <Head title="Kalendarz" />
          <Breadcrumbs items={breadcrumbs} />
        <div className="p-4">
          {flash.success && (
            <div className="mb-4 rounded bg-green-50 border border-green-200 text-green-800 px-3 py-2">
              {flash.success}
            </div>
          )}

          {!popover.open && showGlobalErrors && errors && Object.keys(errors).length > 0 && (
            <div className="mb-4 rounded bg-red-50 border border-red-200 text-red-800 px-3 py-2">
              <strong>Wystąpiły błędy:</strong>
              <div className="mt-1">{Object.values(errors).flat().join(' ')}</div>
            </div>
          )}

          <div className="mx-auto max-w-4xl">
            <FullCalendar
              plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin ]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              selectable={true}
              selectMirror={true}
              select={handleDateSelect}
              dateClick={handleDateClick}
              selectAllow={allowSelect}
              firstDay={1}
              locale={plLocale}
              height={500}
              contentHeight={650}
              aspectRatio={1.35}
              events={events}
              eventClick={handleEventClick}
              dayCellClassNames={(arg) => {
                const iso = arg.date.toISOString().slice(0,10);
                return isHolidayIso(iso) ? ['fc-holiday'] : [];
              }}
            />

            {popover.open && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* ciemne, ale stonowane tło żeby czytelność była lepsza */}
                <div
                  className="absolute inset-0 bg-slate-700/60 backdrop-blur-sm"
                  onClick={() => setPopover(p => ({ ...p, open: false }))}
                />

                {/* kontener karty — biała karta na szarym tle */}
                <div className="relative z-10 w-full max-w-md mx-4">
                  <div className="bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
                    <div className="p-4">
                      <Event
                        event={popover.data}
                        onClose={() => setPopover(p => ({ ...p, open: false }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </EmployeeLayout>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-full max-w-md p-4 z-10">
            <div className="rounded-lg shadow-lg border border-emerald-200 overflow-hidden
                            bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <h5 className="text-lg font-medium">Wniosek o urlop</h5>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="text-sm text-slate-500 hover:text-slate-700"
                    aria-label="Zamknij"
                  >
                    ✕
                  </button>
                </div>

                <CalendarAdd
                  startDate={clickedStart}
                  endDate={clickedEnd}
                  workingDays={workingDays}
                  types={types}
                  onClose={() => setIsOpen(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
