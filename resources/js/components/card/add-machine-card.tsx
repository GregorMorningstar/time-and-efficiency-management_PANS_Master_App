import React, { useState, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';

type MachineFormData = {
  name: string;
  model: string;
  year_of_production?: string;
  serial_number: string;
  description?: string;
  working_hours?: string;
  max_productions_per_hour?: string;
  department_id?: string;
  image?: File | null;
};

type Department = { id: number; name: string };

export default function AddMachineCard() {
  const TOTAL_STEPS = 3;
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<MachineFormData>({
    name: '',
    model: '',
    year_of_production: '',
    serial_number: '',
    description: '',
    working_hours: '0',
    max_productions_per_hour: '',
    department_id: '',
    image: null,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof MachineFormData, string>>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const page = usePage();
  const departments = ((page.props as any).departments as Department[]) || [];

  const progressPercent = Math.round(((step - 1) / (TOTAL_STEPS - 1)) * 100);
  const currentYear = new Date().getFullYear();

  const validateStep = (s = step) => {
    const e: typeof errors = {};
    if (s === 1) {
      if (!data.name.trim()) e.name = 'Nazwa jest wymagana';
      if (!data.model.trim()) e.model = 'Model jest wymagany';
    }
    if (s === 2) {
      if (!data.serial_number.trim()) e.serial_number = 'Numer seryjny jest wymagany';
      if (data.year_of_production) {
        if (!/^\d{4}$/.test(data.year_of_production)) {
          e.year_of_production = 'Rok musi być 4-cyfrowy';
        } else {
          const y = parseInt(data.year_of_production, 10);
          if (y > currentYear) e.year_of_production = `Rok nie może być większy niż ${currentYear}`;
        }
      }
      if (data.working_hours && !/^\d+$/.test(data.working_hours)) e.working_hours = 'Roboczogodziny muszą być liczbą całkowitą';
      if (data.max_productions_per_hour && !/^\d+$/.test(data.max_productions_per_hour)) e.max_productions_per_hour = 'Musi być liczbą';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validateStep(step)) setStep(prev => Math.min(prev + 1, TOTAL_STEPS));
  };
  const back = () => setStep(prev => Math.max(prev - 1, 1));

  const onChange = (k: keyof MachineFormData, v: string) => {
    setData(prev => ({ ...prev, [k]: v }));
    setErrors(prev => ({ ...prev, [k]: undefined }));
  };

  const onFileChange = (file?: File | null) => {
    if (!file) {
      setData(prev => ({ ...prev, image: null }));
      setImagePreview(null);
      return;
    }

    const allowed = ['image/jpeg', 'image/png'];
    const maxSize = 15 * 1024 * 1024; // 15 MB

    if (!allowed.includes(file.type)) {
      setErrors(prev => ({ ...prev, image: 'Tylko pliki JPG/PNG są dozwolone' }));
      return;
    }
    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, image: 'Plik przekracza 15 MB' }));
      return;
    }

    setData(prev => ({ ...prev, image: file }));
    setErrors(prev => ({ ...prev, image: undefined }));

    const reader = new FileReader();
    reader.onload = () => setImagePreview(String(reader.result));
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    if (!validateStep(3)) return;
    setSubmitting(true);

    const form = new FormData();
    form.append('name', data.name);
    form.append('model', data.model);
    form.append('year_of_production', data.year_of_production || '');
    form.append('serial_number', data.serial_number);
    form.append('description', data.description || '');
    form.append('working_hours', data.working_hours || '0');
    form.append('max_productions_per_hour', data.max_productions_per_hour || '');
    form.append('department_id', data.department_id || '');
    if (data.image) form.append('image', data.image);

    router.post('/moderator/machines', form, {
      preserveState: false,
      onFinish: () => setSubmitting(false),
      onError: (serverErrors: any) => {
        setErrors(serverErrors || {});
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-md shadow">
      <h2 className="text-lg font-semibold mb-4">Dodaj maszynę</h2>

      {/* animated progress bar */}
      <div className="mb-6">
        <div className="h-2 bg-slate-100 rounded overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
            aria-hidden
          />
        </div>
        <div className="text-xs text-slate-500 mt-2">Krok {step} z {TOTAL_STEPS}</div>
      </div>

      {/* step 1 */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Nazwa</label>
            <input value={data.name} onChange={e => onChange('name', e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
            {errors.name && <div className="text-xs text-red-600 mt-1">{errors.name}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium">Model</label>
            <input value={data.model} onChange={e => onChange('model', e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
            {errors.model && <div className="text-xs text-red-600 mt-1">{errors.model}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium">Opis urządzenia</label>
            <textarea value={data.description} onChange={e => onChange('description', e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" rows={3} />
          </div>

          <div className="flex justify-end">
            <button onClick={next} className="px-4 py-2 bg-indigo-600 text-white rounded">Dalej</button>
          </div>
        </div>
      )}

      {/* step 2 */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Rok produkcji</label>
            <input
              value={data.year_of_production}
              onChange={e => onChange('year_of_production', e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
              placeholder="YYYY"
              inputMode="numeric"
            />
            {errors.year_of_production && <div className="text-xs text-red-600 mt-1">{errors.year_of_production}</div>}
            {!errors.year_of_production && data.year_of_production && (
              <div className="text-xs text-slate-500 mt-1">Maksymalny rok: {currentYear}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Numer seryjny</label>
            <input value={data.serial_number} onChange={e => onChange('serial_number', e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
            {errors.serial_number && <div className="text-xs text-red-600 mt-1">{errors.serial_number}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium">Roboczogodziny</label>
            <input value={data.working_hours} onChange={e => onChange('working_hours', e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" type="number" min={0} />
            {errors.working_hours && <div className="text-xs text-red-600 mt-1">{errors.working_hours}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium">Max. produkcji na godzinę</label>
            <input value={data.max_productions_per_hour} onChange={e => onChange('max_productions_per_hour', e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" type="number" min={0} />
            {errors.max_productions_per_hour && <div className="text-xs text-red-600 mt-1">{errors.max_productions_per_hour}</div>}
          </div>

          {/* department select populated from DB */}
          <div>
            <label className="block text-sm font-medium">Dział</label>
            <select
              value={data.department_id || ''}
              onChange={e => onChange('department_id', e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2 bg-white"
            >
              <option value="">Wybierz dział</option>
              {departments.map(dep => (
                <option key={dep.id} value={String(dep.id)}>{dep.name}</option>
              ))}
            </select>
            {errors.department_id && <div className="text-xs text-red-600 mt-1">{errors.department_id}</div>}
          </div>

          {/* image upload */}
          <div>
            <label className="block text-sm font-medium">Zdjęcie (JPEG/PNG, max 15MB)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={e => onFileChange(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
              className="mt-1 block w-full"
            />
            {errors.image && <div className="text-xs text-red-600 mt-1">{errors.image}</div>}
            {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 max-h-40 rounded border" />}
          </div>

          <div className="flex justify-between">
            <button onClick={back} className="px-4 py-2 bg-slate-200 rounded">Wstecz</button>
            <button onClick={next} className="px-4 py-2 bg-indigo-600 text-white rounded">Dalej</button>
          </div>
        </div>
      )}

      {/* step 3 - review */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Sprawdź dane</h3>
            <ul className="mt-2 space-y-1 text-sm">
              <li><strong>Nazwa:</strong> {data.name}</li>
              <li><strong>Model:</strong> {data.model}</li>
              <li><strong>Rok:</strong> {data.year_of_production || '-'}</li>
              <li><strong>Numer seryjny:</strong> {data.serial_number}</li>
              <li><strong>Roboczogodziny:</strong> {data.working_hours}</li>
              <li><strong>Max / h:</strong> {data.max_productions_per_hour || '-'}</li>
              <li><strong>Dział:</strong> {departments.find(d => String(d.id) === data.department_id)?.name || data.department_id || '-'}</li>
              <li><strong>Opis:</strong> {data.description || '-'}</li>
              <li>
                <strong>Zdjęcie:</strong>
                {imagePreview ? (
                  <div className="mt-2">
                    <img src={imagePreview} alt="Załączone zdjęcie" className="max-w-full max-h-64 rounded border" />
                    <div className="text-xs text-slate-500 mt-1">
                      {data.image?.name} — {(data.image?.size ? (data.image.size / (1024*1024)).toFixed(2) : '0')} MB
                    </div>
                  </div>
                ) : (
                  <span> Brak</span>
                )}
              </li>
            </ul>
          </div>

          <div className="flex justify-between">
            <button onClick={back} className="px-4 py-2 bg-slate-200 rounded">Wstecz</button>
            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="px-3 py-2 bg-white border rounded">Edytuj</button>
              <button onClick={submit} disabled={submitting} className="px-4 py-2 bg-green-600 text-white rounded">
                {submitting ? 'Zapisuję...' : 'Zapisz'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
