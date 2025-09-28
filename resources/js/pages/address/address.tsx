import React from 'react';
import { Head } from '@inertiajs/react';
import EmployeeLayout from '../employee/employee-layout';

export default function AddressPage() {
  return (
    <EmployeeLayout title="Adres" breadcrumbs={[{ label: 'Adres' }]}>
      <Head title="Adres" />
      <h1 className="text-2xl font-semibold">Adres</h1>
      <p className="mt-2 text-sm text-slate-500">Tutaj w przyszłości pojawią się dane adresowe.</p>
    </EmployeeLayout>
  );
}
