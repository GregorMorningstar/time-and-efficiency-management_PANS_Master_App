import React, { useEffect, useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import EmployeeLayout from '../employee/employee-layout';
interface EducationItem {
  id: number;
  school: string;
  start_year: string | number;
  end_year: string | number;
  level: string;
  diploma_path?: string | null;
}

interface PageProps extends Record<string, unknown> {
  educations?: { data: EducationItem[]; meta?: any };
  educationLevels?: { value: string; label: string }[];
  flash?: { success?: string; error?: string };
}

function normalize(list?: PageProps['educations']): EducationItem[] {
  if (!list) return [];
  if (Array.isArray(list)) return list;
  return list.data || [];
}

export default function EducationListPage() {
  const { educations, educationLevels, flash } = usePage<PageProps>().props;

  // Dodaj stan do obsługi komunikatu sukcesu
  const [successMsg, setSuccessMsg] = useState(flash?.success);

  useEffect(() => {
    if (flash?.success) {
      setSuccessMsg(flash.success);
      const timer = setTimeout(() => setSuccessMsg(undefined), 5000);
      return () => clearTimeout(timer);
    }
  }, [flash?.success]);

  // Dodaj stan do obsługi modalu dyplomu
  const [diplomaPreview, setDiplomaPreview] = useState<string | null>(null);

  const levelMap = (educationLevels || []).reduce<Record<string, string>>(
    (acc, l) => { acc[l.value] = l.label; return acc; }, {}
  );

  // Sortuj od najnowszej do najstarszej (po end_year, potem start_year)
  const items = normalize(educations).sort((a, b) => {
    const aEnd = Number(a.end_year) || 0;
    const bEnd = Number(b.end_year) || 0;
    const aStart = Number(a.start_year) || 0;
    const bStart = Number(b.start_year) || 0;
    if (bEnd !== aEnd) return bEnd - aEnd;
    return bStart - aStart;
  });

  const empty = items.length === 0;

  // Dodaj obsługę edycji i usuwania
  function handleEdit(id: number) {
    // Przekierowanie do strony edycji (np. /employee/education/edit/:id)
    window.location.href = `/employee/education/edit/${id}`;
  }

  function handleDelete(id: number) {
    if (confirm('Czy na pewno chcesz usunąć ten wpis?')) {
      // Wyślij żądanie usunięcia (np. przez fetch lub Inertia)
      // Przykład z fetch:
      fetch(`/employee/education/${id}`, {
        method: 'DELETE',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
        },
      }).then(() => window.location.reload());
    }
  }

  return (
    <EmployeeLayout title="Edukacja" breadcrumbs={[{ label: 'Edukacja' }]}>
      <Head title="Edukacja" />

      {/* Modal podglądu dyplomu */}
      {diplomaPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setDiplomaPreview(null)}
        >
          <div
            className="relative bg-white rounded shadow-lg p-4 max-w-xs w-full"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={`/${diplomaPreview}`}
              alt="Dyplom"
              className="max-h-80 w-auto mx-auto rounded"
            />
            <button
              className="absolute top-2 right-2 text-slate-500 hover:text-red-500"
              onClick={() => setDiplomaPreview(null)}
            >
              &#10005;
            </button>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="mt-4 flex items-start gap-3 rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-600/40 dark:bg-emerald-900/30 dark:text-emerald-300">
          <span className="mt-0.5 inline-block h-2 w-2 rounded-full bg-emerald-500" />
          <div className="flex-1">
            {successMsg}
          </div>
        </div>
      )}

      {empty && (
        <div className="mt-4 rounded border border-red-400 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-600 dark:bg-red-900/30 dark:text-red-300">
          Brak wpisów — <span className="font-semibold">uzupełnij</span>.
        </div>
      )}

      {!empty && (
        <div className="mt-5 space-y-3">
          {items.map(e => (
            <div
              key={e.id}
              className="flex items-center justify-between rounded border border-slate-300/60 bg-white/60 px-4 py-3 text-sm shadow-sm backdrop-blur dark:border-slate-600/40 dark:bg-slate-800/60"
            >
              {/* Rok szkolny */}
              <div className="min-w-[110px] text-xs text-slate-500 dark:text-slate-400 font-semibold text-center">
                {e.start_year} – {e.end_year}
              </div>
              {/* Tytuł/poziom i dyplom po lewej */}
              <div className="min-w-[170px] flex flex-col items-start">
                <span className="rounded bg-slate-200 px-2 py-0.5 mb-1 dark:bg-slate-700 text-xs text-slate-600 dark:text-slate-300">
                  {levelMap[e.level] ?? e.level}
                </span>
                {e.diploma_path ? (
                  <button
                    type="button"
                    className="text-emerald-600 hover:underline dark:text-emerald-400 text-xs"
                    onClick={() => setDiplomaPreview(e.diploma_path)}
                  >
                    Dyplom
                  </button>
                ) : (
                  <span className="text-slate-400 italic text-xs">Brak dyplomu</span>
                )}
              </div>
              {/* Nazwa szkoły pogrubiona */}
              <div className="flex-1 px-4 font-bold text-slate-800 dark:text-slate-100 text-base">
                {e.school}
              </div>
              {/* Ikony edycji i usuwania */}
              <div className="flex items-center gap-2 min-w-[70px] justify-end">
                <button
                  type="button"
                  title="Edytuj"
                  className="p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900"
                  onClick={() => handleEdit(e.id)}
                >
                  <svg width="18" height="18" fill="none" viewBox="0 0 20 20">
                    <path d="M4 13.5V16h2.5l7.1-7.1-2.5-2.5L4 13.5zM17.7 6.3c.4-.4.4-1 0-1.4l-2.6-2.6a1 1 0 0 0-1.4 0l-1.3 1.3 4 4 1.3-1.3z" fill="#2563eb"/>
                  </svg>
                </button>
                <button
                  type="button"
                  title="Usuń"
                  className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900"
                  onClick={() => handleDelete(e.id)}
                >
                  <svg width="18" height="18" fill="none" viewBox="0 0 20 20">
                    <path d="M6 7v7a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7M9 7v7M11 7v7M4 7h12M8 4h4a1 1 0 0 1 1 1v1H7V5a1 1 0 0 1 1-1z" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </EmployeeLayout>
  );
}
