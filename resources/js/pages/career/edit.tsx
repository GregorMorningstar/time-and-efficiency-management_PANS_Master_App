import  React, { useEffect, useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import EmployeeLayout from '../employee/employee-layout';
import { Alert } from '@/components/ui/alert';
import EditCareerForm from '@/components/card/edit-career-form';

interface PageProps extends Record<string, unknown> {
    experience?: any;
    flash?: { success?: string; error?: string };
}

type CareerItem = {
    id: number;
    position: string;
    company: string;
    company_name: string;
    start_date: string;
    end_date?: string | null;
    is_current: boolean;
    description?: string | null;
    barcode?: string | null;
};






export  default function CareerEditPage() {
    const { experience, flash } = usePage<PageProps>().props;

    const [successMsg, setSuccessMsg] = useState(flash?.success);

    useEffect(() => {
        if (flash?.success) {
            setSuccessMsg(flash.success);
            const timer = setTimeout(() => setSuccessMsg(undefined), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash?.success]);

    return (
                 <EmployeeLayout title="Edytuj przebieg kariery">
              <div className="p-4">
                                                             <EditCareerForm experience={experience} />
              </div>
            </EmployeeLayout>
    );
}
