import React, { useState, useRef } from "react";
import { router } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faEye } from "@fortawesome/free-solid-svg-icons";
import Barcode from "react-barcode";

interface Career {
    id: number;
    user_id?: number;
    user?: { id: number; name?: string; email?: string | null; barcode?: string | null } | null;
    company_name?: string;
    position?: string;
    responsibilities?: string | null;
    barcode?: string | null; // record barcode
    street?: string | null;
    zip_code?: string | null;
    city?: string | null;
    nip?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    is_current?: number | boolean;
    verified?: number | boolean;
    work_certificate_scan_path?: string | null;
    created_at?: string;
    updated_at?: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}
interface PaginationMeta {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
    from?: number;
    to?: number;
}
interface PaginationData {
    links: PaginationLink[];
    meta?: PaginationMeta;
}

export default function CareerList({
    career,
    confirmConfig = {},
    pagination,
}: {
    career: Career[];
    confirmConfig?: { rejectMessage?: string };
    pagination?: PaginationData;
}) {
    // pokaż rekordy przekazane z serwera (bez dodatkowego filtrowania)
    const visibleCareer = career ?? [];
    if (visibleCareer.length === 0) {
        return <p className="p-4 text-sm text-slate-600">Brak świadectw pracy do wyświetlenia.</p>;
    }

    const [loadingIds, setLoadingIds] = useState<Record<number, boolean>>({});
    const [selected, setSelected] = useState<Career | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // notification state
    const [notification, setNotification] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' }>({ visible: false, message: '', type: 'info' });
    const notifTimer = useRef<number | null>(null);

    const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info', timeout = 5000) => {
        if (notifTimer.current) {
            clearTimeout(notifTimer.current);
            notifTimer.current = null;
        }
        setNotification({ visible: true, message, type });
        notifTimer.current = window.setTimeout(() => {
            setNotification(prev => ({ ...prev, visible: false }));
            notifTimer.current = null;
        }, timeout);
    };

    const hideNotification = () => {
        if (notifTimer.current) {
            clearTimeout(notifTimer.current);
            notifTimer.current = null;
        }
        setNotification(prev => ({ ...prev, visible: false }));
    };

    const openModalWith = (item: Career) => {
        setSelected(item);
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setSelected(null);
    };

    const safeRoute = (name: string, id?: number, fallback?: string) => {
        try {
            // @ts-ignore
            if (typeof route === 'function' && window?.Ziggy?.namedRoutes?.[name]) {
                return id !== undefined ? route(name, id) : route(name);
            }
        } catch (err) {
            // ignore
        }
        return fallback ?? (id !== undefined ? `/${name.replace(/\./g, '/')}/${id}` : `/${name.replace(/\./g, '/')}`);
    };

    const handleDetails = (id: number) => {
        const item = visibleCareer.find(x => x.id === id) ?? null;
        if (item) {
            openModalWith(item);
        } else {
            router.visit(safeRoute('moderator.employee.check-career', id, `/employee/check-career/${id}`));
        }
    };

    const handleVerify = (id: number) => {
        if (loadingIds[id]) return;
        setLoadingIds(prev => ({ ...prev, [id]: true }));

        const verifyRoute = safeRoute('moderator.experience.verify', id, `/moderator/experience/${id}/verify`);

        router.post(verifyRoute, {}, {
            preserveScroll: true,
            onSuccess: () => showNotification('Świadectwo pracy potwierdzone.', 'success'),
            onError: () => showNotification('Błąd podczas potwierdzania.', 'error'),
            onFinish: () => setLoadingIds(prev => ({ ...prev, [id]: false })),
        });
    };

    const defaultRejectMessage = confirmConfig.rejectMessage ?? 'Czy na pewno chcesz odrzucić ten wpis?';

    const handleReject = (id: number) => {
        if (loadingIds[id]) return;
        const confirmed = window.confirm(defaultRejectMessage);
        if (!confirmed) return;

        setLoadingIds(prev => ({ ...prev, [id]: true }));

        const rejectRoute = safeRoute('moderator.experience.reject', id, `/moderator/experience/${id}/reject`);

        router.post(rejectRoute, {}, {
            preserveScroll: true,
            onSuccess: () => showNotification('Wpis został odrzucony.', 'success'),
            onError: () => showNotification('Błąd podczas odrzucania.', 'error'),
            onFinish: () => setLoadingIds(prev => ({ ...prev, [id]: false })),
        });
    };

    const placeholderImg = '/images/work-certificate-placeholder.png';

    const getImageUrl = (path?: string | null) => {
        if (!path) return placeholderImg;
        // jeżeli ścieżka zaczyna się od http/https ani /, dodaj /storage/ (dostosuj jeśli potrzebne)
        if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) return path;
        if (path.startsWith('image/')) return `/${path}`;
        return `/storage/${path}`;
    };

    const handlePaginate = (url: string | null) => {
        if (!url) return;
        // Inertia pełny URL z backendu => używamy router.visit
        router.visit(url, { preserveState: true, preserveScroll: true });
    };

    const handleDelete = (id: number) => {
        if (loadingIds[id]) return;
        const confirmed = window.confirm('Czy na pewno usunąć to doświadczenie zawodowe?');
        if (!confirmed) return;

        setLoadingIds(prev => ({ ...prev, [id]: true }));

        const deleteRoute = safeRoute('moderator.experience.delete', id, `/moderator/experience/${id}`);

        router.delete(deleteRoute, {
            preserveScroll: true,
            onSuccess: () => {
                showNotification('Doświadczenie usunięte.', 'success');
            },
            onError: () => {
                showNotification('Błąd podczas usuwania.', 'error');
            },
            onFinish: () => setLoadingIds(prev => ({ ...prev, [id]: false })),
        });
    };

    return (
        <div className="p-4">
            {/* Notification */}
            {notification.visible && (
                <div className="fixed top-4 right-4 z-50">
                    <div className={`flex items-center gap-3 px-4 py-2 border rounded shadow transition-opacity ${notification.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : notification.type === 'error' ? 'bg-red-50 border-red-300 text-red-800' : 'bg-sky-50 border-sky-300 text-sky-800'}`}>
                        <div className="text-sm">{notification.message}</div>
                        <button onClick={hideNotification} className="ml-2 text-sm font-medium px-2 py-1 rounded hover:bg-black/5">×</button>
                    </div>
                </div>
            )}

            <h2 className="text-lg font-medium mb-3">Lista świadectw pracy</h2>

            <div className="overflow-x-auto bg-white rounded border">
                <table className="min-w-full divide-y">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium">ID</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Użytkownik</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Kod użytkownika</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Firma</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Pozycja</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Start</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Koniec</th>

                            <th className="px-4 py-2 text-left text-sm font-medium">Akcje</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {visibleCareer.map((c) => {
                            const isLoading = Boolean(loadingIds[c.id]);
                            const isCurrent = Boolean(Number(c.is_current || 0));
                            const verified = Boolean(Number(c.verified || 0));

                            return (
                                <tr key={c.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-2 text-sm">{c.id}</td>
                                    <td className="px-4 py-2 text-sm">{c.user?.name ?? `User #${c.user_id ?? '—'}`}</td>
                                    <td className="px-4 py-2 text-sm">
                                        {(() => {
                                            const bc = String(c.user?.barcode ?? c.barcode ?? '').trim();
                                            if (!bc) return '—';
                                            return (
                                                <div className="flex flex-col items-start gap-1">
                                                    <div className="overflow-hidden">
                                                        <Barcode value={bc} format="CODE128" width={1} height={28} displayValue={false} />
                                                    </div>
                                                    <div className="text-xs text-slate-600 select-all">{bc}</div>
                                                </div>
                                            );
                                        })()}
                                    </td>
                                    <td className="px-4 py-2 text-sm">{c.company_name ?? "—"}</td>
                                    <td className="px-4 py-2 text-sm">{c.position ?? "—"}</td>
                                    <td className="px-4 py-2 text-sm">{c.start_date ? new Date(c.start_date).toLocaleDateString() : "—"}</td>
                                    <td className="px-4 py-2 text-sm">{c.end_date ? new Date(c.end_date).toLocaleDateString() : "—"}</td>

                                    <td className="px-4 py-2 text-sm">
                                        {!verified && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => handleVerify(c.id)}
                                                    className="text-emerald-600 hover:text-emerald-800 mr-2"
                                                    disabled={isLoading}
                                                >
                                                    <FontAwesomeIcon icon={faCheck} className="w-5 h-5" />
                                                </button>

                                               
                                            </>
                                        )}

                                        <button
                                            title="Szczegóły"
                                            aria-label="Szczegóły"
                                            className="text-slate-600 hover:text-slate-800 cursor-pointer"
                                            onClick={() => handleDetails(c.id)}
                                            disabled={isLoading}
                                        >
                                            <FontAwesomeIcon icon={faEye} className="w-5 h-5" />
                                        </button>

                                        <button
                                            title="Usuń"
                                            aria-label="Usuń"
                                            className="ml-2 text-red-600 hover:text-red-800"
                                            onClick={() => handleDelete(c.id)}
                                            disabled={isLoading}
                                        >
                                            <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* pagination info */}
            {pagination?.meta && (
                <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-slate-600">
                        {pagination.meta.from && pagination.meta.to && pagination.meta.total
                            ? `Wyświetlane: ${pagination.meta.from}–${pagination.meta.to} z ${pagination.meta.total}`
                            : `Strona ${pagination.meta.current_page ?? 1} z ${pagination.meta.last_page ?? 1}`}
                    </div>

                    {pagination.links && pagination.links.length > 0 && (
                        <nav className="flex flex-wrap items-center gap-2">
                            {pagination.links.map((link, idx) => {
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

            {/* Modal */}
            {isModalOpen && selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50" onClick={closeModal} />

                    <div className="relative z-60 max-w-4xl w-full mx-4">
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2 border-b">
                                <h3 className="text-lg font-medium">Szczegóły świadectwa pracy</h3>
                                <div className="flex items-center gap-2">
                                    {selected && !Boolean(Number(selected.verified || 0)) ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (!selected) return;
                                                const confirmed = window.confirm('Potwierdzić świadectwo pracy?');
                                                if (!confirmed) return;
                                                handleVerify(selected.id);
                                                closeModal();
                                            }}
                                            disabled={Boolean(selected && loadingIds[selected.id])}
                                            className="inline-flex items-center rounded-md bg-emerald-600 text-white px-3 py-1 text-sm hover:bg-emerald-700 disabled:opacity-60"
                                        >
                                            Potwierdź
                                        </button>
                                    ) : (
                                        <span className="inline-flex items-center rounded-md bg-emerald-50 text-emerald-700 px-3 py-1 text-sm">Zweryfikowane</span>
                                    )}

                                    <button onClick={closeModal} className="text-slate-600 hover:text-slate-800 px-2">Zamknij</button>
                                </div>
                            </div>

                            <div className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="col-span-1 flex items-start justify-center">
                                        <a
                                            href={getImageUrl(selected.work_certificate_scan_path)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="block"
                                            title="Otwórz skan w nowej karcie"
                                        >
                                            <img
                                                src={getImageUrl(selected.work_certificate_scan_path)}
                                                alt="Świadectwo pracy"
                                                className="w-full max-w-[420px] max-h-[70vh] object-contain rounded shadow-lg border bg-white transition-transform duration-200 hover:scale-105"
                                            />
                                        </a>
                                    </div>

                                    <div className="col-span-1 md:col-span-2">
                                        <div className="space-y-2 text-sm">
                                            <div><strong>Użytkownik:</strong> {selected.user?.name ?? `#${selected.user_id}`}</div>
                                            <div><strong>Kod użytkownika:</strong> <Barcode value={selected.user?.barcode ?? selected.barcode ?? '—'} /></div>
                                            <div><strong>Firma:</strong> {selected.company_name ?? '—'}</div>
                                            <div><strong>Stanowisko:</strong> {selected.position ?? '—'}</div>
                                            <div><strong>Zakres obowiązków:</strong> {selected.responsibilities ?? '—'}</div>
                                            <div><strong>Adres:</strong> {selected.street ?? '—'}, {selected.zip_code ?? '—'} {selected.city ?? ''}</div>
                                            <div><strong>NIP:</strong> {selected.nip ?? '—'}</div>
                                            <div><strong>Start:</strong> {selected.start_date ? new Date(selected.start_date).toLocaleDateString() : '—'}</div>
                                            <div><strong>Koniec:</strong> {selected.end_date ? new Date(selected.end_date).toLocaleDateString() : '—'}</div>
                                             </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
