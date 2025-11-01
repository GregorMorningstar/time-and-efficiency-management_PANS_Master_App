import React, { ReactNode } from 'react';
import ModeratorLayout from './moderator-layout';
import ModeratorTopNav from '@/components/app-topnav-moderator';
type Breadcrumb = { label: string; href?: string };

type DashboardProps = {
  breadcrumbs?: Breadcrumb[];
  menu?: ReactNode;
  children?: ReactNode;
};

export default function ModeratorDashboard({ breadcrumbs = [], menu, children }: DashboardProps) {

  return (
    <ModeratorLayout breadcrumbs={breadcrumbs.map(({ label, href }) => ({ label, href }))}>
                  <ModeratorTopNav />

     <h4>dashbard moderator</h4>
    </ModeratorLayout>
  );
}
