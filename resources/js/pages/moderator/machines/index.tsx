import ModeratorLayout from "../moderator-layout";
import ModeratorTopNavMachines from "@/components/app-topnav-moderator-machines";
import ListMachines from "@/components/card/machines-list";
type Props = {
  machines?: any[];
};

export default function ModeratorMachinesPage({ machines }: Props) {
  const breadcrumbs = [
    { label: 'Panel Moderatora', href: route('moderator.dashboard') },
    { label: 'Maszyny', href: route('moderator.machines.dashboard') },
  ];

  const hasMachines = Array.isArray(machines) && machines.length > 0;

  return (
  <>
  <ModeratorLayout breadcrumbs={breadcrumbs}>
    <ModeratorTopNavMachines />

        {hasMachines ? (
          <ListMachines machines={machines} />
        ) : (
          <div className="p-6 bg-white rounded shadow">
            <h4 className="text-lg font-medium mb-2">Brak maszyn</h4>
            <p className="mb-4">Nie dodano jeszcze żadnych maszyn.</p>
            <a href={route('moderator.machines.add')} className="inline-block px-4 py-2 bg-indigo-600 text-white rounded">
              Dodaj maszynę
            </a>
          </div>
        )}
  </ModeratorLayout>

  </>
  );
}
