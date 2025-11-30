import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import EmployeeLayout from '../employee-layout';
import EmployeeAddressAdd from '@/components/card/add-employee-adress';


export default function EmployeeAddressPage() {
  const { props } = usePage<any>();
  const addresses = props.addresses ?? null;
  const tableName = 'address_employees';

  const isAdd = addresses === null;
  const breadcrumbs = [
    { label: 'Panel', href: route('dashboard') },
    { label: 'Adresy', href: route('employee.address.index') },
    ...(isAdd ? [{ label: 'Dodaj', href: route('employee.address.add') }] : []),
  ];

  return (
    <EmployeeLayout title="Adresy" breadcrumbs={breadcrumbs}>
      <Head title="Adresy" />
      <div className="p-4">
        {addresses === null && <div>
            <EmployeeAddressAdd />
            </div>}
        {addresses !== null && addresses ? (
          <div>
            <div>2</div>
            <div className="mt-2 text-sm text-slate-600">Table: {tableName}</div>
            {/* tutaj możesz renderować listę addresses */}
          </div>
        ) : null}
      </div>
    </EmployeeLayout>
  );
}
