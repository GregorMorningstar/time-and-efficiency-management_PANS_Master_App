import React from 'react';
import { Head } from '@inertiajs/react';
import EmployeeLayout from './employee-layout';

export default function CareerPage() {
  return (
    <EmployeeLayout title="Kariera" breadcrumbs={[{ label: 'Kariera' }]}> 
      <Head title="Kariera" />
      <h1 className="text-2xl font-semibold">Kariera</h1>
      <p className="mt-2 text-sm text-slate-500">Tutaj w przyszłości pojawi się przebieg kariery.</p>
    </EmployeeLayout>
  );
}
