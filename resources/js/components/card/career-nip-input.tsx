import React, { useState } from 'react';

type CompanyData = {
  ok: boolean;
  name?: string | null;
  nip?: string;
  regon?: string | null;
  krs?: string | null;
  address?: string | null;
  statusVat?: string | null;
  error?: string;
  street?: string | null; // <-- nowe opcjonalne pola
  zip?: string | null;
  city?: string | null;
};

function parseAddress(addr?: string | null) {
  if (!addr) return { street: '', zip: '', city: '' };
  const [streetPart, rest] = addr.split(',', 2).map(s => s.trim());
  let zip = '', city = '';
  const m = rest?.match(/(\d{2}-\d{3})\s+(.+)/);
  if (m) { zip = m[1]; city = m[2]; }
  return { street: streetPart || '', zip, city };
}

export default function CareerNipInput({ onFill }: { onFill?: (data: Partial<CompanyData>) => void }) {
  const [nip, setNip] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [company, setCompany] = useState<CompanyData | null>(null);

  const formatNip = (v: string) =>
    v.replace(/\D/g, '')
      .slice(0, 10)
      .replace(/^(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2}).*$/, (_m, a, b, c, d) =>
        [a, b && `-${b}`, c && `-${c}`, d && `-${d}`].filter(Boolean).join('')
      );

  async function lookup() {
    setError(null);
    setCompany(null);
    const digits = nip.replace(/\D/g, '');
    if (digits.length !== 10) {
      setError('NIP musi mieć 10 cyfr');
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch(`/employee/api/company/lookup?nip=${encodeURIComponent(digits)}`, {
        headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' },
        credentials: 'same-origin',
      });
      const json: CompanyData = await resp.json();
      if (!json.ok) {
        setError(json.error || 'Nie znaleziono danych firmy');
        return;
      }
      setCompany(json);
      onFill?.({
        name: json.name ?? undefined,
        street: json.street ?? undefined,
        zip: json.zip ?? undefined,
        city: json.city ?? undefined,
        buildingNumber: json.buildingNumber ?? undefined,
        apartmentNumber: json.apartmentNumber ?? undefined,
        nip: json.nip ?? undefined,
      });
    } catch {
      setError('Błąd połączenia z serwerem');
    } finally {
        console.log(company)
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Wyszukaj firmę po NIP</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={nip}
          onChange={(e) => setNip(formatNip(e.target.value))}
          placeholder="___-___-__-__"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          maxLength={13}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={lookup}
          disabled={loading}
          className="rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? 'Szukam…' : 'Szukaj'}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {company?.ok && (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800/60">
          <div className="font-semibold text-slate-800 dark:text-slate-100">{company.name}</div>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <div>Ulica: {company.street || '—'}</div>
            <div>Kod: {company.zip || '—'}</div>
            <div className="col-span-2">Miasto: {company.city || '—'}</div>
            <div>NIP: {company.nip}</div>
            {company.regon && <div>REGON: {company.regon}</div>}
            {company.krs && <div>KRS: {company.krs}</div>}
            <div className="col-span-2">Adres (oryg.): {company.address || '—'}</div>
            {company.statusVat && <div className="col-span-2">Status VAT: {company.statusVat}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
