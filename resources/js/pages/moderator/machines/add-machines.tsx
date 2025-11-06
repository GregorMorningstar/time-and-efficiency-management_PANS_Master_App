import AddMachineCard from '@/components/card/add-machine-card';
import ModeratorLayout from "../moderator-layout";
import ModeratorTopNavMachines from '@/components/app-topnav-moderator-machines';

type Breadcrumb = { label: string; href?: string };

export default function AddMachinesPage() {
  const breadcrumbs: Breadcrumb[] = [
    { label: 'Panel Moderatora', href: '/moderator' },
    { label: 'Maszyny', href: '/moderator/maszyny' },
    { label: 'Dodaj maszynę' },
  ];

  return (
    <ModeratorLayout breadcrumbs={breadcrumbs}>
      <ModeratorTopNavMachines />
      <AddMachineCard />
    </ModeratorLayout>
  );
}
