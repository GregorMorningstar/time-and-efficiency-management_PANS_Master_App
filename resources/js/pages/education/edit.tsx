import React from 'react';
import EmployeeLayout from '../employee/employee-layout';
import EducationEditCard from '@/components/card/education-edit-card';
import { Head, router, useForm, usePage } from '@inertiajs/react';

export default function EditEducationPage() {
    const page = usePage<any>();
    const education = page.props.education;
    const educationLevels = page.props.educationLevels || [];



    return (
        <EmployeeLayout title="Edytuj wykształcenie">
            <EducationEditCard
                levels={educationLevels}
                initialValues={education}
                storeRoute="employee.education.update"
                storeParams={{ id: education.id }}
                methodOverride="PUT"

            />
        </EmployeeLayout>
    );
}
