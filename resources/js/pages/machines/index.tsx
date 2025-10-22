import { Head } from '@inertiajs/react';
import EmployeeLayout from '../employee/employee-layout';
import MachineCard from '@/components/card/machine-card';

type Machine = {
  id: number;
  name: string;
  serial_number?: string;
  barcode?: string;
  description?: string;
  department_id?: number;
  location_id?: number;
  status?: string;
  image_path?: string;
};

type Props = {
  machines: Machine[];
  machineStatuses: { value: string; label: string; classes?: string; color?: string }[];
};

export default function MachinesIndexPage({ machines, machineStatuses }: Props ) {
  const breadcrumbs = [
    { label: 'Panel', href: route('dashboard') },
    { label: 'Maszyny', href: route('employee.machines.index') },
  ];

  return (
    <EmployeeLayout title="Maszyny" breadcrumbs={breadcrumbs}>
      <Head title="Maszyny" />
      <div className="p-4">
               {!machines || machines.length === 0 ? (
          <div className="text-sm text-slate-600">Brak maszyn do wyświetlenia.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {machines.map((machine) => (
              <MachineCard key={machine.id} machine={machine} />
            ))}
          </div>
        )}
      </div>
    </EmployeeLayout>
  );
}
