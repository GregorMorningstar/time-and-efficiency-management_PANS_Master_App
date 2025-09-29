import React from 'react';
import EmployeeLayout from '../employee/employee-layout';
import CareerAddForm from '@/components/card/career-add-form';

export default function AddCareerPage() {
  return (
    <EmployeeLayout title="Dodaj przebieg kariery">
      <div className="p-4">
        <CareerAddForm />
      </div>
    </EmployeeLayout>
  );
}
