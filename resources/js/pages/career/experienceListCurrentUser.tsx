import EmployeeLayout from '../employee/employee-layout';

interface PageProps extends Record<string, unknown> {
  experiences?: { data: any[]; meta?: any };
  flash?: { success?: string; error?: string };
}

export default function ExperienceListCurrentUserPage({ experiences }: { experiences?: any }) {
  return (
    <EmployeeLayout title="Moje przebiegi kariery">
      <div className="p-4">
      </div>
    </EmployeeLayout>
  );
}
