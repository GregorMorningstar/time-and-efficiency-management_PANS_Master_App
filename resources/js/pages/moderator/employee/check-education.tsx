import ModeratorEmployeTopNav from "@/components/app-top-moderator-employee";
import ModeratorLayout from "../moderator-layout";
import EducationList from "@/components/list/education-list";
import { usePage } from "@inertiajs/react";


export default function CheckExperienceEmployeePage() {
    const { props } = usePage<any>();
    // Laravel paginator zwraca płaską strukturę
    const educationData = props.education ?? { data: [], links: [] };
    const educations = educationData.data ?? [];
    const pagination = {
        meta: {
            current_page: educationData.current_page,
            last_page: educationData.last_page,
            per_page: educationData.per_page,
            total: educationData.total,
            from: educationData.from,
            to: educationData.to,
        },
        links: educationData.links ?? []
    };

    const breadcrumbs = [
        { label: 'Panel Moderatora', href: route('moderator.dashboard') },
        { label: 'Sprawdzenie Edukacji Pracownika', href: route('moderator.employee.check-education') },
    ];

    return (
        <>
            <ModeratorLayout breadcrumbs={breadcrumbs}>
                <ModeratorEmployeTopNav />
                <EducationList education={educations} pagination={pagination} />
            </ModeratorLayout>
        </>
    );
}
