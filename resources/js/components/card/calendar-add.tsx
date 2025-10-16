import React, { useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';

type LeaveTypeOption = { value: string; label: string };

type Props = {
  date?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  onClose?: () => void;
  types?: LeaveTypeOption[];
  storeRoute?: string;
  storeParams?: Record<string, any>;
  workingDays?: number;
};

export default function CalendarAdd({
  date = null,
  startDate = null,
  endDate = null,
  onClose,
  types = [],
  storeRoute = 'employee.calendar.store',
  storeParams = {},
  workingDays = 0,
}: Props) {
  const form = useForm({
    start_date: startDate ?? date ?? '',
    end_date: endDate ?? date ?? '',
    type: types.length ? types[0].value : '',
    description: '',
    workingDays: workingDays,
  });

  useEffect(() => {
    form.setData('start_date', startDate ?? date ?? '');
    form.setData('end_date', endDate ?? date ?? '');
  }, [startDate, endDate, date]);

  useEffect(() => {
    if (types.length && !form.data.type) {
      form.setData('type', types[0].value);
    }
  }, [types]);

  function submit(e: React.FormEvent) {
    e.preventDefault();

    form.post(route(storeRoute, storeParams), {
      preserveScroll: true,
      onSuccess: (page: any) => {
        const returnedId = page?.props?.event?.id ?? storeParams?.id ?? null;

        if (returnedId) {
          router.visit(route('employee.calendar.show', { id: returnedId }));
        } else {
          onClose?.();
        }
      },
      onError: () => {
      },
    });
  }

  return (
    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4">
      <div className="flex items-center justify-between mb-2">
        <h5 className="text-lg font-medium">Wniosek o urlop</h5>
        <button
          type="button"
          onClick={() => onClose?.()}
          className="text-sm text-slate-500 hover:text-slate-700"
          aria-label="Zamknij"
        >
          ✕
        </button>
      </div>

      {/* informacja o dniach roboczych */}
      <div className="mb-3">
        <span className="text-sm text-slate-600">
          Dni robocze w wybranym zakresie:{' '}
          <strong className="text-emerald-600">{workingDays}</strong>
        </span>
        <div className="text-xs text-slate-400">Weekendy i święta są pominięte.</div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Data rozpoczęcia</label>
          <input
            type="date"
            value={form.data.start_date || ''}
            onChange={(e) => form.setData('start_date', e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Data zakończenia</label>
          <input
            type="date"
            value={form.data.end_date || ''}
            onChange={(e) => form.setData('end_date', e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Typ urlopu</label>
          <select
            value={form.data.type}
            onChange={(e) => form.setData('type', e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Wybierz typ</option>
            {types.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Opis / uwagi</label>
          <textarea
            value={form.data.description}
            onChange={(e) => form.setData('description', e.target.value)}
            rows={4}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="flex items-center justify-end space-x-2">
          <button type="button" onClick={() => onClose?.()} className="px-3 py-2 rounded border text-sm">
            Anuluj
          </button>
          <button
            type="submit"
            disabled={form.processing}
            className="px-4 py-2 rounded bg-blue-600 text-white text-sm disabled:opacity-60"
          >
            Dodaj wniosek
          </button>
        </div>
      </form>
    </div>
  );
}
