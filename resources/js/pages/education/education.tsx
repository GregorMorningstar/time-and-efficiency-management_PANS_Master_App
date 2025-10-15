import React, { useEffect, useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import EmployeeLayout from '../employee/employee-layout';
import EducationListCard from '../../components/card/education-list-card';


import Barcode from 'react-barcode';
interface EducationItem {
  id: number;
  school: string;
  start_year: string | number;
  end_year: string | number;
  level: string;
  diploma_path?: string | null;
  barcode?: string | null;
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
  // Maintain local items state for client-side pagination and updates
  const [allItems, setAllItems] = useState<EducationItem[]>(items);
  useEffect(() => {
    setAllItems(items);
  }, [educations]);

  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(allItems.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages]);

  const paginatedItems = allItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const empty = allItems.length === 0;

  function handleEdit(id: number) {
    window.location.href = `/employee/education/${id}/edit`;
  }

  function handleDelete(id: number) {
    if (!confirm('Czy na pewno chcesz usunąć ten wpis?')) return;

    let url = '/employee/education/delete';

    try {
      if (typeof route === 'function') {
        const resolved = route('employee.education.delete');
        if (typeof resolved === 'string' && !resolved.includes('.')) {
          url = resolved;
        }
      }
    } catch (e) {
    }

    router.post(url, { id }, {
      preserveState: true,
      onSuccess: () => {
        setAllItems((prev) => {
          const next = prev.filter(it => it.id !== id);
          return next;
        });
      },
      onError: (errors) => {
        alert('Błąd usuwania: ' + JSON.stringify(errors));
      }
    });
  }

  return (
    <EmployeeLayout title="Edukacja" breadcrumbs={[{ label: 'Edukacja' }]}>
      <Head title="Edukacja" />

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
        <div className="mt-5 w-full">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedItems.map(e => (
              <EducationListCard
                key={e.id}
                education={e}
                levelLabel={levelMap[e.level] ?? e.level}
                onEdit={(id) => handleEdit(id)}
                onDelete={(id) => handleDelete(id)}
              />
            ))}
          </div>

          {/* Pagination controls */}
          {allItems.length > itemsPerPage && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                className="px-3 py-1 rounded border bg-white hover:bg-gray-100"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Prev
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    className={`px-3 py-1 rounded border ${page === currentPage ? 'bg-emerald-600 text-white' : 'bg-white hover:bg-gray-100'}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                className="px-3 py-1 rounded border bg-white hover:bg-gray-100"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </EmployeeLayout>
  );
}

