import React, { Suspense } from 'react';
const LazyBarcode = React.lazy(() => import('react-barcode'));

type EducationCardProps = {
    education: {
        id: number;
        school: string;
        start_year: string | number;
        end_year: string | number | null;
        level?: string;
        diploma_path?: string | null;
        verified?: boolean | number | string;
        barcode?: string | null;
    };
    onEdit?: (id: number) => void;
    onDelete?: (id: number) => void;
    levelLabel?: string | null;
};

function formatDate(dateStr?: string | number | null) {
    if (!dateStr) return '';
    try {
        const d = new Date(String(dateStr));
        if (Number.isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString();
    } catch (e) {
        return dateStr;
    }
}
export default function EducationListCard({ education, onEdit, onDelete, levelLabel }: EducationCardProps) {
    const { id, school, start_year, end_year, barcode, level } = education;
    const ongoing = !end_year || (Number(end_year) === 0) || (new Date(String(end_year)) > new Date());
    const diplomaPath = (education as any).diploma_path as string | null | undefined;
    const [showPreview, setShowPreview] = React.useState(false);

    const v = (education as any).verified;
    const verified = v === true || v === 1 || v === '1' ? true : (v === false || v === 0 || v === '0' ? false : undefined);

        return (
                <div
                        className={`relative w-full max-w-md mx-auto bg-white/80 dark:bg-neutral-900/70 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden ${
                                verified === true
                                        ? 'border-l-4 border-l-emerald-500'
                                        : verified === false
                                        ? 'border-l-4 border-l-red-500'
                                        : ''
                        }`}
                >
            <div className="p-4 flex flex-col items-center">
                {barcode ? (
                    <div className="w-full flex justify-center mb-3">
                        <div className="rounded bg-white p-2">
                            <Suspense fallback={<div className="text-xs text-muted-foreground">Ładowanie...</div>}>
                                <LazyBarcode value={barcode} displayValue={false} height={48} margin={0} background="white" lineColor="#000" />
                                <div className="text-center text-muted-foreground">{barcode}</div>
                            </Suspense>
                        </div>
                    </div>
                ) : (
                    <div className="mb-3 h-12 flex items-center justify-center w-full text-sm text-muted-foreground">Brak kodu kreskowego</div>
                )}

                <div className="text-center w-full relative">
                    <div className="text-sm text-emerald-700 dark:text-emerald-300 font-semibold mb-1">Wykształcenie</div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{school}</h3>
                    <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Okres: </span>
                        <span>{formatDate(start_year)}</span>
                        <span className="mx-2">—</span>
                        <span>{ongoing ? 'W trakcie' : formatDate(end_year)}</span>
                    </div>

                    {!ongoing && (levelLabel || level) && (
                        <div className="mt-2 text-sm text-gray-800 dark:text-gray-200">
                            <span className="font-medium"> Poziom: </span>
                            <span>{levelLabel ?? level}</span>
                        </div>
                    )}

                    <div className="mt-4 flex items-center justify-center gap-3">
                        {!ongoing && diplomaPath && (
                            <button
                                type="button"
                                onClick={() => setShowPreview(true)}
                                className="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm"
                            >
                                Dyplom
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => onEdit?.(id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                            Edytuj
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                                                onDelete?.(id);
                            }}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        >
                            Usuń
                        </button>
                    </div>

                    {diplomaPath && showPreview && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowPreview(false)}>
                            <div className="relative bg-white rounded shadow-lg p-4 max-w-3xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
                                <button className="absolute top-2 right-2 text-slate-600 hover:text-red-600" onClick={() => setShowPreview(false)}>&#10005;</button>
                                <div className="flex justify-center">
                                    <img src={`/${diplomaPath}`} alt="Dyplom" className="max-h-[70vh] w-auto rounded" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
