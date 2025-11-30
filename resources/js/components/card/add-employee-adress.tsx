import React, { useEffect, useState } from 'react';
import { useForm, router } from '@inertiajs/react';

type FormData = {
  street: string;
  city: string;
  house_number: string;
  apartment_number?: string;
  zip_code: string;
  country: string;
  phone_number: string;
  rodo_accept: boolean;
  address_type: 'zamieszkania' | 'korespondencyjny';
  id_card_number: string;
  pesel: string;
  id_card_scan?: File | null;
};

type Props = {
  initial?: Partial<FormData>;
  mode?: 'add' | 'edit';
  showInitially?: boolean;
};

export default function EmployeeAddressAdd({ initial = {}, mode = 'add', showInitially = true }: Props) {
  const [open, setOpen] = useState<boolean>(!!showInitially);
  const [step, setStep] = useState<number>(1);
  const [scanPreview, setScanPreview] = useState<string | null>(null);
  const [localErrors, setLocalErrors] = useState<{ phone_number?: string; pesel?: string }>({});

  const form = useForm<FormData>({
    street: initial.street ?? '',
    city: initial.city ?? '',
    house_number: initial.house_number ?? '',
    apartment_number: initial.apartment_number ?? '',
    zip_code: initial.zip_code ?? '',
    country: initial.country ?? '',
    phone_number: initial.phone_number ?? '',
    rodo_accept: initial.rodo_accept ?? false,
    address_type: (initial.address_type as any) ?? 'zamieszkania',
    id_card_number: initial.id_card_number ?? '',
    pesel: initial.pesel ?? '',
    id_card_scan: null,
  });

  useEffect(() => {
    if (form.data.id_card_scan) {
      const url = URL.createObjectURL(form.data.id_card_scan);
      setScanPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setScanPreview(null);
    }
  }, [form.data.id_card_scan]);

  const isValidPhone = (v: string) => {
    if (!v) return false;
    // dopuszczalne: cyfry, spacje, myślniki, opcjonalny + i kierunkowy (np. +48)
    const cleaned = v.replace(/[\s-]/g, '');
    return /^(\+?\d{7,15})$/.test(cleaned);
  };

  const validatePesel = (p: string) => {
    if (!/^\d{11}$/.test(p)) return false;
    const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += weights[i] * parseInt(p.charAt(i), 10);
    }
    const checksum = (10 - (sum % 10)) % 10;
    return checksum === parseInt(p.charAt(10), 10);
  };

  function handlePhoneBlur() {
    if (!form.data.phone_number) {
      setLocalErrors((s) => ({ ...s, phone_number: 'Numer telefonu jest wymagany.' }));
      return;
    }
    setLocalErrors((s) => ({ ...s, phone_number: isValidPhone(form.data.phone_number) ? undefined : 'Nieprawidłowy numer telefonu.' }));
  }

  function handlePeselBlur() {
    if (!form.data.pesel) {
      setLocalErrors((s) => ({ ...s, pesel: 'PESEL jest wymagany.' }));
      return;
    }
    setLocalErrors((s) => ({ ...s, pesel: validatePesel(form.data.pesel) ? undefined : 'Nieprawidłowy PESEL.' }));
  }

  function next() {
    setStep((s) => Math.min(3, s + 1));
  }
  function back() {
    setStep((s) => Math.max(1, s - 1));
  }

  function submit(e?: React.FormEvent) {
    e?.preventDefault();

    // lokalne sprawdzenie przed wysłaniem
    const phoneOk = isValidPhone(form.data.phone_number);
    const peselOk = validatePesel(form.data.pesel);
    const newLocalErrors: typeof localErrors = {};
    if (!phoneOk) newLocalErrors.phone_number = 'Nieprawidłowy numer telefonu.';
    if (!peselOk) newLocalErrors.pesel = 'Nieprawidłowy PESEL.';
    setLocalErrors(newLocalErrors);

    if (!phoneOk || !peselOk) {
      return;
    }

    if (mode === 'edit' && (initial as any).id) {
      form.put(route('employee.address.store') /* replace with proper update route if exists */, {
        onSuccess: () => setOpen(false),
      });
    } else {
      form.post(route('employee.address.store'), {
        onSuccess: () => setOpen(false),
      });
    }
  }

  return (
    <>
      {/* trigger (optional) */}
      {!open && (
        <button
          onClick={() => { setOpen(true); setStep(1); }}
          className="px-3 py-1 bg-emerald-600 text-white rounded"
        >
          {mode === 'edit' ? 'Edytuj adres' : 'Dodaj adres'}
        </button>
      )}

      {/* modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6 mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{mode === 'edit' ? 'Edytuj adres' : 'Dodaj adres'}</h2>
              <div className="text-sm text-slate-500">Krok {step} / 3</div>
            </div>

            <form onSubmit={submit} className="space-y-6">
              {/* Step 1 - Part A: Address */}
              {step === 1 && (
                <section className="space-y-3">
                  <h3 className="font-medium">Część A — Adres</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium">Ulica</label>
                      <input
                        type="text"
                        value={form.data.street}
                        onChange={(e) => form.setData('street', e.target.value)}
                        className="mt-1 w-full rounded border px-2 py-1"
                      />
                      {form.errors.street && <p className="text-xs text-red-600 mt-1">{form.errors.street}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium">Miasto</label>
                      <input
                        type="text"
                        value={form.data.city}
                        onChange={(e) => form.setData('city', e.target.value)}
                        className="mt-1 w-full rounded border px-2 py-1"
                      />
                      {form.errors.city && <p className="text-xs text-red-600 mt-1">{form.errors.city}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium">Numer domu</label>
                      <input
                        type="text"
                        value={form.data.house_number}
                        onChange={(e) => form.setData('house_number', e.target.value)}
                        className="mt-1 w-full rounded border px-2 py-1"
                      />
                      {form.errors.house_number && <p className="text-xs text-red-600 mt-1">{form.errors.house_number}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium">Numer mieszkania</label>
                      <input
                        type="text"
                        value={form.data.apartment_number}
                        onChange={(e) => form.setData('apartment_number', e.target.value)}
                        className="mt-1 w-full rounded border px-2 py-1"
                      />
                      {form.errors.apartment_number && <p className="text-xs text-red-600 mt-1">{form.errors.apartment_number}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium">Kod pocztowy</label>
                      <input
                        type="text"
                        value={form.data.zip_code}
                        onChange={(e) => form.setData('zip_code', e.target.value)}
                        className="mt-1 w-full rounded border px-2 py-1"
                      />
                      {form.errors.zip_code && <p className="text-xs text-red-600 mt-1">{form.errors.zip_code}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium">Kraj</label>
                      <input
                        type="text"
                        value={form.data.country}
                        onChange={(e) => form.setData('country', e.target.value)}
                        className="mt-1 w-full rounded border px-2 py-1"
                      />
                      {form.errors.country && <p className="text-xs text-red-600 mt-1">{form.errors.country}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium">Typ adresu</label>
                      <select
                        value={form.data.address_type}
                        onChange={(e) => form.setData('address_type', e.target.value as any)}
                        className="mt-1 w-full rounded border px-2 py-1"
                      >
                        <option value="zamieszkania">Zamieszkania</option>
                        <option value="korespondencyjny">Korespondencyjny</option>
                      </select>
                    </div>
                  </div>
                </section>
              )}

              {/* Step 2 - Part B: Contact & Documents */}
              {step === 2 && (
                <section className="space-y-3">
                  <h3 className="font-medium">Część B — Kontakt i dokumenty</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium">Numer telefonu</label>
                      <input
                        type="text"
                        value={form.data.phone_number}
                        onChange={(e) => form.setData('phone_number', e.target.value)}
                        onBlur={handlePhoneBlur}
                        inputMode="tel"
                        pattern="[\d+\s-]{7,20}"
                        className="mt-1 w-full rounded border px-2 py-1"
                      />
                      {localErrors.phone_number && <p className="text-xs text-red-600 mt-1">{localErrors.phone_number}</p>}
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        id="rodo"
                        type="checkbox"
                        checked={form.data.rodo_accept}
                        onChange={(e) => form.setData('rodo_accept', e.target.checked)}
                        className="h-4 w-4"
                      />
                      <label htmlFor="rodo" className="text-sm">Akceptuję politykę RODO</label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium">Numer dowodu osobistego</label>
                      <input
                        type="text"
                        value={form.data.id_card_number}
                        onChange={(e) => form.setData('id_card_number', e.target.value)}
                        className="mt-1 w-full rounded border px-2 py-1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">PESEL</label>
                      <input
                        type="text"
                        value={form.data.pesel}
                        onChange={(e) => form.setData('pesel', e.target.value.replace(/\D/g, ''))}
                        onBlur={handlePeselBlur}
                        inputMode="numeric"
                        maxLength={11}
                        className="mt-1 w-full rounded border px-2 py-1"
                      />
                      {localErrors.pesel && <p className="text-xs text-red-600 mt-1">{localErrors.pesel}</p>}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium">Skan dowodu (opcjonalnie)</label>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => form.setData('id_card_scan', e.target.files?.[0] ?? null)}
                        className="mt-1 w-full"
                      />
                      {form.errors.id_card_scan && <p className="text-xs text-red-600 mt-1">{form.errors.id_card_scan}</p>}
                      {scanPreview && (
                        <div className="mt-2">
                          <div className="text-sm text-slate-600">Podgląd pliku:</div>
                          <img src={scanPreview} alt="scan" className="max-h-40 mt-2 object-contain" />
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* Step 3 - Preview & Submit */}
              {step === 3 && (
                <section className="space-y-3">
                  <h3 className="font-medium">Podgląd</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="font-medium">Ulica</div>
                      <div>{form.data.street || '—'}</div>
                    </div>
                    <div>
                      <div className="font-medium">Miasto</div>
                      <div>{form.data.city || '—'}</div>
                    </div>

                    <div>
                      <div className="font-medium">Numer domu</div>
                      <div>{form.data.house_number || '—'}</div>
                    </div>
                    <div>
                      <div className="font-medium">Numer mieszkania</div>
                      <div>{form.data.apartment_number || '—'}</div>
                    </div>

                    <div>
                      <div className="font-medium">Kod</div>
                      <div>{form.data.zip_code || '—'}</div>
                    </div>
                    <div>
                      <div className="font-medium">Kraj</div>
                      <div>{form.data.country || '—'}</div>
                    </div>

                    <div>
                      <div className="font-medium">Telefon</div>
                      <div>{form.data.phone_number || '—'}</div>
                    </div>
                    <div>
                      <div className="font-medium">Typ adresu</div>
                      <div>{form.data.address_type}</div>
                    </div>

                    <div>
                      <div className="font-medium">Dowód</div>
                      <div>{form.data.id_card_number || '—'}</div>
                    </div>
                    <div>
                      <div className="font-medium">PESEL</div>
                      <div>{form.data.pesel || '—'}</div>
                    </div>

                    <div>
                      <div className="font-medium">RODO</div>
                      <div>{form.data.rodo_accept ? 'Tak' : 'Nie'}</div>
                    </div>
                    {scanPreview && (
                      <div className="sm:col-span-2">
                        <div className="font-medium">Podgląd skanu</div>
                        <img src={scanPreview} alt="scan" className="max-h-48 mt-2 object-contain" />
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* navigation */}
              <div className="flex items-center justify-between pt-4">
                <div>
                  {step > 1 && (
                    <button type="button" onClick={back} className="px-3 py-1 border rounded bg-white mr-2">
                      Powrót
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => { setOpen(false); }}
                    className="px-3 py-1 border rounded bg-white text-slate-700"
                  >
                    Anuluj
                  </button>

                  {step < 3 ? (
                    <button type="button" onClick={next} className="px-4 py-1 bg-emerald-600 text-white rounded">
                      Dalej
                    </button>
                  ) : (
                    <button type="submit" disabled={form.processing} className="px-4 py-1 bg-emerald-600 text-white rounded">
                      {mode === 'edit' ? 'Zapisz zmiany' : 'Dodaj adres'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
