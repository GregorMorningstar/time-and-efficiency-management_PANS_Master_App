import ModeratorEmployeTopNav from "@/components/app-top-moderator-employee";
import ModeratorLayout from "../moderator-layout";
import EducationList from "@/components/list/education-list";
import { usePage } from "@inertiajs/react";


export default function CheckExperienceEmployeePage() {

    const { education } = usePage<any>().props;
    const breadcrumbs = [
        { label: 'Panel Moderatora', href: route('moderator.dashboard') },
        { label: 'Sprawdzenie Doświadczenia Pracownika', href: route('moderator.employee.check-education') },
    ];

    // zapewnij domyślną tablicę
    const educations = Array.isArray(education) ? education : (education?.data ?? []);

    return (
        <>
            <ModeratorLayout breadcrumbs={breadcrumbs}>
                <ModeratorEmployeTopNav />
                <EducationList education={educations} />
            </ModeratorLayout>
        </>
    );
}
