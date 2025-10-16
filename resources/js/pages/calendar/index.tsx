import React, { useState } from "react";
import { usePage } from '@inertiajs/react';
import EmployeeLayout from "../employee/employee-layout";
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from "@fullcalendar/interaction"
import plLocale from '@fullcalendar/core/locales/pl'   // <- dodane
import CalendarAdd from "@/components/card/calendar-add";

export default function CalendarPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [clickedStart, setClickedStart] = useState<string | null>(null);
  const [clickedEnd, setClickedEnd] = useState<string | null>(null);
  const [workingDays, setWorkingDays] = useState<number>(0);
  const { props } = usePage<any>();
  const types = props.types ?? [];

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

  return (
    <>
      <EmployeeLayout title="Kalendarz urlopowy">
        <div className="p-4">
          <FullCalendar
            plugins={[ dayGridPlugin, interactionPlugin ]}
            initialView="dayGridMonth"
            selectable={true}
            selectMirror={true}
            select={handleDateSelect}
            dateClick={handleDateClick}
            selectAllow={allowSelect}
            firstDay={1}
            locale={plLocale}
            dayCellClassNames={(arg) => {
              const iso = arg.date.toISOString().slice(0,10);
              return isHolidayIso(iso) ? ['fc-holiday'] : [];
            }}
          />
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
