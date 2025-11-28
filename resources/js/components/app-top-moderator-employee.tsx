import React from 'react';

export default function ModeratorEmployeTopNav() {
  const [open, setOpen] = React.useState(false);
  const [eduOpen, setEduOpen] = React.useState(false);
  const [workOpen, setWorkOpen] = React.useState(false);
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  const normalize = (p: string) => (p || '').replace(/\/+$/, '');

  // dokładne dopasowanie (tylko exact)
  const isActiveExact = (href: string) => {
    if (!href) return false;
    return normalize(currentPath) === normalize(href);
  };

  // dopasowanie "startsWith" (dla sekcji, np. /moderator/employee/*)
  const isActive = (href: string) => {
    if (!href) return false;
    const cur = normalize(currentPath);
    const h = normalize(href);
    return cur === h || cur.startsWith(h + '/');
  };

  const dropdownItemClass = (href: string) =>
    // submenu = only exact active
    `block px-4 py-2 text-sm ${isActiveExact(href) ? 'bg-emerald-100 text-emerald-800 font-medium' : 'text-slate-700 hover:bg-slate-100'}`;

  const topLinkClass = (href: string, exact = false) =>
    // dla niektórych top-linków (np. check-education) chcemy exact match
    `px-3 py-2 text-sm rounded ${exact ? (isActiveExact(href) ? 'bg-emerald-100 text-emerald-800 font-medium' : 'text-slate-700 hover:text-slate-900') : (isActive(href) ? 'bg-emerald-100 text-emerald-800 font-medium' : 'text-slate-700 hover:text-slate-900')}`;

  return (
    <nav className="flex items-center gap-4 p-3 bg-white border-b shadow-sm">
      <div
        className="relative"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setTimeout(() => setOpen(false), 150)}
      >
        <a
          href="/moderator/employee/"
          className={topLinkClass('/moderator/employee', true)}
          aria-expanded={open}
        >
          Pracownicy
        </a>

        <div
          role="menu"
          className={`absolute left-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-20 origin-top transition transform ${open ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-1 scale-95 pointer-events-none'}`}
          aria-hidden={!open}
        >
          <a href="/moderator/employee/" className={dropdownItemClass('/moderator/employee/')} role="menuitem" aria-current={isActiveExact('/moderator/employee/') ? 'page' : undefined}>Lista</a>
          <a href="/moderator/employee/profile" className={dropdownItemClass('/moderator/employee/profile')} role="menuitem" aria-current={isActiveExact('/moderator/employee/profile') ? 'page' : undefined}>Profil pracownika</a>
          <a href="/moderator/employee/settings" className={dropdownItemClass('/moderator/employee/settings')} role="menuitem" aria-current={isActiveExact('/moderator/employee/settings') ? 'page' : undefined}>Ustawienia</a>
        </div>
      </div>


      <div
        className="relative"
        onMouseEnter={() => setEduOpen(true)}
        onMouseLeave={() => setTimeout(() => setEduOpen(false), 150)}
      >
        <a
          href="/moderator/employee/check-education"
          className={topLinkClass('/moderator/employee/check-education', true)} // exact dla top linku
          aria-expanded={eduOpen}
          onClick={() => setEduOpen((s) => !s)}
        >
          Świadectwa Szkolne
        </a>

        <div
          role="menu"
          className={`absolute left-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-20 origin-top transition transform ${eduOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-1 scale-95 pointer-events-none'}`}
          aria-hidden={!eduOpen}
        >
          <a href="/moderator/employee/check-education/swiadectwo1" className={dropdownItemClass('/moderator/employee/check-education/swiadectwo1')} role="menuitem" aria-current={isActiveExact('/moderator/employee/check-education/swiadectwo1') ? 'page' : undefined}>Świadectwo 1</a>
          <a href="/moderator/employee/check-education/swiadectwo2" className={dropdownItemClass('/moderator/employee/check-education/swiadectwo2')} role="menuitem" aria-current={isActiveExact('/moderator/employee/check-education/swiadectwo2') ? 'page' : undefined}>Świadectwo 2</a>
        </div>
      </div>

      {/* Świadectwa Pracy z submenu */}
      <div
        className="relative"
        onMouseEnter={() => setWorkOpen(true)}
        onMouseLeave={() => setTimeout(() => setWorkOpen(false), 150)}
      >
        <a
          href="/moderator/employee/check-all-career"
          className={topLinkClass('/moderator/employee/check-all-career', true)}
          aria-expanded={workOpen}
          onClick={() => setWorkOpen((s) => !s)}
        >
          Świadectwa Pracy
        </a>

        <div
          role="menu"
          className={`absolute left-0 mt-2 w-56 bg-white border rounded-md shadow-lg z-20 origin-top transition transform ${workOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-1 scale-95 pointer-events-none'}`}
          aria-hidden={!workOpen}
        >
          <a href="/moderator/employee/check-work/praca1" className={dropdownItemClass('/moderator/employee/check-work/praca1')} role="menuitem" aria-current={isActiveExact('/moderator/employee/check-work/praca1') ? 'page' : undefined}>Świadectwo Pracy 1</a>
          <a href="/moderator/employee/check-work/praca2" className={dropdownItemClass('/moderator/employee/check-work/praca2')} role="menuitem" aria-current={isActiveExact('/moderator/employee/check-work/praca2') ? 'page' : undefined}>Świadectwo Pracy 2</a>
        </div>
      </div>
    </nav>
  );
}
