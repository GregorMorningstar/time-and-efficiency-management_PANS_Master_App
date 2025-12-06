import React, { useState, useRef } from "react";
import { router } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faEye } from "@fortawesome/free-solid-svg-icons";
import EducationCard from '@/components/card/education-card';
import Barcode from 'react-barcode';

interface Education {
    id: number;
    user?: { id: number; name?: string; email?: string; barcode?: string } | null;
    school?: string;
    start_year?: string | number | null;
    end_year?: string | number | null;
    level?: string | null;
    diploma_path?: string | null;
    verified?: boolean | null;
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

export default function EducationList({
    education,
    confirmConfig = {},
    pagination,
}: {
    education: Education[];
    confirmConfig?: { rejectMessage?: string };
    pagination?: PaginationData;
}) {
    if (!education || education.length === 0) {
        return <p className="p-4 text-sm text-slate-600">Brak rekordów do wyświetlenia.</p>;
    }

    const mapLevelToPolish = (level?: string | null) => {
        if (!level) return "—";
        return ({
            'primary': 'Szkoła podstawowa',
            'gymnasium': 'Gimnazjum',
            'secondary': 'Szkoła średnia / Liceum',
            'vocational': 'Szkoła branżowa / Zawodowa',
            'technical': 'Technikum',
            'associate': 'Studia zawodowe (licencjat/inż.)',
            'bachelor': 'Studia licencjackie/inżynierskie',
            'master': 'Studia magisterskie',
            'phd': 'Doktorat',
            'postdoc': 'Po doktoracie',
        } as Record<string,string>)[level] ?? level;
    };

    const [loadingIds, setLoadingIds] = useState<Record<number, boolean>>({});
    const [selectedEducation, setSelectedEducation] = useState<Education | null>(null);
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

    const openModalWith = (edu: Education) => {
        setSelectedEducation(edu);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedEducation(null);
    };

    const handleDetails = (id: number) => {
        const edu = education.find(x => x.id === id) ?? null;
        if (edu) {
            openModalWith(edu);
        } else {
             router.visit((typeof route === 'function') ? route('moderator.employee.check-experience', id) : `/employee/check-experience/${id}`);
        }
    };

    const handleVerify = (id: number) => {
        if (loadingIds[id]) return;
        setLoadingIds(prev => ({ ...prev, [id]: true }));

        const verifyRoute = (typeof route === 'function')
            ? route('moderator.education.verify', id)
            : `/moderator/education/${id}/verify`;

        router.post(verifyRoute, {}, {
            preserveScroll: true,
            onSuccess: () => showNotification('Szkoła została potwierdzona.', 'success'),
            onError: () => showNotification('Wystąpił błąd podczas potwierdzania.', 'error'),
            onFinish: () => setLoadingIds(prev => ({ ...prev, [id]: false })),
        });
    };

    const defaultRejectMessage = confirmConfig.rejectMessage ?? 'Czy na pewno chcesz odrzucić ten wpis?';

    const handleReject = (id: number) => {
        if (loadingIds[id]) return;
        const confirmed = window.confirm(defaultRejectMessage);
        if (!confirmed) return;

        setLoadingIds(prev => ({ ...prev, [id]: true }));

        const rejectRoute = (typeof route === 'function')
            ? route('moderator.education.reject', id)
            : `/moderator/education/${id}/reject`;

        router.post(rejectRoute, {}, {
            preserveScroll: true,
            onSuccess: () => showNotification('Wpis został odrzucony.', 'success'),
            onError: () => showNotification('Wystąpił błąd podczas odrzucania.', 'error'),
            onFinish: () => setLoadingIds(prev => ({ ...prev, [id]: false })),
        });
    };

    const handleVerifyModal = (id: number) => {
        if (loadingIds[id]) return;
        const confirmed = window.confirm('Potwierdzić szkołę?');
        if (!confirmed) return;

        setLoadingIds(prev => ({ ...prev, [id]: true }));

        const verifyRoute = (typeof route === 'function')
            ? route('moderator.education.verify', id)
            : `/moderator/education/${id}/verify`;

        router.post(verifyRoute, {}, {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
                showNotification('Szkoła została potwierdzona.', 'success');
                router.reload();
            },
            onError: () => showNotification('Wystąpił błąd podczas potwierdzania.', 'error'),
            onFinish: () => setLoadingIds(prev => ({ ...prev, [id]: false })),
        });
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

    const placeholderImg = '/images/diploma-placeholder.png';

    const handlePaginate = (url: string | null) => {
        if (!url) return;
        router.visit(url, { preserveState: true, preserveScroll: true });
    };

    const handleDelete = (id: number) => {
        if (loadingIds[id]) return;
        const confirmed = window.confirm('Czy na pewno usunąć ten wpis edukacji?');
        if (!confirmed) return;

        setLoadingIds(prev => ({ ...prev, [id]: true }));

        const deleteRoute = (typeof route === 'function')
            ? route('moderator.education.delete', id)
            : `/moderator/education/${id}`;

        router.delete(deleteRoute, {
            preserveScroll: true,
            onSuccess: () => {
                showNotification('Edukacja usunięta.', 'success');
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

            <h2 className="text-lg font-medium mb-3">Lista doświadczeń</h2>

            <div className="overflow-x-auto bg-white rounded border">
                <table className="min-w-full divide-y">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium">ID</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Kod Kreskowy</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Użytkownik</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Szkoła / Instytucja</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Poziom</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Rok rozpoczęcia</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Rok zakończenia</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Zweryfikowane</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Akcje</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {education.map((e) => {
                            const isLoading = Boolean(loadingIds[e.id]);

                            return (
                                <tr key={e.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-2 text-sm">{e.id}</td>
                                    <td className="px-4 py-2 text-sm">
                                        {(() => {
                                            const bc = String(e.user?.barcode ?? '').trim();
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
                                    <td className="px-4 py-2 text-sm">{e.user?.name ?? "—"}</td>
                                    <td className="px-4 py-2 text-sm">{e.school ?? "—"}</td>
                                    <td className="px-4 py-2 text-sm">{mapLevelToPolish(e.level)}</td>
                                    <td className="px-4 py-2 text-sm">{e.start_year ?? "—"}</td>
                                    <td className="px-4 py-2 text-sm">{e.end_year ?? "—"}</td>
                                    <td className="px-4 py-2 text-sm">{e.verified ? "Tak" : "Nie"}</td>
                                    <td className="px-4 py-2 text-sm">
                                        <button
                                            type="button"
                                            onClick={() => handleVerify(e.id)}
                                            className="text-emerald-600 hover:text-emerald-800 mr-2"
                                            disabled={isLoading}
                                        >
                                            <FontAwesomeIcon icon={faCheck} className="w-5 h-5" />
                                        </button>

                                    

                                        <button
                                            title="Szczegóły"
                                            aria-label="Szczegóły"
                                            className="text-slate-600 hover:text-slate-800 cursor-pointer"
                                            onClick={() => handleDetails(e.id)}
                                            disabled={isLoading}
                                        >
                                            <FontAwesomeIcon icon={faEye} className="w-5 h-5" />
                                        </button>

                                        <button
                                            title="Usuń"
                                            aria-label="Usuń"
                                            className="ml-2 text-red-600 hover:text-red-800"
                                            onClick={() => handleDelete(e.id)}
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

            {/* Pagination controls */}
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

            {/* Modal - prosty overlay */}
            {isModalOpen && selectedEducation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50" onClick={closeModal} />

                    <div className="relative z-60 max-w-5xl w-full mx-4">
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2 border-b">
                                <h3 className="text-lg font-medium">Szczegóły szkoły</h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => selectedEducation && handleVerifyModal(selectedEducation.id)}
                                        disabled={Boolean(selectedEducation && loadingIds[selectedEducation.id])}
                                        className="inline-flex items-center rounded-md bg-emerald-600 text-white px-3 py-1 text-sm hover:bg-emerald-700 disabled:opacity-60"
                                    >
                                        Potwierdź szkołę
                                    </button>
                                    <button
                                        onClick={closeModal}
                                        className="text-slate-600 hover:text-slate-800 px-2"
                                    >
                                        Zamknij
                                    </button>
                                </div>
                            </div>

                            <div className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Duży podgląd dyplomu */}
                                    <div className="col-span-1 flex items-start justify-center">
                                        <a
                                            href={selectedEducation.diploma_path ?? placeholderImg}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="block"
                                            title="Otwórz pełny obraz w nowej karcie"
                                        >
                                            <img
                                                src={selectedEducation.diploma_path ?? placeholderImg}
                                                alt="Dyplom"
                                                className="w-full max-w-[420px] max-h-[70vh] object-contain rounded shadow-lg border bg-white transition-transform duration-200 hover:scale-105"
                                            />
                                        </a>
                                    </div>

                                    {/* Karta szczegółów */}
                                    <div className="col-span-1 md:col-span-2">
                                        <EducationCard
                                            school={selectedEducation.school ?? ''}
                                            startYear={selectedEducation.start_year ?? ''}
                                            endYear={selectedEducation.end_year ?? ''}
                                            levelLabel={selectedEducation.level ?? ''}
                                            diplomaUrl={selectedEducation.diploma_path ?? null}
                                            createdAt={undefined}
                                            actions={{
                                                editHref: '',
                                                deleteHref: ''
                                            }}
                                        />
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
