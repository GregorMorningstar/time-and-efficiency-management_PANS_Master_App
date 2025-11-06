import React, { useRef, useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';

type NavItem = {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
};

export default function ModeratorTopNavMachines() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const timerRef = useRef<number | null>(null);
  const CLOSE_DELAY = 160; // ms

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const nav: NavItem[] = [
    { label: 'Lista maszyn', href: '/moderator/machines' },
    { label: 'Dodaj', href: '/moderator/machines/add' },

    {
      label: 'Awarie',
      href: '/moderator/machines/failures',
      children: [
        { label: 'Lista awari maszyn', href: '/moderator/machines/failures/list' },
        { label: 'Historia awarii', href: '/moderator/machines/failures/history' },
        { label: 'Kalendarz awarii', href: '/moderator/machines/failures/calendar' },
      ],
    },
    {
      label: 'Pracownicy na maszynach',
      children: [
        { label: 'Lista pracowników', href: '/moderator/machines/employees/list' },
        { label: 'Historia pracowników', href: '/moderator/machines/employees/history' },
        { label: 'Kalendarz pracowników', href: '/moderator/machines/employees/calendar' },
      ],
    },
    { label: 'Wydajność', href: '/moderator/machines/performance' },
    { label: 'Link 5', href: '/moderator/link5' },
  ];

  const [activePath, setActivePath] = useState<string>(window.location.pathname);

  useEffect(() => {
    const onPop = () => setActivePath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const isActive = (href?: string) => {
    if (!href) return false;
    return activePath === href || activePath.startsWith(href + '/');
  };

  return (
    <nav className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">

            {/* Tabs */}
            <div className="hidden sm:flex items-center space-x-2">
              {nav.map((item, idx) => {
                if (item.children) {
                  const isOpen = openIndex === idx;

                  return (
                    <div
                      key={idx}
                      className="relative"
                      onMouseEnter={() => { clearTimer(); setOpenIndex(idx); }}
                      onMouseLeave={() => { clearTimer(); timerRef.current = window.setTimeout(() => setOpenIndex(prev => prev === idx ? null : prev), CLOSE_DELAY); }}
                    >
                      <div className={`flex items-center rounded-md ${isOpen || item.children.some(c => isActive(c.href)) ? 'bg-white border border-indigo-100 shadow-sm' : ''}`}>
                        {/* label jako link jeśli href istnieje */}
                        {item.href ? (
                          <Link
                            href={item.href}
                            className={`px-3.5 py-2 text-sm font-medium ${isActive(item.href) ? 'text-indigo-700' : 'text-slate-600 hover:text-slate-900'}`}
                          >
                            {item.label}
                          </Link>
                        ) : (
                          <span className="px-3.5 py-2 text-sm font-medium text-slate-600">{item.label}</span>
                        )}

                        {/* caret - oddzielny przycisk do rozwijania */}
                        <button
                          onClick={() => { clearTimer(); setOpenIndex(prev => prev === idx ? null : idx); }}
                          aria-expanded={isOpen}
                          className="px-2 py-2 text-sm text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                          <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                        </button>
                      </div>

                      {isOpen && (
                        <div
                          className="absolute left-0 mt-2 w-44 bg-white border border-slate-200 rounded-md shadow-sm z-20"
                          onMouseEnter={() => { clearTimer(); setOpenIndex(idx); }}
                          onMouseLeave={() => { clearTimer(); timerRef.current = window.setTimeout(() => setOpenIndex(prev => prev === idx ? null : prev), CLOSE_DELAY); }}
                        >
                          {item.children.map((c, i) => (
                            <Link
                              key={i}
                              href={c.href}
                              className={`block px-4 py-2 text-sm transition-colors ${isActive(c.href) ? 'text-indigo-700 bg-indigo-50' : 'text-slate-700 hover:bg-slate-50'}`}
                            >
                              {c.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                // regular item
                return (
                  <Link
                    key={idx}
                    href={item.href || '#'}
                    className={`px-3.5 py-2 rounded-md text-sm font-medium transition-shadow duration-150 ${
                      isActive(item.href)
                        ? 'bg-white text-indigo-700 border border-indigo-100 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:shadow-sm'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Mobile / small screens: simple row */}
          <div className="flex sm:hidden items-center gap-3 py-2">
            {nav.map((n, i) => (
              <Link
                key={i}
                href={n.href || '#'}
                className={`text-xs px-3 py-1 rounded-md transition-colors ${isActive(n.href) ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
