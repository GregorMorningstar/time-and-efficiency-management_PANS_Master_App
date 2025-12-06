import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import ModeratorEmployeTopNav from "@/components/app-top-moderator-employee";
import ModeratorLayout from "../moderator-layout";
import EmployeeModeratorList from "@/components/list/employee-moderator-list";

const breadcrumbs = [
    { label: 'Panel Moderatora', href: route('moderator.dashboard') },
    { label: 'Pracownicy', href: route('moderator.employee.index') },
];

export default function ModeratorEmployeeIndexPage() {
    // pobierz props od Inertia
    // @ts-ignore
    const { employees } = usePage().props as { employees: any };

    return (
        <>
            <Head title="Pracownicy - Panel Moderatora" />
            <ModeratorLayout breadcrumbs={breadcrumbs}>
                <ModeratorEmployeTopNav />
                <EmployeeModeratorList employees={employees} />
            </ModeratorLayout>
        </>
    );
}
