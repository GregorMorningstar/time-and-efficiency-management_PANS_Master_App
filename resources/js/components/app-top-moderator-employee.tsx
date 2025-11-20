import React from 'react';

export default function ModeratorEmployeTopNav() {
  const [open, setOpen] = React.useState(false);
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  const normalize = (p: string) => (p || '').replace(/\/+$/, '');
  const isActive = (href: string) => {
    if (!href) return false;
    const cur = normalize(currentPath);
    const h = normalize(href);
    return cur === h || cur.startsWith(h + '/');
  };

  const dropdownItemClass = (href: string) =>
    `block px-4 py-2 text-sm ${isActive(href) ? 'bg-emerald-100 text-emerald-800 font-medium' : 'text-slate-700 hover:bg-slate-100'}`;

  const topLinkClass = (href: string) =>
    `px-3 py-2 text-sm rounded ${isActive(href) ? 'bg-emerald-100 text-emerald-800 font-medium' : 'text-slate-700 hover:text-slate-900'}`;

  return (
    <nav className="flex items-center gap-4 p-3 bg-white border-b shadow-sm">
      {/* dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((s) => !s)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className={`px-3 py-2 rounded-md text-sm ${open ? 'bg-emerald-100 text-emerald-800 font-medium' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}
          aria-expanded={open}
          aria-haspopup="menu"
        >
          Pracownicy
        </button>

        {open && (
          <div
            role="menu"
            className="absolute left-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-20"
          >
            <a href="/moderator/employee/" className={dropdownItemClass('/moderator/employee/')} role="menuitem" aria-current={isActive('/moderator/employee/') ? 'page' : undefined}>Lista</a>
            <a href="/employee/profile" className={dropdownItemClass('/employee/profile')} role="menuitem" aria-current={isActive('/employee/profile') ? 'page' : undefined}>Profil</a>
            <a href="/employee/settings" className={dropdownItemClass('/employee/settings')} role="menuitem" aria-current={isActive('/employee/settings') ? 'page' : undefined}>Ustawienia</a>
          </div>
        )}
      </div>

      {/* pozostałe linki */}
      <a href="/moderator/employee/check-education" className={topLinkClass('/moderator/employee/check-education')}>Świadectwa Szkolne</a>
      <a href="/employee/link-3" className={topLinkClass('/employee/link-3')}>Link 3</a>
    </nav>
  );
}
