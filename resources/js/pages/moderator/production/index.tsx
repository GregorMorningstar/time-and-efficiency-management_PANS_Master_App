import ModeratorLayout from "../moderator-layout";


export default function ModeratorMachinesPage() {
  const breadcrumbs = [
    { label: 'Panel', href: route('moderator.dashboard') },
    { label: 'Produkcja', href: route('moderator.production.dashboard') },
  ];

   return (
    <>
      <ModeratorLayout breadcrumbs={breadcrumbs}>
        <h4>Produkcja - strona moderatora (w budowie)</h4>
      </ModeratorLayout>
    </>
  );
}


