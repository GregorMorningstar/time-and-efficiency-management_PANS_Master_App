import React, { ReactNode } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import AdminTopNav from '@/components/app-topnav-admin';

type Breadcrumb = { label: string; href?: string };

interface AdminLayoutProps {
  breadcrumbs?: Breadcrumb[];
  menu?: ReactNode;
  children?: ReactNode;
  showTopNav?: boolean;
  title?: string;
}

export default function AdminLayout({
  breadcrumbs = [],
  menu,
  children,
  showTopNav = true,
  title = 'Panel Administratora',
}: AdminLayoutProps) {
  const mapped = breadcrumbs.map(b => ({ title: b.label, href: b.href ?? '' }));

  return (
    <AppLayout breadcrumbs={mapped}>
      <Head title={title} />
      {showTopNav && (
        <div className="mb-4">
          <AdminTopNav />
        </div>
      )}
      <div className="flex gap-6">
        {menu && <aside className="w-64 shrink-0">{menu}</aside>}
        <main className="flex-1">
          <h1 className="text-xl font-semibold mb-4">{title}</h1>
          {children ?? <p className="text-gray-500">Brak zawartości.</p>}
        </main>
      </div>
    </AppLayout>
  );
}
