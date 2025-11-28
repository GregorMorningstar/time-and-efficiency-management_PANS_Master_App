import { Head, usePage } from '@inertiajs/react';
import ModeratorDashboard from "..";
import ModeratorEmployeTopNav from "@/components/app-top-moderator-employee";
import ModeratorLayout from "../moderator-layout";
import { Car } from "lucide-react";
import CareerList from "@/components/list/career-list";

export default function ModeratorEmployeeCheckCareerPage() {
    const { props } = usePage<any>();
    const experiences = props.experiences ?? [];

    // flash messages / errors
    const flash = props.flash ?? {};
    const success = flash.success ?? null;
    const error = flash.error ?? null;
    const errors = props.errors ?? {};

    const breadcrumbs = [
        { label: 'Panel Moderatora', href: route('moderator.dashboard') },
        { label: 'Sprawdzenie Doświadczenia Pracownika', href: route('moderator.employee.check-career') },
    ];

    return (
       <>
         <Head title="Sprawdzanie świadectw pracy" />
         <ModeratorLayout breadcrumbs={breadcrumbs}>
             {/* komunikaty */}
             <div className="mb-4">
                 {success && (
                     <div className="mb-3 rounded border border-green-200 bg-green-50 px-4 py-2 text-green-800">
                         {success}
                     </div>
                 )}
                 {error && (
                     <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-red-800">
                         {error}
                     </div>
                 )}
                 {errors && Object.keys(errors).length > 0 && (
                     <div className="mb-3 rounded border border-yellow-200 bg-yellow-50 px-4 py-2 text-yellow-800">
                         <strong>Błędy:</strong>
                         <ul className="mt-1 list-disc pl-5">
                             {Object.values(errors).flat().map((err: any, idx: number) => (
                                 <li key={idx}>{err}</li>
                             ))}
                         </ul>
                     </div>
                 )}
             </div>

             <ModeratorEmployeTopNav />
             <CareerList career={experiences} />
         </ModeratorLayout>
       </>
    );
}
