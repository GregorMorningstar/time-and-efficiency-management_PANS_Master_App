import { Link, router } from '@inertiajs/react';
import Barcode from 'react-barcode';
import React, { useState } from 'react';

interface ExperienceItem {
    detailsHref: any;
    editHref: any;
  id: number;
  position: string;
  company_name: string;
  start_date: string;
  end_date?: string | null;
  is_current: boolean;
  description?: string | null;
  work_certificate_scan_path?: string | null;
    street?: string | null;
    city?: string | null;
    zip_code?: string | null;
  barcode?: string | null;
    nip?: string | null;
  actions?: {
    editHref?: string;
    deleteHref?: string;
    onDelete?: () => void;
    compact?: boolean;
  };
}

type CareerCardProps = {
  experience: ExperienceItem;
};

export default function CareerCard({ experience }: CareerCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const detailsHref = `/employee/career/${experience.id}`;
  const editHref = `/employee/career/${experience.id}/edit`;

  function handleDelete() {
    if (!confirm('Czy na pewno chcesz usunąć ten wpis?')) return;

    if (experience.actions?.onDelete) {
      experience.actions.onDelete();
      return;
    }

    // fallback POST to delete endpoint
    router.post('/employee/career/delete', { id: experience.id });
  }

  const employmentRange = `${experience.start_date} — ${experience.is_current ? 'W trakcie' : (experience.end_date ?? '—')}`;

    function onDelete(event: React.MouseEvent<HTMLButtonElement>): void {
        throw new Error('Function not implemented.');
    }

  return (
    <>
      <div className="relative flex flex-col my-6 bg-white shadow-sm border border-slate-200 rounded-lg w-96">
        <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500/70 dark:bg-emerald-500 rounded-r" />

        <div className="p-4 flex flex-col items-center">
          {experience.barcode ? (
            <>
              <div className="bg-white p-2 rounded shadow-sm">
                <Barcode
                  value={experience.barcode}
                  displayValue={false}
                  height={48}
                  margin={0}
                  background="white"
                  lineColor="#000"
                />
              </div>

              <div className="mt-2 text-sm text-slate-700 font-mono">
                {experience.barcode}
              </div>
            </>
          ) : (
            <div className="mt-2 text-sm text-slate-400">Brak kodu</div>
          )}

          <div className="w-full mt-4">
            <h5 className="mb-2 text-slate-800 text-lg font-semibold">
              {experience.company_name}
            </h5>
            <div className="text-sm text-slate-600">
              <div className="mb-2 text-slate-600 text-md font-medium">Adres</div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 text-sm">
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-slate-700 mr-2">Ulica:</span>
                  <span className="text-slate-600 truncate"> {experience.street ?? '—'}</span>
                </div>
                <div className="flex-shrink-0 text-right sm:text-left">
                  <div className="text-slate-600">
                    <span className="font-medium text-slate-700 mr-1">Kod:</span>
                    <span className="font-mono">{experience.zip_code ?? '—'}</span>
                  </div>
                  <div className="text-slate-600">
                    <span className="font-medium text-slate-700 mr-1">Miasto:</span>
                    <span className="truncate">{experience.city ?? '—'}</span>
                  </div>
                </div>
              </div>
              <hr className="my-2" />
            </div>
            <h6 className="mb-2 text-slate-600 text-md font-medium">Stanowisko</h6>
            <p className="text-slate-600 leading-normal font-light mb-2">
              {experience.position}
            </p>

            {/* row under position: centered date + barcode number on the right */}
            <div className="mt-3 flex items-center justify-between gap-4">
              <div className="flex-1 text-center">
                <div className="text-sm text-slate-400">Data zatrudnienia</div>
                <div className="text-slate-600 font-medium">{employmentRange}</div>
              </div>

              <div className="w-32 text-center">
                <div className="text-sm text-slate-400">NIP</div>
                <div className="text-slate-700 font-mono">
                  {experience.nip ?? '—'}
                </div>
              </div>
            </div>

            {experience.description && (
              <>
                <hr className="my-3" />
                <p className="text-slate-600 leading-normal font-light mb-3">
                  {experience.description}
                </p>
              </>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDetails(true)}
              className="rounded-md border px-2 py-1 text-sm bg-white text-slate-700 hover:bg-slate-50"
            >
              Szczegóły
            </button>

            <Link
              href={editHref}
              className="rounded-md border px-2 py-1 text-sm bg-white text-emerald-700 hover:bg-emerald-50"
            >
              Edytuj
            </Link>

            <button
              type="button"
              onClick={handleDelete}
              className="rounded-md border px-2 py-1 text-sm bg-red-50 text-red-600 hover:bg-red-100"
            >
              Usuń
            </button>
          </div>
        
        </div>
      </div>

      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-6 mx-4">
            <div className="flex items-start justify-between pb-2">
              <h3 className="text-lg font-semibold text-slate-800">Szczegóły wpisu</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-slate-500 hover:text-slate-800"
                aria-label="Zamknij"
              >
                ✕
              </button>
            </div>

            <div className="mt-3">
              <div className="text-sm text-slate-500 mb-1">Stanowisko</div>
              <div className="font-medium text-slate-700 mb-3">{experience.position}</div>

              <div className="text-sm text-slate-500 mb-1">Data zatrudnienia</div>
              <div className="font-medium text-slate-700 mb-3">{employmentRange}</div>

              <div className="text-sm text-slate-500 mb-1">Opis</div>
              <div className="mb-3 text-slate-600">{experience.description ?? 'Brak opisu'}</div>

              <div className="text-sm text-slate-500 mb-1">Świadectwo pracy</div>
              <div className="mb-3">
                {experience.work_certificate_scan_path ? (
                  <a
                    href={experience.work_certificate_scan_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:underline"
                  >
                    Pokaż świadectwo pracy
                  </a>
                ) : (
                  <span className="text-slate-600">Brak świadectwa pracy</span>
                )}
              </div>

              {/* optional: barcode / nip */}
              <div className="text-sm text-slate-500 mb-1">Numer</div>
              <div className="font-mono text-slate-700">{experience.barcode ?? '—'}</div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetails(false)}
                className="rounded border px-3 py-1 bg-white text-slate-700 hover:bg-slate-50"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
