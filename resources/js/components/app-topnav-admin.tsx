import React, { useState, useMemo } from 'react';
import { Link, usePage } from '@inertiajs/react';

interface NavItem { label: string; href: string; }
interface PageProps { [key: string]: any }

const baseItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Chat', href: '/chat' },
  { label: 'Użytkownicy', href: '/admin/users' },
  { label: 'Raporty', href: '/admin/reports' },
];

export default function AdminTopNav() {
  const [open, setOpen] = useState(false);
  const page = usePage<PageProps>() as any;
  const currentPath = (page?.url as string) || (typeof window !== 'undefined' ? window.location.pathname : '');
  const items = useMemo(() => baseItems, []);
  return (
    <nav className="w-full bg-slate-900 text-white shadow-md border-b border-slate-800" role="navigation" aria-label="Menu administratora">
      <div className="w-full flex flex-wrap items-center justify-between px-4 lg:px-8 py-2">
        <Link href="/dashboard" className="mr-4 block cursor-pointer py-1.5 text-base text-gray-200 font-semibold select-none">Panel Admina</Link>
        <div className={`w-full lg:w-auto ${open ? 'block' : 'hidden'} lg:block`}>
          <ul className="flex flex-col gap-2 mt-4 mb-2 lg:my-0 lg:flex-row lg:items-center lg:gap-6">
            {items.map(item => {
              const active = item.href === '/' ? currentPath === '/' : currentPath.startsWith(item.href);
              return (
                <li key={item.href} className={`flex items-center p-1 text-sm gap-x-2 transition-colors ${active ? 'text-white font-medium' : 'text-gray-300'}`}>
                  <Link href={item.href} className="flex items-center hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-sm" onClick={() => setOpen(false)}>
                    {item.label}
                  </Link>
                  {active && <span className="ml-1 h-2 w-2 rounded-full bg-emerald-400" aria-label="aktywny"/>}
                </li>
              );
            })}
          </ul>
        </div>
        <button className="relative ml-auto h-9 w-9 select-none rounded-md text-center lg:hidden hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400" type="button" aria-label="Przełącz menu" aria-expanded={open} onClick={() => setOpen(o=>!o)}>
          <span className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              {open ? <path d="M6 18L18 6M6 6l12 12"/> : <path d="M4 6h16M4 12h16M4 18h16"/>}
            </svg>
          </span>
        </button>
      </div>
    </nav>
  );
}
