import React, { useEffect, useMemo, useState } from 'react';
import { Car } from 'lucide-react';
import EmployeeLayout from '../employee/employee-layout';
import CareerCard from '@/components/card/career-card';

interface PageProps extends Record<string, unknown> {
  experiences?: { data: any[]; meta?: any };
  flash?: { success?: string; error?: string };
}

type ExperienceItem = {
  id: number;
  position: string;
  company: string;
  company_name: string;
  start_date: string;
  end_date?: string | null;
  is_current: boolean;
  description?: string | null;
  barcode?: string | null;
};

export default function ExperienceListCurrentUserPage({ experiences }: { experiences?: any }) {
  const items: ExperienceItem[] = experiences?.data ?? [];
  const perPage = 6;
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    // reset to first page when data changes
    setPage(1);
  }, [items.length]);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return items.slice(start, start + perPage);
  }, [items, page]);

  return (
    <EmployeeLayout title="Moje przebiegi kariery">
      <div className="mb-4">
        {total === 0 && (
          <div className="text-sm text-slate-600">Brak wpisów przebiegu kariery.</div>
        )}
      </div>
{}
      {/* grid: max 3 karty w rzędzie */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paged.map((experience: ExperienceItem) => (
          <CareerCard
            key={experience.id}
            experience={{
              ...experience,
              company_name: experience.company_name ?? experience.company ?? 'Nieznana firma',
              detailsHref: `/career/experience/${experience.id}`,
              editHref: `/career/experience/${experience.id}/edit`,
            }}
          />
        ))}
      </div>

      {/* Pagination (show only if more than one page) */}
      {total > perPage && (
        <nav className="mt-6 flex items-center justify-center gap-2" aria-label="Pagination">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded border bg-white text-sm disabled:opacity-40"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`px-3 py-1 rounded border text-sm ${p === page ? 'bg-emerald-500 text-white' : 'bg-white'}`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded border bg-white text-sm disabled:opacity-40"
          >
            Next
          </button>
        </nav>
      )}
    </EmployeeLayout>
  );
}
