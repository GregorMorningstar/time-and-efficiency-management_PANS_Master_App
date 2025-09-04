import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import route from 'ziggy-js'; // dodano import
import { useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    
];

export default function Dashboard() {
    const { auth } = (usePage().props as unknown) as { auth: { user: { role: string } } };

    useEffect(() => {
        if (auth?.user?.role === 'admin') {
            router.visit('admin/dashboard'); 
        } else if (auth?.user?.role === 'moderator') {
            router.visit('moderator/dashboard');
        } else if (auth?.user?.role === 'employee') {
            router.visit('employee/dashboard');
        }
    }, [auth?.user?.role]);

    return null;
}