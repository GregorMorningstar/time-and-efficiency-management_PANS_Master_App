import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import CareerNipInput from './career-nip-input';

type LookupFill = {
  name?: string | null;
  street?: string | null | undefined;
  zip?: string;
  city?: string;
  buildingNumber?: string | null;
  apartmentNumber?: string | null;
  nip?: string;
};

export default function CareerAddForm() {
  const [nipVerified, setNipVerified] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm<{
    company_name: string;
    position: string;
    street: string;
    zip_code: string;
    city: string;
    nip: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
    responsibilities: string;
    work_certificate_scan: File | null;
  }>({
    company_name: '',
    position: '',
    street: '',
    zip_code: '',
    city: '',
    nip: '',
    start_date: '',
    end_date: '',
    is_current: false,
    responsibilities: '',
    work_certificate_scan: null,
  });

  function onFillFromLookup(l: any) {
    const foundNip = (l.nip ?? '').replace(/\D/g, '').slice(0, 10);
    setData('company_name', l.name ?? data.company_name);
    setData('street', (l.street ?? data.street) as string);
    setData('zip_code', (l.zip ?? data.zip_code) as string);
    setData('city', (l.city ?? data.city) as string);
    setData('nip', foundNip || data.nip);
    setNipVerified(foundNip.length === 10);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    post('/employee/career', {
      forceFormData: true,
      onBefore: (formData) => {
        console.log('[Career form] submitting', {
          ...data,
          work_certificate_scan: data.work_certificate_scan ? data.work_certificate_scan.name : null,
        });
      },
      onError: (errs) => {
        console.warn('[Career form] validation errors', errs);
      },
      onSuccess: () => {
        reset();
        setNipVerified(false);
      },
    });
  }

  // Add state for success and error messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (

    <>
        <div className="mt-4">
      {successMessage && (
        <div className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {/* ...existing JSX form/card... */}
    </div>
    <form onSubmit={submit} className="space-y-5">
      <CareerNipInput onFill={onFillFromLookup} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm">Nazwa firmy *</label>
          <input
            value={data.company_name}
            onChange={(e) => setData('company_name', e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          {errors.company_name && <p className="mt-1 text-xs text-red-600">{errors.company_name}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm">Stanowisko *</label>
          <input
            value={data.position}
            onChange={(e) => setData('position', e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          {errors.position && <p className="mt-1 text-xs text-red-600">{errors.position}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm">Ulica *</label>
          <input
            value={data.street}
            onChange={(e) => setData('street', e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            placeholder="Krakowska 309/12"
          />
          {errors.street && <p className="mt-1 text-xs text-red-600">{errors.street}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm">Kod pocztowy *</label>
          <input
            value={data.zip_code}
            onChange={(e) => setData('zip_code', e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            placeholder="25-801"
          />
          {errors.zip_code && <p className="mt-1 text-xs text-red-600">{errors.zip_code}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm">Miasto *</label>
          <input
            value={data.city}
            onChange={(e) => setData('city', e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            placeholder="Kielce"
          />
          {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm">NIP *</label>
          <input
            value={data.nip}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 10);
              setData('nip', v);
              setNipVerified(false);
            }}
            className={`w-full rounded-md border px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 ${nipVerified ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-300'}`}
            placeholder="9591957064"
            inputMode="numeric"
          />
          {errors.nip && <p className="mt-1 text-xs text-red-600">{errors.nip}</p>}
          {nipVerified && <p className="mt-1 text-xs text-green-600">Dane firmy potwierdzone dla NIP.</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm">Data rozpoczęcia *</label>
          <input
            type="date"
            value={data.start_date}
            onChange={(e) => setData('start_date', e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          {errors.start_date && <p className="mt-1 text-xs text-red-600">{errors.start_date}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm">Data zakończenia</label>
          <input
            type="date"
            value={data.end_date}
            onChange={(e) => setData('end_date', e.target.value)}
            disabled={data.is_current}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          {errors.end_date && <p className="mt-1 text-xs text-red-600">{errors.end_date}</p>}
        </div>

        <div className="flex items-center gap-3">
          <input
            id="is_current"
            type="checkbox"
            checked={data.is_current}
            onChange={(e) => setData('is_current', e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="is_current" className="text-sm">Obecnie tam pracuję</label>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Obowiązki</label>
          <textarea
            value={data.responsibilities}
            onChange={(e) => setData('responsibilities', e.target.value)}
            rows={4}
            className="w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          {errors.responsibilities && <p className="mt-1 text-xs text-red-600">{errors.responsibilities}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Skany świadectw pracy (PDF/JPG/PNG)</label>
          <input
            type="file"
            accept=".pdf,image/png,image/jpeg"
            onChange={(e) => setData('work_certificate_scan', e.target.files?.[0] ?? null)}
            className="block w-full text-sm file:mr-3 file:rounded-md file:border file:border-slate-300 file:bg-white file:px-3 file:py-2 file:text-sm file:text-slate-700 hover:file:bg-slate-50"
          />
          {errors.work_certificate_scan && <p className="mt-1 text-xs text-red-600">{errors.work_certificate_scan}</p>}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            reset();
            setNipVerified(false);
          }}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Wyczyść
        </button>
        <button
          type="submit"
          disabled={processing}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {processing ? 'Zapisywanie…' : 'Zapisz'}
        </button>
      </div>
    </form>

    </>
  );
}
