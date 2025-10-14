import React, { useState } from 'react';
import { usePage, Link } from '@inertiajs/react';

interface User {
  role?: string;
  education_completed?: boolean;
  experience_completed?: boolean;
  address_completed?: boolean;
}

type NavGroup = {
  label: string;
  baseHref?: string;
  warn?: boolean;
  children?: { label: string; href: string }[];
};

export default function EmployeeTopNav() {
  const user = usePage<{ auth?: { user?: User } }>().props.auth?.user;
  const [openMain, setOpenMain] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

  const needsEducation = user?.role === 'employee' && user.education_completed === false;

  const groups: NavGroup[] = [
    { label: 'Dashboard', baseHref: '/employee/dashboard' },
    {
      label: 'Edukacja',
      baseHref: '/employee/education',
      warn: needsEducation,
      children: [
        { label: 'Przegląd', href: '/employee/education' },
        { label: 'Dodaj szkołę', href: '/employee/education/add' },
      ],
    },
    //kariera
    {
      label: 'Kariera',
      baseHref: '/employee/career/my-experiences',
      children: [
        { label: 'Historia', href: '/employee/career/my-experiences' },
        { label: 'Dodaj', href: '/employee/career/add' },
      ],
    },

//adres
    { label: 'Adres',
       baseHref: '/employee/address',
      children: [
        { label: 'Przegląd', href: '/employee/address' },
        { label: 'Dodaj adres', href: '/employee/address/add' },
      ],
    },

    //kalendarz
    { label: 'Kalendarz',
      baseHref: '/employee/calendar',
      children: [
        { label: 'Przegląd', href: '/employee/calendar' },
        { label: 'Urlop', href: '/employee/calendar/leave' },
        { label: 'Dodaj urlop', href: '/employee/calendar/leave/add' },
      ],
    },
  ];
  function isActive(href?: string) {
    if (!href) return false;
    return currentPath === href || currentPath.startsWith(href + '/');
  }

  return (
    <nav className="w-full bg-slate-700 text-white shadow-md border-b border-slate-500" role="navigation" aria-label="Główne menu">
      <div className="w-full flex flex-wrap items-center justify-between px-4 lg:px-8 py-2">
        <Link
          href="/employee/dashboard"
            className="mr-4 block cursor-pointer py-1.5 text-base text-gray-200 font-semibold select-none"
        >
          Panel Pracownika
        </Link>

        <div className={`w-full lg:w-auto ${openMain ? 'block' : 'hidden'} lg:block`}>
          <ul className="flex flex-col gap-2 mt-4 mb-2 lg:my-0 lg:flex-row lg:items-center lg:gap-6">
            {groups.map(g => {
              const hasChildren = !!g.children?.length;
              const active = isActive(g.baseHref);
              const dropdownOpen = openDropdown === g.label;
              return (
                <li key={g.label} className="relative">
                  <div
                    className={[
                      'flex items-center gap-1 p-1 text-sm cursor-pointer select-none transition-colors',
                      active ? 'text-white font-medium' : 'text-gray-300 hover:text-white',
                      g.warn ? 'text-red-500 font-semibold animate-pulse' : '',
                    ].join(' ')}
                    onClick={() => {
                      if (hasChildren) {
                        setOpenDropdown(d => (d === g.label ? null : g.label));
                      } else {
                        setOpenMain(false);
                      }
                    }}
                    onMouseEnter={() => hasChildren && setOpenDropdown(g.label)}
                    onMouseLeave={() => hasChildren && setOpenDropdown(d => (d === g.label ? d : null))}
                  >
                    {g.baseHref ? (
                      <Link
                        href={g.baseHref}
                        className="flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-sm"
                        onClick={() => setOpenMain(false)}
                      >
                        {g.label}
                      </Link>
                    ) : (
                      <span>{g.label}</span>
                    )}
                    {hasChildren && (
                      <span
                        className={`transition-transform text-xs ${dropdownOpen ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                      >
                        ▾
                      </span>
                    )}
                    {active && !hasChildren && (
                      <span className="ml-1 h-2 w-2 rounded-full bg-emerald-400" aria-label="aktywny" />
                    )}
                    {g.warn && !active && (
                      <span className="ml-2 rounded bg-red-500/20 px-1.5 text-[10px] uppercase tracking-wide text-red-400">
                        Brak
                      </span>
                    )}
                  </div>

                  {hasChildren && (
                    <div
                      onMouseEnter={() => setOpenDropdown(g.label)}
                      onMouseLeave={() => setOpenDropdown(d => (d === g.label ? null : d))}
                      className={[
                        'absolute z-20 mt-1 min-w-[190px] rounded border border-slate-600/60 bg-slate-800/95 backdrop-blur px-2 py-2 shadow-lg transition',
                        dropdownOpen ? 'opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-95',
                      ].join(' ')}
                    >
                      <ul className="flex flex-col gap-1">
                        {g.children!.map(c => {
                          const childActive = currentPath === c.href;
                          return (
                            <li key={c.href}>
                              <Link
                                href={c.href}
                                onClick={() => {
                                  setOpenDropdown(null);
                                  setOpenMain(false);
                                }}
                                className={[
                                  'block rounded px-2 py-1 text-xs tracking-wide',
                                  childActive
                                    ? 'bg-emerald-600 text-white'
                                    : 'text-gray-300 hover:text-white hover:bg-slate-700',
                                ].join(' ')}
                              >
                                {c.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <button
          className="relative ml-auto h-9 w-9 select-none rounded-md text-center lg:hidden hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          type="button"
          aria-label="Przełącz menu"
          aria-expanded={openMain}
          onClick={() => setOpenMain(o => !o)}
        >
          <span className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              {openMain ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </span>
        </button>
      </div>

      {needsEducation && (
        <div className="mt-2 h-6 relative overflow-hidden bg-red-600/90 text-[11px] font-medium tracking-wide text-red-50 rounded-sm">
          <div className="absolute inset-0 flex items-center whitespace-nowrap animate-[marquee_10s_linear_infinite]">
            <span className="px-4">Nie dodano szkół – uzupełnij zakładkę „Edukacja”</span>
          </div>
        </div>
      )}
    </nav>
  );
}
