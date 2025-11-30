import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Edit2, Trash2, Eye, Bug, Clock, PlusCircle, X } from 'lucide-react';
import { usePage } from '@inertiajs/react';
const LazyBarcode = React.lazy(() => import('react-barcode'));

type Paginator = {
  data?: any[];
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
  links?: { url: string | null; label: string; active: boolean }[];
};

export default function MachinesList({ machines }: { machines: any[] | Paginator }) {
  const page = usePage();
  const statusesProp: { value: string; label?: string; color?: string }[] = (page.props as any).statuses ?? [];
  const user = (page.props as any).auth?.user ?? (page.props as any).user ?? null;
  const role = user?.role ?? user?.roles?.[0]?.name ?? null;
  const canManage = role === 'admin' || role === 'moderator';

  const defaultStatusMap: Record<string, { label: string; color: string }> = {
    active: { label: 'Aktywna', color: '#10B981' },
    available: { label: 'Dostępna', color: '#10B981' },
    working: { label: 'W pracy', color: '#10B981' },
    operational: { label: 'Sprawna', color: '#10B981' },
    maintenance: { label: 'W serwisie', color: '#F59E0B' }, // amber-500
    in_maintenance: { label: 'W serwisie', color: '#F59E0B' },
    forced_downtime: { label: 'Przymusowy postój', color: '#F59E0B' },
    offline: { label: 'Offline', color: '#EF4444' }, // red-500
    broken: { label: 'Uszkodzona', color: '#EF4444' },
    breakdown: { label: 'Awaria', color: '#EF4444' },
    inactive: { label: 'Nieaktywna', color: '#64748B' }, // slate-500
    idle: { label: 'Bezczynna', color: '#64748B' },
    unknown: { label: 'Brak statusu', color: '#64748B' },
  };

  const statusMap = Object.fromEntries(
    Object.entries(defaultStatusMap).map(([k, v]) => [k, v])
  ) as Record<string, { label: string; color: string }>;

  if (Array.isArray(statusesProp) && statusesProp.length) {
    for (const s of statusesProp) {
      if (!s.value) continue;
      const normalize = (v: string) => String(v ?? '').toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
      const key = normalize(String(s.value));
      statusMap[key] = {
        label: s.label ? String(s.label) : (statusMap[key]?.label ?? String(s.value)),
        color: s.color ?? (statusMap[key]?.color ?? '#64748B'),
      };
    }
  }

  const items: any[] = Array.isArray(machines) ? machines : (machines?.data ?? []);
  const links = !Array.isArray(machines) && (machines as Paginator).links ? (machines as Paginator).links : null;

  // modal state
  const [selected, setSelected] = useState<any | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSelected(null);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((machine) => {
          const imageUrl =
            machine.image_path
              ? (typeof machine.image_path === 'string' && machine.image_path.startsWith('http')
                  ? machine.image_path
                  : `/storage/${machine.image_path}`)
              : null;

          const normalize = (v: string) => String(v ?? '').toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
          const rawStatus = String(machine.status ?? machine.state ?? 'unknown');
          console.log('machine status debug', machine.id, 'rawStatus:', rawStatus);
          const key = normalize(rawStatus);
          const statusMeta = statusMap[key] ?? { label: rawStatus || 'Brak statusu', color: '#64748B' };
          console.log('statusMeta', statusMeta);

          const faultsCount = machine.faults_count ?? machine.faults?.length ?? 0;

          const cardClasses = `p-4 bg-white rounded shadow flex flex-col border-l-4 border-b-2`;
          const cardStyle = { borderLeftColor: statusMeta.color, borderBottomColor: statusMeta.color };

          const badgeStyle = {
            backgroundColor: `${statusMeta.color}20`,
            color: statusMeta.color,
            border: `1px solid ${statusMeta.color}33`,
          };

          return (
            <div key={machine.id} className={cardClasses} style={cardStyle}>
              {/* name + status */}
              <div>
                <h4 className="text-lg font-medium">{machine.name}</h4>
                <div className="text-sm text-slate-500 mt-1">Wydział: {machine.department?.name ?? machine.department_name ?? '-'}</div>
                <div style={badgeStyle} className="inline-block mt-2 px-2 py-0.5 text-xs font-semibold rounded">
                  {statusMeta.label}
                </div>
              </div>

              {/* barcode full-width + number below */}
              <div className="mt-3">
                {machine.barcode ? (
                  <>
                    <div className="w-full overflow-hidden bg-white">
                      <Suspense fallback={<div className="w-full h-20 bg-slate-100 flex items-center justify-center text-sm">Ładowanie kodu...</div>}>
                        <LazyBarcode
                          value={String(machine.barcode)}
                          displayValue={false}
                          height={48}
                          margin={0}
                          background="white"
                          lineColor="#000"
                        />
                      </Suspense>
                    </div>
                    <div className="mt-2 text-center text-xs font-mono text-slate-700">
                      {machine.barcode}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-20 bg-slate-100 rounded border flex items-center justify-center text-sm text-slate-500">
                    Brak kodu kreskowego
                  </div>
                )}
              </div>

              {/* working hours under barcode */}
              <div className="mt-3 text-sm text-slate-600">
                <div className="font-medium">Roboczogodziny</div>
                <div className="text-lg font-semibold">{machine.working_hours ?? '0'}</div>
              </div>

              {/* image (responsive) */}
              <div className="mt-4">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt={machine.name} className="w-full h-48 object-cover rounded border" />
                ) : (
                  <div className="w-full h-48 bg-slate-100 rounded border flex items-center justify-center text-sm text-slate-500">
                    Brak zdjęcia
                  </div>
                )}
              </div>

              {/* department */}
              <div className="mt-3 text-sm text-slate-600">
                <span className="font-medium">Wydział: </span>
                <span>{machine.department?.name ?? machine.department_name ?? '-'}</span>
              </div>

              {/* awarie / historia */}
              <div className="mt-2 text-sm text-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bug className="w-4 h-4 text-rose-600" />
                  <div>
                    <div className="text-xs text-slate-500">Awarie</div>
                    <div className="text-sm font-medium">{faultsCount} {faultsCount === 1 ? 'awaria' : 'awarie'}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-500">Ostatnia</div>
                  <div className="text-sm">{machine.last_fault_at ? new Date(machine.last_fault_at).toLocaleDateString() : '-'}</div>
                </div>
              </div>

              {/* details */}
              <div className="mt-3 text-sm text-slate-700 space-y-1 flex-1">
                <div><span className="font-medium">Model:</span> {machine.model ?? '-'}</div>
                <div className="flex gap-4">
                  <div><span className="font-medium">Rok:</span> {machine.year_of_production ?? '-'}</div>
                  <div><span className="font-medium">Max produkcja na godzinę:</span> {machine.max_productions_per_hour ?? '-'}</div>
                </div>
              </div>

              {/* actions: icons, intuitive*/}
              <div className="mt-4 flex items-center gap-2">
                <a href="#" title="Dodaj awarię" className="inline-flex items-center gap-2 px-2 py-1 bg-rose-50 text-rose-700 rounded">
                  <PlusCircle className="w-4 h-4" /> <span className="text-xs">Dodaj</span>
                </a>

                <a href="#" title="Awarie / Historia" className="inline-flex items-center gap-2 px-2 py-1 bg-slate-50 text-slate-700 rounded">
                  <Clock className="w-4 h-4" /> <span className="text-xs">Historia</span>
                </a>

                <div className="ml-auto flex items-center gap-2">
                  <button onClick={() => setSelected(machine)} title="Szczegóły" className="inline-flex items-center justify-center w-9 h-9 bg-slate-100 rounded">
                    <Eye className="w-4 h-4 text-slate-700" />
                  </button>
                  <a href="#" title="Edytuj" className="inline-flex items-center justify-center w-9 h-9 bg-indigo-600 rounded">
                    <Edit2 className="w-4 h-4 text-white" />
                  </a>
                  <a href="#" title="Usuń" className="inline-flex items-center justify-center w-9 h-9 bg-red-600 rounded">
                    <Trash2 className="w-4 h-4 text-white" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* pagination (if provided by backend) */}
      {links && (
        <nav className="mt-6 flex justify-center">
          <ul className="inline-flex items-center -space-x-px">
            {links.map((link, idx) => {
              const isActive = !!link.active;
              const url = link.url ?? '#';
              const label = link.label.replace(/<\/?[^>]+(>|$)/g, '');
              return (
                <li key={idx}>
                  {url === '#' ? (
                    <span className={`px-3 py-1 border ${isActive ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700'}`}>
                      {label}
                    </span>
                  ) : (
                    <a
                      href={url}
                      className={`px-3 py-1 border ${isActive ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700'}`}
                    >
                      {label}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {/* modal: details */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setSelected(null)}
        >
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 md:mx-0 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end p-3">
              <button onClick={() => setSelected(null)} title="Zamknij" className="p-2 rounded hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="md:flex md:gap-6 p-4">
              {/* image */}
              <div className="md:w-1/3 w-full mb-4 md:mb-0">
                {selected.image_path ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selected.image_path.startsWith('http') ? selected.image_path : `/storage/${selected.image_path}`} alt={selected.name} className="w-full h-64 object-cover rounded" />
                ) : (
                  <div className="w-full h-64 bg-slate-100 rounded flex items-center justify-center text-sm text-slate-500">
                    Brak zdjęcia
                  </div>
                )}
              </div>

              {/* details */}
              <div className="md:flex-1">
                <h3 className="text-xl font-semibold mb-2">{selected.name}</h3>
                <div className="text-sm text-slate-600 mb-1">{statusMap[String(selected.status ?? selected.state ?? 'unknown').toLowerCase()]?.label ?? (selected.status ?? 'Brak statusu')}</div>
                <div className="text-sm text-slate-600 mb-3">Wydział: {selected.department?.name ?? selected.department.name ?? '-'}</div>

                {/* awarie (modal) */}
                <div className="mb-3 text-sm text-slate-700 flex items-center justify-between border p-3 rounded bg-slate-50">
                  <div>
                    <div className="text-xs text-slate-500">Awarie</div>
                    <div className="text-sm font-medium">
                      {(selected.faults_count ?? selected.faults?.length ?? 0)} {( (selected.faults_count ?? selected.faults?.length ?? 0) === 1) ? 'awaria' : 'awarie'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Ostatnia</div>
                    <div className="text-sm">{selected.last_fault_at ? new Date(selected.last_fault_at).toLocaleString() : '-'}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-sm">
                  <div><span className="font-medium">Model:</span> {selected.model ?? '-'}</div>
                  <div><span className="font-medium">Numer seryjny:</span> {selected.serial_number ?? '-'}</div>
                  <div><span className="font-medium">Rok produkcji:</span> {selected.year_of_production ?? '-'}</div>
                  <div><span className="font-medium">Roboczogodziny:</span> {selected.working_hours ?? '-'}</div>
                  <div><span className="font-medium">Max / h:</span> {selected.max_productions_per_hour ?? '-'}</div>
                  <div><span className="font-medium">Wydział:</span> {selected.department?.name ?? selected.department_name ?? '-'}</div>
                </div>

                <div className="text-sm text-slate-700 mb-4">
                  <div className="font-medium mb-1">Opis</div>
                  <div>{selected.description ?? '-'}</div>
                </div>

                <div className="flex gap-2">
                  {canManage ? (
                    <>
                      <a href="#" className="px-3 py-2 bg-indigo-600 text-white rounded text-sm">Edytuj</a>
                      <a href="#" className="px-3 py-2 bg-red-600 text-white rounded text-sm">Usuń</a>
                    </>
                  ) : (
                    <span className="text-sm text-slate-500">Akcje dostępne dla administratora i moderatora</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
