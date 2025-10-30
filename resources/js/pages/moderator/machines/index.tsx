import ModeratorLayout from "../moderator-layout";

export default function ModeratorMachinesPage() {
  const breadcrumbs = [
    { label: 'Panel', href: route('moderator.dashboard') },
    { label: 'Maszyny', href: route('moderator.machines.dashboard') },
  ];

  return (
  <>
  <ModeratorLayout breadcrumbs={breadcrumbs}>
    <h4>Maszyny - strona moderatora (w budowie)</h4>
  </ModeratorLayout>

  </>
  );
}
