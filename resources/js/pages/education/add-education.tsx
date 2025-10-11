import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import EmployeeLayout from '../employee/employee-layout';
import EducationAddSchoolCard from '@/components/card/education-add-school-card';

type LevelOption = { value: string; label: string };

export default function AddEducationPage() {
  const page = usePage<any>();
  const educationLevels: LevelOption[] = page.props.educationLevels || [];

  const form = useForm({
    school: '',
    start_year: '',
    end_year: '',
    level: '', // tu trafi enum.value
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    form.post(route('employee.education.store'));
  }

  return (
    <EmployeeLayout title="Dodaj Przbieg wykształcenia" breadcrumbs={[{ label: 'Dodaj Wykształcenie' }]}>
      <Head title="Edukacja - dodaj nową" />
      <EducationAddSchoolCard
        levels={educationLevels ?? []} // [{ value,label }, ... z backendu}
        storeRoute="employee.education.store"
      />
      <form onSubmit={submit}>
        {/* inne pola */}
        <label>Poziom / tytuł</label>
        <select
          value={form.data.level}
          onChange={(e) => form.setData('level', e.currentTarget.value)}
          required
        >
          <option value="">— wybierz —</option>
          {educationLevels.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <button type="submit" disabled={form.processing}>Zapisz</button>
      </form>
    </EmployeeLayout>
  );
}
