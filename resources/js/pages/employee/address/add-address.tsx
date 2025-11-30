import { Head } from '@inertiajs/react';
import EmployeeLayout from '../employee-layout';
import EmployeeAddressAdd from '@/components/card/add-employee-adress';

export default function AddEmployeeAddress() {
    const breadcrumbs = [
    { label: 'Panel', href: route('dashboard') },
    { label: 'Adresy', href: route('employee.address.index') },
    { label: 'Dodaj', href: route('employee.address.add') },
  ];
    return (
        <>
 <EmployeeLayout title="Adresy" breadcrumbs={breadcrumbs}>
      <Head title="Adresy" />
      <EmployeeAddressAdd/>
    </EmployeeLayout>
        </>
    );
}
