import ModeratorLayout from "../moderator-layout";
import ModeratorTopNavMachines from "@/components/app-topnav-moderator-machines";
export default function ModeratorMachinesPage() {
  const breadcrumbs = [
    { label: 'Panel', href: route('moderator.dashboard') },
    { label: 'Maszyny', href: route('moderator.machines.dashboard') },
  ];

  return (
  <>
  <ModeratorLayout breadcrumbs={breadcrumbs}>
    <ModeratorTopNavMachines />
    <h4>Maszyny - strona moderatora (w budowie)</h4>
  </ModeratorLayout>

  </>
  );
}
