import React, { ReactNode } from 'react';
import AppLayout from '@/layouts/app-layout'; // upewnij się że ścieżka dobra

type Breadcrumb = { label: string; href?: string };

type DashboardProps = {
  breadcrumbs?: Breadcrumb[];
  menu?: ReactNode;
  children?: ReactNode;
};

export default function ModeratorDashboard({ breadcrumbs = [], menu, children }: DashboardProps) {
  return (
    <AppLayout breadcrumbs={breadcrumbs.map(({ label, href }) => ({ title: label, href: href ?? '' }))}>
      <div className="flex gap-6">
        {menu && <aside className="w-64 shrink-0">{menu}</aside>}
        <main className="flex-1">
          <h1 className="text-xl font-semibold mb-4">Panel moderatora</h1>
          {children ?? <p className="text-gray-500">Brak zawartości.</p>}
        </main>
      </div>
    </AppLayout>
  );
}