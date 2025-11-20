import ModeratorEmployeTopNav from "@/components/app-top-moderator-employee";
import ModeratorLayout from "../moderator-layout";
const breadcrumbs = [
    { label: 'Panel Moderatora', href: route('moderator.dashboard') },
    { label: 'Pracownicy', href: route('moderator.employee.index') },
];

export default  function ModeratorEmployeeIndexPage() {
    return (
        <>
  <ModeratorLayout breadcrumbs={breadcrumbs}>
    <ModeratorEmployeTopNav />
  <div>
            <h1>Employee Index Page</h1>
        </div>
</ModeratorLayout>
        </>

    );
}
