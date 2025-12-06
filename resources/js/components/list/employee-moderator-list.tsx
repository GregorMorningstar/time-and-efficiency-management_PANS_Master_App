import React from 'react';
import { router } from '@inertiajs/react';
import Barcode from 'react-barcode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faCalendarDays } from '@fortawesome/free-solid-svg-icons';

type EmployeeItem = {
    id: number;
    name: string;
    barcode?: string | null;
    experience_months?: number | null;
    education_levels?: number | null;
    leave_balance?: number | null;
    leave_used?: number | null;
    annual_leave_entitlement?: number | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export default function EmployeeModeratorList({
    employees,
}: {
    employees: {
        data: EmployeeItem[];
        links?: PaginationLink[];
        meta?: { from?: number; to?: number; total?: number; current_page?: number; last_page?: number };
    };
}) {
    const mapEducationLabel = (years: number | undefined | null) => {
        const v = years ?? 0;
        if (v >= 8) return 'Doktorat';
        if (v >= 5) return 'Magister';
        if (v >= 4) return 'Średnie / Technikum';
        if (v >= 3) return 'Studia zawodowe / Zawodowe';
        if (v > 0) return 'Podstawowe';
        return '—';
    };

    const handlePaginate = (url: string | null) => {
        if (!url) return;
        router.visit(url, { preserveState: true, preserveScroll: true });
    };

    // NEW: show employee details (moderator)
    const handleShow = (id: number) => {
        const url = (typeof route === 'function') ? route('moderator.employee.show', id) : `/moderator/employee/${id}`;
        router.visit(url);
    };

    // NEW: open employee leaves page/details
    const handleLeaves = (id: number) => {
        // pełna ścieżka z prefiksem /moderator
        router.get(`/moderator/urlaub/check-limit/${id}`);
    };

    return (
        <div className="p-4">
            <h2 className="text-lg font-medium mb-3">Lista pracowników</h2>

            <div className="overflow-x-auto bg-white rounded border">
                <table className="min-w-full divide-y">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium">#</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Nazwa</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Kod kreskowy</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Poziom edukacji</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Miesiące doświadczenia</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Saldo urlopu</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Zużyte dni</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Roczny urlop</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Akcje</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y">
                        {employees?.data?.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50">
                                <td className="px-4 py-2 text-sm">{u.id}</td>
                                <td className="px-4 py-2 text-sm">{u.name}</td>
                                <td className="px-4 py-2 text-sm">
                                    {u.barcode ? (
                                        <div className="flex flex-col items-start gap-1">
                                            <Barcode
                                                value={u.barcode}
                                                format="CODE128"
                                                width={1}
                                                height={30}
                                                displayValue={false}
                                            />
                                            <div className="text-xs text-slate-600 select-all">{u.barcode}</div>
                                        </div>
                                    ) : (
                                        '—'
                                    )}
                                </td>
                                <td className="px-4 py-2 text-sm">{mapEducationLabel(u.education_levels)}</td>
                                <td className="px-4 py-2 text-sm">{u.experience_months ?? 0}</td>
                                <td className="px-4 py-2 text-sm">{u.annual_leave_entitlement ?? 0}</td>
                                <td className="px-4 py-2 text-sm">{u.leave_used ?? 0}</td>
                                <td className="px-4 py-2 text-sm">obliczanie roczengo urlopu</td>
                                <td className="px-4 py-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleShow(u.id)}
                                            className="p-2 text-sm rounded border bg-white hover:bg-slate-100"
                                            title="Szczegóły pracownika"
                                            aria-label="Szczegóły"
                                        >
                                            <FontAwesomeIcon icon={faEye} className="w-4 h-4 text-slate-700" />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleLeaves(u.id)}
                                            className="p-2 text-sm rounded border bg-white hover:bg-slate-100"
                                            title="Szczegóły urlopów"
                                            aria-label="Urlopy"
                                        >
                                            <FontAwesomeIcon icon={faCalendarDays} className="w-4 h-4 text-slate-700" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {employees?.meta && (
                <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-slate-600">
                        {employees.meta.from && employees.meta.to && employees.meta.total
                            ? `Wyświetlane: ${employees.meta.from}–${employees.meta.to} z ${employees.meta.total}`
                            : `Strona ${employees.meta.current_page ?? 1} z ${employees.meta.last_page ?? 1}`}
                    </div>

                    {employees.links && employees.links.length > 0 && (
                        <nav className="flex flex-wrap items-center gap-2">
                            {employees.links.map((link, idx) => {
                                const label = String(link.label)
                                    .replace(/&laquo;/g, '«')
                                    .replace(/&raquo;/g, '»')
                                    .replace(/&hellip;/g, '…');
                                const isDisabled = !link.url;
                                return (
                                    <button
                                        key={`${label}-${idx}`}
                                        type="button"
                                        onClick={() => handlePaginate(link.url)}
                                        disabled={isDisabled || link.active}
                                        className={`px-3 py-1 text-sm rounded border transition ${
                                            link.active
                                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                                        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span dangerouslySetInnerHTML={{ __html: label }} />
                                    </button>
                                );
                            })}
                        </nav>
                    )}
                </div>
            )}
        </div>
    );
}
