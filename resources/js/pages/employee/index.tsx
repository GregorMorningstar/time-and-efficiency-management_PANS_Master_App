import React, { ReactNode } from 'react';
import EmployeeLayout from './employee-layout';

type Breadcrumb = { label: string; href?: string };

interface EmployeeDashboardProps {
  breadcrumbs?: Breadcrumb[];
}

export default function EmployeeDashboard({ breadcrumbs = [] }: EmployeeDashboardProps) {
  return (
    <EmployeeLayout
      title="Panel Pracownika"
      breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, ...breadcrumbs]}
    >
      <div className="space-y-4">
        <p className="text-gray-600">
          Witaj w panelu pracownika. Wybierz opcję z menu lub przejdź do czatu.
        </p>
        {/* Tu dodaj widżety / statystyki */}
      </div>
    </EmployeeLayout>
  );
}