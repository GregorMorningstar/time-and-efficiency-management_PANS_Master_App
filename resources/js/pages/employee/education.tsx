import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import EmployeeLayout from './employee-layout';

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

  const levelMap = (educationLevels || []).reduce<Record<string, string>>(
    (acc, l) => { acc[l.value] = l.label; return acc; }, {}
  );

  const items = normalize(educations);
  const empty = items.length === 0;

  return (
    <EmployeeLayout title="Edukacja" breadcrumbs={[{ label: 'Edukacja' }]}>
      <Head title="Edukacja" />
      <h1 className="text-2xl font-semibold">Edukacja</h1>

      {flash?.success && (
        <div className="mt-4 flex items-start gap-3 rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-600/40 dark:bg-emerald-900/30 dark:text-emerald-300">
          <span className="mt-0.5 inline-block h-2 w-2 rounded-full bg-emerald-500" />
          <div className="flex-1">
            {flash.success}
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
              className="rounded border border-slate-300/60 bg-white/60 px-4 py-3 text-sm shadow-sm backdrop-blur dark:border-slate-600/40 dark:bg-slate-800/60"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-medium text-slate-800 dark:text-slate-100">
                  {e.school}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {e.start_year} – {e.end_year}
                </div>
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                <span className="rounded bg-slate-200 px-2 py-0.5 dark:bg-slate-700">
                  {levelMap[e.level] ?? e.level}
                </span>
                {e.diploma_path && (
                  <a
                    href={`/${e.diploma_path}`} /* jeśli zapisujesz w public/image/dyploms */
                    target="_blank"
                    rel="noopener"
                    className="text-emerald-600 hover:underline dark:text-emerald-400"
                  >
                    Dyplom
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </EmployeeLayout>
  );
}
