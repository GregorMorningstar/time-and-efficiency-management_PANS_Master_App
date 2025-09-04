import React from 'react';
import { Link } from '@inertiajs/react';

export interface EducationCardProps {
  school: string;
  startYear: string | number;
  endYear: string | number;
  levelLabel: string;
  diplomaUrl?: string | null;
  createdAt?: string;
  actions?: {
    viewDiploma?: boolean;
    editHref?: string;
    deleteHref?: string;
  };
  onDelete?: () => void;
  compact?: boolean;
}

export function EducationCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200/70 dark:border-slate-700/70 bg-gradient-to-br from-white/70 to-slate-50/40 dark:from-slate-800/60 dark:to-slate-800/30 backdrop-blur shadow-sm p-4 space-y-3">
      <div className="h-4 w-40 rounded bg-slate-200/80 dark:bg-slate-600/60" />
      <div className="flex gap-2">
        <div className="h-5 w-20 rounded bg-slate-200/80 dark:bg-slate-600/60" />
        <div className="h-5 w-16 rounded bg-slate-200/80 dark:bg-slate-600/60" />
      </div>
      <div className="h-6 w-full rounded bg-slate-200/60 dark:bg-slate-600/50" />
    </div>
  );
}

const badgeBase = 'inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase';

export default function EducationCard({
  school,
  startYear,
  endYear,
  levelLabel,
  diplomaUrl,
  createdAt,
  actions,
  onDelete,
  compact = false,
}: EducationCardProps) {
  return (
    <div
      className={[
        'group relative overflow-hidden rounded-xl border border-slate-200/70 dark:border-slate-700/70',
        'bg-gradient-to-br from-white/85 via-white/70 to-slate-50/40 dark:from-slate-800/70 dark:via-slate-800/50 dark:to-slate-800/30',
        'shadow-sm backdrop-blur transition hover:shadow-md hover:border-emerald-300/60 dark:hover:border-emerald-500/40',
        compact ? 'p-4' : 'p-5',
      ].join(' ')}
    >
      {/* Accent bar */}
      <span className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-emerald-500/70 dark:bg-emerald-500 rounded-r" />

      <div className="flex flex-col gap-3">
        {/* Top */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
              {school}
            </h3>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-wide">
              {startYear} – {endYear}
            </p>
          </div>

            <span
              className={[
                badgeBase,
                'bg-emerald-50 text-emerald-700 dark:bg-emerald-600/20 dark:text-emerald-300 ring-1 ring-inset ring-emerald-500/20',
              ].join(' ')}
            >
              {levelLabel}
            </span>
        </div>

        {/* Diploma */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          {diplomaUrl ? (
            <a
              href={diplomaUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1 rounded-md bg-emerald-600/90 px-2 py-1 text-white hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-[11px]"
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5" />
                <path d="M14 3H2" />
                <path d="M6 3V1h4v2" />
              </svg>
              Dyplom
            </a>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-red-600 ring-1 ring-inset ring-red-500/20 dark:bg-red-600/15 dark:text-red-300">
              Brak dyplomu
            </span>
          )}

          {createdAt && (
            <span className="ml-auto text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
              {createdAt}
            </span>
          )}
        </div>

        {/* Actions */}
        {(actions?.editHref || actions?.deleteHref) && (
          <div className="mt-1 flex items-center gap-2">
            {actions.editHref && (
              <Link
                href={actions.editHref}
                className="rounded-md border border-slate-300/60 bg-white/60 px-2 py-1 text-[11px] font-medium text-slate-700 hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-600/60 dark:bg-slate-700/40 dark:text-slate-200 dark:hover:border-emerald-500/50 dark:hover:text-emerald-300"
              >
                Edytuj
              </Link>
            )}
            {actions.deleteHref && (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-md border border-red-300/60 bg-red-50 px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300 dark:border-red-500/40 dark:bg-red-600/15 dark:text-red-300 dark:hover:bg-red-600/25"
              >
                Usuń
              </button>
            )}
          </div>
        )}
      </div>

      {/* Hover glow */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition">
        <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-emerald-400/0 via-emerald-400/10 to-emerald-400/0 blur-md" />
      </div>
    </div>
  );
}