
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import React, { useEffect } from 'react';

import { type SharedData } from '@/types';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const page = usePage<SharedData>();
    const auth = page.props?.auth as SharedData['auth'] | undefined;

    const form = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        if (auth?.user) {
            router.visit(route('dashboard'));
        }
    }, [auth]);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post(route('login'), { preserveScroll: true });
    }

    return (
          <>
              <Head title="Login" />
              <div
                className="min-h-screen flex items-center justify-center text-slate-100 bg-cover bg-center relative"
                style={{ backgroundImage: "url('/back_ground/bg-primary_login.jpg')" }}
              >
                {/* decorative side glows */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute -left-48 top-1/3 w-96 h-96 rounded-full bg-emerald-700/20 blur-3xl transform rotate-12 opacity-40"></div>
                  <div className="absolute -right-48 bottom-1/3 w-[520px] h-[520px] rounded-full bg-lime-500/20 blur-3xl -rotate-6 opacity-30"></div>
                </div>

                <div className="relative z-10 w-full max-w-lg px-6">
                  <div className="relative rounded-xl bg-black/70 border border-emerald-400/10 shadow-xl overflow-hidden">
                    {/* neon frame */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 border-2 rounded-xl border-emerald-500/20 filter blur-sm"></div>
                      <div className="absolute -inset-px rounded-xl" style={{ boxShadow: '0 0 30px rgba(16,185,129,0.08), inset 0 0 40px rgba(16,185,129,0.02)' }} />
                    </div>

                    <div className="relative p-8">
                      <h1 className="text-center text-2xl font-bold tracking-wider text-emerald-300 mb-6">LOGOWANIE</h1>

                      <form onSubmit={submit} className="space-y-4">
                        <div>
                          <label className="text-xs text-emerald-200/80 uppercase tracking-widest">Login</label>
                          <input
                            type="email"
                            value={form.data.email}
                            onChange={e => form.setData('email', e.currentTarget.value)}
                            required
                            className="mt-2 w-full bg-neutral-900/60 border border-emerald-900/50 text-emerald-100 placeholder:emerald-400/40 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-60"
                            placeholder="adres email"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-emerald-200/80 uppercase tracking-widest">Hasło</label>
                          <input
                            type="password"
                            value={form.data.password}
                            onChange={e => form.setData('password', e.currentTarget.value)}
                            required
                            className="mt-2 w-full bg-neutral-900/60 border border-emerald-900/50 text-emerald-100 placeholder:emerald-400/40 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-60"
                            placeholder="hasło"
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs text-emerald-200/70">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={form.data.remember}
                              onChange={e => form.setData('remember', e.currentTarget.checked)}
                              className="accent-emerald-400"
                            />
                            Zapamiętaj mnie
                          </label>
                          <Link href={route('password.request')} className="text-emerald-300 hover:underline">przypomnienie hasła</Link>
                        </div>

                        <div className="pt-3">
                          <button
                            type="submit"
                            disabled={form.processing}
                            className="w-full py-2 rounded-md bg-gradient-to-r from-emerald-400 to-lime-300 text-black font-semibold tracking-wide shadow-[0_6px_18px_rgba(16,185,129,0.18)] hover:brightness-105"
                          >
                            ZALOGUJ
                          </button>
                        </div>
                      </form>

                      <div className="mt-4 text-center text-xs text-emerald-200/60">
                        Nie masz konta? <Link href={route('register')} className="text-emerald-300 hover:underline">Zarejestruj się</Link>
                      </div>
                    </div>
                  </div>

                  {/* thin neon underline */}
                  <div className="mt-6 h-1 rounded-full bg-gradient-to-r from-emerald-400/40 via-transparent to-lime-300/20"></div>
                </div>
              </div>
            </>
    );
}
