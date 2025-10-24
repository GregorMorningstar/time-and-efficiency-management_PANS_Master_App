import React, { useRef, useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';

type NavItem = {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
};

export default function ModeratorTopNav() {
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);

  const timer2 = useRef<number | null>(null);
  const timer3 = useRef<number | null>(null);
  const CLOSE_DELAY = 160; // ms

  const clearTimer2 = () => {
    if (timer2.current) {
      window.clearTimeout(timer2.current);
      timer2.current = null;
    }
  };
  const clearTimer3 = () => {
    if (timer3.current) {
      window.clearTimeout(timer3.current);
      timer3.current = null;
    }
  };

  const nav: NavItem[] = [
    { label: 'Dashboard', href: '/moderator/dashboard' },
    {
      label: 'Maszyny',
      children: [
        { label: 'Link 2.1', href: '/moderator/link2/1' },
        { label: 'Link 2.2', href: '/moderator/link2/2' },
      ],
    },
    {
      label: 'Link 3',
      children: [
        { label: 'Link 3.1', href: '/moderator/link3/1' },
        { label: 'Link 3.2', href: '/moderator/link3/2' },
        { label: 'Link 3.3', href: '/moderator/link3/3' },
      ],
    },
    { label: 'Link 4', href: '/moderator/link4' },
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
                // submenu Link 2
                if (item.children && item.label === 'Link 2') {
                  return (
                    <div
                      key={idx}
                      className="relative"
                      onMouseEnter={() => { clearTimer2(); setOpen2(true); }}
                      onMouseLeave={() => { clearTimer2(); timer2.current = window.setTimeout(() => setOpen2(false), CLOSE_DELAY); }}
                    >
                      <button
                        onClick={() => { clearTimer2(); setOpen2(v => !v); }}
                        className={`px-3.5 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-shadow duration-150 focus:outline-none ${
                          open2 || item.children.some(c => isActive(c.href))
                            ? 'bg-white text-indigo-700 border border-indigo-100 shadow-sm'
                            : 'text-slate-600 hover:bg-slate-50 hover:shadow-sm'
                        }`}
                        aria-expanded={open2}
                      >
                        {item.label}
                        <svg className={`w-3 h-3 transition-transform ${open2 ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                      </button>

                      {open2 && (
                        <div
                          className="absolute left-0 mt-2 w-44 bg-white border border-slate-200 rounded-md shadow-sm z-20"
                          onMouseEnter={() => { clearTimer2(); setOpen2(true); }}
                          onMouseLeave={() => { clearTimer2(); timer2.current = window.setTimeout(() => setOpen2(false), CLOSE_DELAY); }}
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

                // submenu Link 3
                if (item.children && item.label === 'Link 3') {
                  return (
                    <div
                      key={idx}
                      className="relative"
                      onMouseEnter={() => { clearTimer3(); setOpen3(true); }}
                      onMouseLeave={() => { clearTimer3(); timer3.current = window.setTimeout(() => setOpen3(false), CLOSE_DELAY); }}
                    >
                      <button
                        onClick={() => { clearTimer3(); setOpen3(v => !v); }}
                        className={`px-3.5 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-shadow duration-150 focus:outline-none ${
                          open3 || item.children.some(c => isActive(c.href))
                            ? 'bg-white text-indigo-700 border border-indigo-100 shadow-sm'
                            : 'text-slate-600 hover:bg-slate-50 hover:shadow-sm'
                        }`}
                        aria-expanded={open3}
                      >
                        {item.label}
                        <svg className={`w-3 h-3 transition-transform ${open3 ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                      </button>

                      {open3 && (
                        <div
                          className="absolute left-0 mt-2 w-44 bg-white border border-slate-200 rounded-md shadow-sm z-20"
                          onMouseEnter={() => { clearTimer3(); setOpen3(true); }}
                          onMouseLeave={() => { clearTimer3(); timer3.current = window.setTimeout(() => setOpen3(false), CLOSE_DELAY); }}
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
