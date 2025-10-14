import React, { useState, useRef, useEffect } from 'react';
import { useForm, Link } from '@inertiajs/react';
import CareerNipInput from './career-nip-input';

type Props = {
  experience: any;
  backUrl?: string;
};

type CareerFormData = {
  id: number | null;
  position: string;
  company_name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  description: string;
  barcode: string;
  street: string;
  city: string;
  zip_code: string;
  work_certificate_scan: File | null;
  nip: string;
  responsibilities?: string;
};

export default function EditCareerForm({ experience, backUrl = '/employee/career' }: Props) {
  function normalizeDate(val: string | null | undefined): string {
    if (!val) return '';
    // Already ISO YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    // Match DD.MM.YYYY
    const m = val.match(/^(\d{2})[\.\/-](\d{2})[\.\/-](\d{4})$/);
    if (m) {
      const [, d, mo, y] = m;
      return `${y}-${mo}-${d}`;
    }
    // Try Date parse fallback
    const parsed = new Date(val);
    if (!isNaN(parsed.getTime())) {
      const yyyy = parsed.getFullYear();
      const mm = String(parsed.getMonth() + 1).padStart(2, '0');
      const dd = String(parsed.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
    return '';
  }
  const existingCertificate: string | undefined = experience?.work_certificate_scan_path ? `/storage/${experience.work_certificate_scan_path}` : undefined;
  const form = useForm<CareerFormData>({
    id: experience?.id ?? null,
    position: experience?.position ?? '',
    company_name: experience?.company_name ?? experience?.company ?? '',
  start_date: normalizeDate(experience?.start_date),
  end_date: normalizeDate(experience?.end_date),
    is_current: experience?.is_current ?? false,
  description: experience?.description ?? '',
    barcode: experience?.barcode ?? '',
    street: experience?.street ?? '',
    city: experience?.city ?? '',
    zip_code: experience?.zip_code ?? '',
    work_certificate_scan: null,
    nip: experience?.nip ?? '',
    responsibilities: experience?.responsibilities ?? '',
  });

  const [nipVerified, setNipVerified] = useState(false);
  const [nipLoading, setNipLoading] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timers.current.forEach((t) => clearTimeout(t));
      timers.current = [];
    };
  }, []);

  function onFillFromLookup(l: any) {
    const foundNip = (l.nip ?? '').replace(/\D/g, '').slice(0, 10);
    form.setData('company_name', l.name ?? form.data.company_name);
    form.setData('street', (l.street ?? form.data.street) as string);
    form.setData('zip_code', (l.zip ?? form.data.zip_code) as string);
    form.setData('city', (l.city ?? form.data.city) as string);
    // update only nip — do NOT touch barcode
    form.setData('nip', foundNip || (form.data as any).nip);
    setNipVerified(foundNip.length === 10);
    setNipLoading(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    form.setData('work_certificate_scan', file);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.data.id) return;

    form.transform(data => ({
      ...data,
      _method: 'PUT',
      start_date: normalizeDate(data.start_date),
      end_date: data.is_current ? null : (data.end_date ? normalizeDate(data.end_date) : null),
    }));

    // Debug
    const debugPayload = { ...form.data, start_date: form.data.start_date, end_date: form.data.end_date };
    console.log('[CareerEdit] submitting', debugPayload);

    form.post(`/employee/career/${form.data.id}`, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        console.log('[CareerEdit] success');
        form.setData('work_certificate_scan', null);
        const id = window.setTimeout(() => {}, 3000);
        timers.current.push(id);
      },
      onError: (errors) => {
        console.warn('[CareerEdit] validation errors', errors);
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* NIP lookup / fill full width */}
      <div>
        <CareerNipInput onFill={(data) => { setNipLoading(true); onFillFromLookup(data); }} />
        {nipLoading && <p className="text-xs text-slate-500 mt-1">Ładowanie danych firmy...</p>}
      </div>

      {/* grid 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Firma / Nazwa</label>
          <input
            type="text"
            value={form.data.company_name}
            onChange={e => form.setData('company_name', e.target.value)}
            className="mt-1 block w-full rounded border px-3 py-2"
          />
          {form.errors.company_name && <p className="text-red-600 text-sm mt-1">{form.errors.company_name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Stanowisko</label>
          <input
            type="text"
            value={form.data.position}
            onChange={e => form.setData('position', e.target.value)}
            className="mt-1 block w-full rounded border px-3 py-2"
          />
          {form.errors.position && <p className="text-red-600 text-sm mt-1">{form.errors.position}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Ulica</label>
          <input
            type="text"
            value={form.data.street}
            onChange={e => form.setData('street', e.target.value)}
            className="mt-1 block w-full rounded border px-3 py-2"
          />
          {form.errors.street && <p className="text-red-600 text-sm mt-1">{form.errors.street}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700">Kod pocztowy</label>
            <input
              type="text"
              value={form.data.zip_code}
              onChange={e => form.setData('zip_code', e.target.value)}
              className="mt-1 block w-full rounded border px-3 py-2"
            />
            {form.errors.zip_code && <p className="text-red-600 text-sm mt-1">{form.errors.zip_code}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Miasto</label>
            <input
              type="text"
              value={form.data.city}
              onChange={e => form.setData('city', e.target.value)}
              className="mt-1 block w-full rounded border px-3 py-2"
            />
            {form.errors.city && <p className="text-red-600 text-sm mt-1">{form.errors.city}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Data rozpoczęcia</label>
          <input
            type="date"
            value={form.data.start_date}
            onChange={e => form.setData('start_date', normalizeDate(e.target.value))}
            className="mt-1 block w-full rounded border px-3 py-2"
          />
          {form.errors.start_date && <p className="text-red-600 text-sm mt-1">{form.errors.start_date}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Data zakończenia</label>
          <input
            type="date"
            value={form.data.end_date}
            onChange={e => form.setData('end_date', normalizeDate(e.target.value))}
            disabled={form.data.is_current}
            className="mt-1 block w-full rounded border px-3 py-2 disabled:bg-slate-100"
          />
          {form.errors.end_date && <p className="text-red-600 text-sm mt-1">{form.errors.end_date}</p>}
        </div>

        <div className="flex items-center gap-3">
          <input
            id="is_current"
            type="checkbox"
            checked={form.data.is_current}
            onChange={e => {
              const checked = e.target.checked;
              form.setData('is_current', checked);
              if (checked) {
                form.setData('end_date', '');
              }
            }}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="is_current" className="text-sm">Obecnie tam pracuję</label>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">NIP</label>
          <input
            type="text"
            value={(form.data as any).nip ?? ''}
            onChange={e => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 10);
              (form.setData as any)('nip', v);
              setNipVerified(false);
            }}
            className="mt-1 block w-full rounded border px-3 py-2"
            inputMode="numeric"
          />
          {nipVerified && <p className="text-green-600 text-sm mt-1">Dane firmy potwierdzone dla NIP.</p>}
        </div>




      </div>

      {/* responsibilities and file full width */}
      <div>
        <label className="mb-1 block text-sm font-medium">Obowiązki / Opis</label>
        <textarea
          value={form.data.responsibilities}
          onChange={e => form.setData('responsibilities', e.target.value)}
          rows={4}
          className="w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        {form.errors.responsibilities && <p className="mt-1 text-xs text-red-600">{form.errors.responsibilities}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Skany świadectw pracy (PDF/JPG/PNG)</label>
        {existingCertificate && !form.data.work_certificate_scan && (
          <div className="mb-2 flex items-center gap-4">
            {existingCertificate.match(/\.pdf$/i) ? (
              <a href={existingCertificate} target="_blank" rel="noopener" className="text-sm text-blue-600 underline">Zobacz aktualny PDF</a>
            ) : (
              <a href={existingCertificate} target="_blank" rel="noopener">
                <img src={existingCertificate} alt="Aktualny skan" className="h-24 rounded border object-cover" />
              </a>
            )}
            <span className="text-xs text-slate-500">Wybierz nowy plik aby zastąpić.</span>
          </div>
        )}
        <input
          type="file"
          accept=".pdf,image/png,image/jpeg"
          onChange={(e) => form.setData('work_certificate_scan', e.target.files?.[0] ?? null)}
          className="block w-full text-sm file:mr-3 file:rounded-md file:border file:border-slate-300 file:bg-white file:px-3 file:py-2 file:text-sm file:text-slate-700 hover:file:bg-slate-50"
        />
        {form.data.work_certificate_scan && (
          <p className="mt-2 text-xs text-slate-600">Nowy plik: {form.data.work_certificate_scan.name}</p>
        )}
        {form.errors.work_certificate_scan && <p className="mt-1 text-xs text-red-600">{form.errors.work_certificate_scan}</p>}
      </div>

      <div className="flex items-center justify-end gap-3 mt-4">
        <button
          type="submit"
          disabled={form.processing}
          className="rounded bg-emerald-600 text-white px-4 py-2 disabled:opacity-60"
        >
          Zapisz
        </button>

        <Link href={backUrl} className="rounded border px-4 py-2 text-sm">
          Anuluj
        </Link>
      </div>
    </form>
  );
}
