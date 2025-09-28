import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import EmployeeLayout from '../employee/employee-layout';
import EducationAddSchoolCard from '@/components/card/education-add-school-card';

interface LevelOption { value: string; label: string }
interface PageProps { educationDegrees?: LevelOption[]; [key: string]: any }

export default function AddEducationPage() {
  const { educationDegrees } = usePage<PageProps>().props;
  return (
    <EmployeeLayout title="Dodaj Przbieg wykształcenia" breadcrumbs={[{ label: 'Dodaj Wykształcenie' }]}>
      <Head title="Edukacja - dodaj nową" />
      <EducationAddSchoolCard
        levels={educationDegrees ?? []} // [{ value,label }, ... z backendu}
        storeRoute="employee.education.store"
      />



    </EmployeeLayout>
  );
}
