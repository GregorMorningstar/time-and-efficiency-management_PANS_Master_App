import React from 'react';
import { Link } from '@inertiajs/react';

type Crumb = { label: string; href?: string | null };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (!items || items.length === 0) return null;
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center text-sm text-slate-500 space-x-2">
        {items.map((it, idx) => {
          const last = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center">
              {!last && it.href ? (
                <Link href={it.href} className="text-slate-600 hover:underline">{it.label}</Link>
              ) : (
                <span className="text-slate-800 font-medium">{it.label}</span>
              )}
              {!last && <span className="mx-2 text-slate-400">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
