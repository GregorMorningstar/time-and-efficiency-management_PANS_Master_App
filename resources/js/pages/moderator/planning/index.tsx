import ModeratorLayout from "../moderator-layout";

export default function ModeratorPlanningPage() {
  const breadcrumbs = [
    { label: 'Panel', href: route('moderator.dashboard') },
    { label: 'Planowanie', href: route('moderator.planning.dashboard') },
  ];

  return (
  <>
  <ModeratorLayout breadcrumbs={breadcrumbs}>
    <h4>planowanie - strona moderatora (w budowie)</h4>
  </ModeratorLayout>

  </>
  );
}
