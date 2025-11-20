import React, { ReactNode } from 'react';
import ModeratorLayout from './moderator-layout';
import ModeratorTopNav from '@/components/app-topnav-moderator';
type Breadcrumb = { label: string; href?: string };




export default function ModeratorDashboard() {
  const breadcrumbs = [
        { label: 'Panel Moderatora', href: route('moderator.dashboard') },
    ];
  return (
    <ModeratorLayout breadcrumbs={breadcrumbs}>
                  <ModeratorTopNav />

     <h4>dashbard moderator</h4>
    </ModeratorLayout>
  );
}
