import React, { useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';

interface LevelOption { value: string; label: string }

interface Props {
	levels: LevelOption[];
	storeRoute?: string; // default: employee.education.store
	afterSubmit?: () => void;
	userId?: number | string; // (opcjonalnie) przekaż jeśli chcesz wysłać user_id
}

export default function EducationAddSchoolCard({ levels, storeRoute = 'employee.education.store', afterSubmit, userId }: Props) {
	const fileRef = useRef<HTMLInputElement | null>(null);
	const [preview, setPreview] = useState<string | null>(null);

	const { data, setData, post, processing, errors, reset, progress } = useForm({
        school: '',
        address: '',
        city: '',
        start_date: '',
        end_date: '',
        start_year: '',
        end_year: '',
        zip_code: '',
        level: levels[0]?.value || '',
        diploma: null as File | null,
        user_id: userId ?? '',
        rodo_accept: false, // NEW
	});

	const [clientErrors, setClientErrors] = useState<Record<string,string>>({});

	function validateField(name: string, value: string) {
		const next: Record<string,string> = { ...clientErrors };
		const zipRegex = /^[0-9]{2}-?[0-9]{3}$/; // 12-345 lub 12345
		if (name === 'school') {
			if (!value.trim()) next.school = 'Wymagane'; else if (value.length < 2) next.school = 'Min 2 znaki'; else delete next.school;
		}
		if (name === 'address') {
			if (value && value.length < 3) next.address = 'Min 3 znaki'; else if (value) delete next.address;
		}
		if (name === 'city') {
			if (!value.trim()) next.city = 'Wymagane'; else if (value.length < 2) next.city = 'Min 2 znaki'; else delete next.city;
		}
		if (name === 'start_date') {
			if (!value) next.start_date = 'Wybierz datę'; else delete next.start_date;
		}
		if (name === 'end_date') {
			if (value && data.start_date && value < data.start_date) next.end_date = 'Koniec przed startem'; else delete next.end_date;
		}
		if (name === 'zip_code') {
			if (value && !zipRegex.test(value)) next.zip_code = 'Format: 12-345 lub 12345'; else if (value) delete next.zip_code;
        }
		if (name === 'rodo_accept') {
            const next = { ...clientErrors };
            if (value === 'true' || value === '1') delete next.rodo_accept;
            setClientErrors(next);
        }
		setClientErrors(next);
	}

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const f = e.target.files?.[0];
		setData('diploma', f || null);
		if (f) {
			const url = URL.createObjectURL(f);
			setPreview(p => { if (p) URL.revokeObjectURL(p); return url; });
		} else {
			setPreview(null);
		}
	}

	function submit(e: React.FormEvent) {
		e.preventDefault();
		const zipRegex = /^[0-9]{2}-?[0-9]{3}$/;
		const errs: Record<string,string> = {};

		if (!data.school.trim()) errs.school = 'Wymagane';
		else if (data.school.trim().length < 2) errs.school = 'Min 2 znaki';

		if (!data.city.trim()) errs.city = 'Wymagane';
		else if (data.city.trim().length < 2) errs.city = 'Min 2 znaki';

		if (!data.start_date) errs.start_date = 'Wybierz datę';
		if (data.end_date && data.start_date && data.end_date < data.start_date) errs.end_date = 'Koniec przed startem';

		if (data.zip_code && !zipRegex.test(data.zip_code)) errs.zip_code = 'Format: 12-345 lub 12345';

		if (!data.rodo_accept) errs.rodo_accept = 'Wymagana zgoda RODO';

		setClientErrors(errs);
		if (Object.keys(errs).length) return;

		// Uzupełnij pola zależne
		if (data.start_date) setData('start_year', data.start_date.substring(0,4));
		if (data.end_date) setData('end_year', data.end_date.substring(0,4));

		if (!data.user_id && userId) setData('user_id', String(userId));

		post((typeof route === 'function') ? route(storeRoute) : '/employee/education', {
			forceFormData: true,
			onSuccess: () => {
				reset();
				setPreview(null);
				setClientErrors({});
				afterSubmit?.();
			},
			onError: () => {
				// błędy backendu już są w errors
			},
			onFinish: () => {
				if (window.location.search.includes('debug=1')) {
					console.log('[EDU:FORM_SENT]', data);
				}
			}
		});
	}

		return (
			<div className="min-h-[calc(100vh-160px)] flex items-start md:items-center justify-center py-8">
				<form
					onSubmit={submit}
					className="relative isolate overflow-hidden w-full max-w-3xl rounded-2xl border border-slate-200/70 dark:border-slate-700/60 bg-white/90 dark:bg-slate-800/70 shadow-xl backdrop-blur px-8 py-7 lg:py-8 flex flex-col gap-8 animate-[fadeIn_.4s_ease]"
				>
					<div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
					<h2 className="text-lg font-semibold tracking-wide text-slate-700 dark:text-slate-100">Dodaj szkołę</h2>

					<div className="grid gap-10 md:grid-cols-2">
						{/* LEFT */}
						<div className="flex flex-col gap-5">
							<div className="space-y-1">
								<label className="block text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Nazwa szkoły</label>
								<input
									type="text"
									value={data.school}
									onChange={e => { setData('school', e.target.value); validateField('school', e.target.value); }}
									className="w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-100 focus:border-emerald-500 focus:ring-emerald-500 text-sm"
									required
									maxLength={255}
									placeholder="Np. LO im. Jana Pawła II  nr 1 w ..."
								/>
								{(clientErrors.school || errors.school) && <p className="text-xs text-red-500 mt-0.5">{clientErrors.school || errors.school}</p>}
							</div>
							<div className="space-y-1">
								<label className="block text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Adres szkoły (opcjonalnie)</label>
								<input
									type="text"
									value={data.address}
									onChange={e => { setData('address', e.target.value); validateField('address', e.target.value); }}
									placeholder="Ulica, miasto..."
									className="w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-100 focus:border-emerald-500 focus:ring-emerald-500 text-sm"
									maxLength={255}
								/>
								{clientErrors.address && <p className="text-xs text-red-500 mt-0.5">{clientErrors.address}</p>}
							</div>
																					<div className='space-y-4'>
																						<div className='space-y-1'>
																							<label className="block text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Kod pocztowy (opcjonalnie)</label>
																							<input
																								type="text"
																								inputMode="numeric"
																								value={data.zip_code}
																								onChange={e => { setData('zip_code', e.target.value); validateField('zip_code', e.target.value); }}
																								placeholder="12-345 lub 12345"
																								className="w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-100 focus:border-emerald-500 focus:ring-emerald-500 text-sm"
																								maxLength={6}
																							/>
																							{clientErrors.zip_code && <p className="text-xs text-red-500 mt-0.5">{clientErrors.zip_code}</p>}
																						</div>
																						<div className='space-y-1'>
																							<label className="block text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Miasto</label>
																							<input
																								type="text"
																								value={data.city}
																								onChange={e => { setData('city', e.target.value); validateField('city', e.target.value); }}
																								placeholder="Np. Warszawa"
																								className="w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-100 focus:border-emerald-500 focus:ring-emerald-500 text-sm"
																								maxLength={120}
																								required
																							/>
																							{(clientErrors.city || errors.city) && <p className="text-xs text-red-500 mt-0.5">{clientErrors.city || (errors as any).city}</p>}
																						</div>
																					</div>
							<div className="flex flex-col gap-5 sm:flex-row sm:gap-4">
								<div className="flex-1 space-y-1">
									<label className="block text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Data rozpoczęcia</label>
									<input
										type="date"
										value={data.start_date}
										onChange={e => { setData('start_date', e.target.value); validateField('start_date', e.target.value); }}
										className="w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-100 focus:border-emerald-500 focus:ring-emerald-500 text-sm"
										required
										max={data.end_date || undefined}
									/>
									{(clientErrors.start_date || errors.start_date) && <p className="text-xs text-red-500 mt-0.5">{clientErrors.start_date || (errors as any).start_date}</p>}
								</div>
								<div className="flex-1 space-y-1">
									<label className="block text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Data zakończenia</label>
									<input
										type="date"
										value={data.end_date}
										onChange={e => { setData('end_date', e.target.value); validateField('end_date', e.target.value); }}
										className="w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-100 focus:border-emerald-500 focus:ring-emerald-500 text-sm"
										min={data.start_date || undefined}
									/>
									{(clientErrors.end_date || errors.end_date) && <p className="text-xs text-red-500 mt-0.5">{clientErrors.end_date || (errors as any).end_date}</p>}
								</div>
							</div>
						</div>

						{/* RIGHT */}
						<div className="flex flex-col gap-6">
							<div className="space-y-1">
								<label className="block text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Poziom</label>
								<select
									value={data.level}
									onChange={e => setData('level', e.target.value)}
									className="w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-100 focus:border-emerald-500 focus:ring-emerald-500 text-sm"
									required
								>
									{levels.map(l => (
										<option key={l.value} value={l.value}>{l.label}</option>
									))}
								</select>
								{errors.level && <p className="text-xs text-red-500 mt-0.5">{errors.level}</p>}
							</div>
							<div className="space-y-3">
								<label className="block text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Skan / zdjęcie dyplomu (opcjonalnie)</label>
								<div className="flex flex-col gap-3">
									<div className="flex flex-wrap items-center gap-3">
										<button
											type="button"
											onClick={() => fileRef.current?.click()}
											className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-600 dark:bg-slate-700/40 dark:text-slate-200 dark:hover:border-emerald-500/50 dark:hover:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-60"
											disabled={processing}
										>
											{data.diploma ? 'Zmień plik' : 'Wybierz plik'}
										</button>
										{data.diploma && (
											<p className="text-[11px] text-slate-500 dark:text-slate-400">
												{data.diploma.name} ({Math.round(data.diploma.size/1024)} KB)
											</p>
										)}
									</div>
									<input
										ref={fileRef}
										type="file"
										accept="image/*,application/pdf"
										className="hidden"
										onChange={handleFileChange}
									/>
									{errors.diploma && <p className="text-xs text-red-500 mt-1">{errors.diploma}</p>}
									{progress && (
										<div className="h-1 rounded bg-slate-200 dark:bg-slate-700 overflow-hidden">
											<div className="h-full bg-emerald-500 transition-all" style={{ width: progress.percentage + '%' }} />
										</div>
									)}
									<div className="w-44 h-44 border border-dashed border-slate-300 dark:border-slate-600 rounded-md flex items-center justify-center overflow-hidden bg-slate-50/60 dark:bg-slate-900/40 shadow-inner">
										{preview ? (
											<img src={preview} alt="Podgląd" className="object-cover w-full h-full" />
										) : (
											<span className="text-[10px] text-slate-400 text-center px-2">Brak podglądu</span>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="flex items-start gap-2 pt-2">
                        <input
                            id="rodo_accept"
                            type="checkbox"
                            checked={!!data.rodo_accept}
                            onChange={e => {
                                setData('rodo_accept', e.target.checked);
                                validateField('rodo_accept', String(e.target.checked));
                            }}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-700"
                            required
                        />
                        <label htmlFor="rodo_accept" className="text-[11px] leading-snug text-slate-600 dark:text-slate-300">
                            Wyrażam zgodę na przetwarzanie moich danych osobowych w celu dodania informacji o edukacji
                            (RODO). <span className="font-medium">Zgoda wymagana.</span>
                        </label>
                    </div>
                    {(clientErrors.rodo_accept || (errors as any).rodo_accept) && (
                        <p className="text-xs text-red-500 -mt-1">{clientErrors.rodo_accept || (errors as any).rodo_accept}</p>
                    )}

					<div className="flex items-center justify-end gap-3 pt-2">
						<button
							type="button"
							onClick={() => { reset(); setPreview(null); if (fileRef.current) fileRef.current.value = ''; setClientErrors({}); }}
							className="rounded-md border border-slate-300 bg-white px-5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-700/40 dark:text-slate-300 dark:hover:text-white"
							disabled={processing}
						>
							Wyczyść
						</button>
						<button
							type="submit"
							disabled={processing}
							className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-6 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-60"
						>
							{processing && <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
							Zapisz
						</button>
					</div>

					<div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100" />
				</form>
			</div>
		);
}

