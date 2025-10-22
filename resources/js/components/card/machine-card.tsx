import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faFile, faTrash, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

type Machine = {
  id: number;
  name: string;
  serial_number?: string;
  barcode?: string;
  description?: string;
  status?: string;
  image_path?: string;
};

type Props = { machine: Machine };

export default function MachineCard({ machine }: Props) {
  const page = usePage<any>();
  const user = page.props?.auth?.user ?? page.props?.user ?? null;

  const roles: string[] = (() => {
    if (!user) return [];
    if (typeof user.role === 'string') return [user.role];
    if (Array.isArray(user.roles)) return user.roles.map((r: any) => r?.name ?? r).filter(Boolean);
    return [];
  })();
  const canManage = roles.some(r => ['admin', 'moderator'].includes(r));

  const machineStatuses: { value: string; label: string; classes?: string; color?: string }[] = page.props?.machineStatuses ?? [];

  const statusMap = React.useMemo(() => {
    return machineStatuses.reduce<Record<string, typeof machineStatuses[0]>>((acc, s) => {
      if (s?.value) acc[s.value] = s;
      return acc;
    }, {});
  }, [machineStatuses]);

  const statusMeta = statusMap[machine.status ?? ''] ?? {
    value: machine.status ?? 'unknown',
    label: machine.status ?? 'Nieznany',
    classes: '',
    color: undefined,
  };

  const colorHex = React.useMemo(() => {
    const meta: any = statusMeta ?? {};
    const explicit = meta.color ?? meta.colorHex ?? meta.hex ?? null;
    if (explicit && typeof explicit === 'string') return explicit;

    const cls = meta.classes ?? '';
    if (typeof cls === 'string') {
      if (cls.includes('green')) return '#10B981';
      if (cls.includes('red')) return '#EF4444';
      if (cls.includes('blue')) return '#3B82F6';
      if (cls.includes('yellow')) return '#F59E0B';
      if (cls.includes('black')) return '#000000';
      if (cls.includes('gray') || cls.includes('slate')) return '#94A3B8';
    }
    return '#94A3B8';
  }, [statusMeta]);

  const badgeClass = typeof statusMeta.classes === 'string' ? statusMeta.classes : '';

  return (
    <div style={{ borderLeft: `4px solid ${colorHex}` }}
      className="relative flex flex-col my-6 bg-white shadow-sm border border-slate-200 rounded-lg w-96">
      <div className="relative h-56 m-2.5 overflow-hidden text-white rounded-md">
        <img
          src={machine.image_path || 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&w=800&q=80'}
          alt={machine.name}
          className="object-cover w-full h-full"
        />
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <h6 className="text-slate-800 text-xl font-semibold">
            {machine.name}
          </h6>
       
        </div>

        <p className="text-slate-600 leading-normal font-light">
          {machine.description}
        </p>
      </div>

      <div className="px-4 pb-4 pt-0 mt-2 flex items-center">
        <Link href="#" className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-white border shadow-sm hover:bg-slate-50">
          <FontAwesomeIcon icon={faFile} className='text-green-500' />
        </Link>

        {canManage && (
          <>
            <Link href="#" className="ml-4 inline-flex items-center justify-center w-10 h-10 rounded-md bg-white border shadow-sm hover:bg-slate-50">
              <FontAwesomeIcon icon={faEdit} className='text-blue-500' />
            </Link>

            <Link href="#" className="ml-4 inline-flex items-center justify-center w-10 h-10 rounded-md bg-white border shadow-sm hover:bg-slate-50">
              <FontAwesomeIcon icon={faTrash} className='text-red-500' />
            </Link>
          </>
        )}

        <Link href='#' className="ml-4 inline-flex items-center justify-center w-10 h-10 rounded-md bg-white border shadow-sm hover:bg-slate-50">
          <FontAwesomeIcon icon={faExclamationTriangle} className='text-red-500' />
        </Link>
      </div>
    </div>
  );
}
