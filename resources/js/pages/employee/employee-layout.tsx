import React, { ReactNode, useEffect, useState, useRef } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import EmployeeTopNav from '@/components/app-sidebar-employee';

type Breadcrumb = { label: string; href?: string };

interface EmployeeLayoutProps {
  breadcrumbs?: Breadcrumb[];
  menu?: ReactNode;
  children?: ReactNode;
  showTopNav?: boolean;
  title?: string;
}

interface PageProps {
  flash?: {
    alertMessage: ReactNode;
    success?: string;
    error?: string;
    info?: string;
  };
  [key: string]: unknown;
}

export default function EmployeeLayout({
  breadcrumbs = [],
  menu,
  children,
  showTopNav = true,
  title = 'Panel Pracownika',
}: EmployeeLayoutProps) {
  const mapped = breadcrumbs.map(b => ({ title: b.label, href: b.href ?? '' }));
  const { flash } = usePage<PageProps>().props;

  // local flash state that will auto-hide after 5s
  const [localFlash, setLocalFlash] = useState<{ success?: ReactNode; error?: ReactNode }>({});
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (flash?.success || flash?.error) {
      setLocalFlash({ success: flash?.success, error: flash?.error });
      // clear any previous timers and schedule hide
      timersRef.current.forEach(t => clearTimeout(t));
      timersRef.current = [];
      const id = window.setTimeout(() => setLocalFlash({}), 5000);
      timersRef.current.push(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flash?.success, flash?.error]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(t => clearTimeout(t));
      timersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (flash?.success) console.log('[FLASH:success]', flash.success);
    if (flash?.error) console.warn('[FLASH:error]', flash.error);
  }, [flash]);

  return (
    <AppLayout breadcrumbs={mapped}>
      <Head title={title} />
      {showTopNav && (
        <div className="mb-4">
          <EmployeeTopNav />
        </div>
      )}

      <div className="flex gap-6">
        {menu && <aside className="w-64 shrink-0">{menu}</aside>}
        <main className="flex-1">
          <h1 className="text-xl font-semibold mb-4">{title}</h1>

          {/* Baner flash zamiast window.alertMessage — ukrywa się po 5s */}
          {localFlash?.success && (
            <div className="mb-4 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-600/40 dark:bg-emerald-900/20 dark:text-emerald-200">
              {localFlash.success}
            </div>
          )}
          {localFlash?.error && (
            <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-600/40 dark:bg-red-900/20 dark:text-red-300">
              {localFlash.error}
            </div>
          )}
          {flash?.alertMessage && (
            <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-600/40 dark:bg-red-900/20 dark:text-red-300">
              {flash.alertMessage}
            </div>
          )}

          {children ?? <p className="text-gray-500">Brak zawartości.</p>}
        </main>
      </div>
    </AppLayout>
  );
}
