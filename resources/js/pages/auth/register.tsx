import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Register() {
  const form = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    form.post(route('register'));
  }

  return (
    <>
      <Head title="Register" />

      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center p-6"
        style={{ backgroundImage: "url('/back_ground/bg-primary_login.jpg')" }}
      >
        <div className="w-full max-w-md z-10 px-4">
          <div className="relative rounded-xl bg-black/70 border border-emerald-400/10 shadow-xl overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 border-2 rounded-xl border-emerald-500/10 filter blur-sm"></div>
              <div
                className="absolute -inset-px rounded-xl"
                style={{ boxShadow: '0 0 30px rgba(16,185,129,0.06), inset 0 0 40px rgba(16,185,129,0.02)' }}
              />
            </div>

            <div className="relative p-8">
              <h1 className="text-center text-2xl font-bold tracking-wider text-emerald-300 mb-6">REJESTRACJA</h1>

              <form onSubmit={submit} className="flex flex-col gap-5">
                <div>
                  <Label htmlFor="name" className="text-emerald-200/80 uppercase text-xs tracking-widest">
                    Imię i nazwisko
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={form.data.name}
                    onChange={(e) => form.setData('name', e.currentTarget.value)}
                    className="mt-2 bg-neutral-900/60 border border-emerald-900/50 text-emerald-100 w-full"
                    required
                  />
                  <InputError message={form.errors.name} />
                </div>

                <div>
                  <Label htmlFor="email" className="text-emerald-200/80 uppercase text-xs tracking-widest">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.data.email}
                    onChange={(e) => form.setData('email', e.currentTarget.value)}
                    className="mt-2 bg-neutral-900/60 border border-emerald-900/50 text-emerald-100 w-full"
                    required
                  />
                  <InputError message={form.errors.email} />
                </div>

                <div>
                  <Label htmlFor="password" className="text-emerald-200/80 uppercase text-xs tracking-widest">
                    Hasło
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={form.data.password}
                    onChange={(e) => form.setData('password', e.currentTarget.value)}
                    className="mt-2 bg-neutral-900/60 border border-emerald-900/50 text-emerald-100 w-full"
                    required
                  />
                  <InputError message={form.errors.password} />
                </div>

                <div>
                  <Label htmlFor="password_confirmation" className="text-emerald-200/80 uppercase text-xs tracking-widest">
                    Powtórz hasło
                  </Label>
                  <Input
                    id="password_confirmation"
                    name="password_confirmation"
                    type="password"
                    value={form.data.password_confirmation}
                    onChange={(e) => form.setData('password_confirmation', e.currentTarget.value)}
                    className="mt-2 bg-neutral-900/60 border border-emerald-900/50 text-emerald-100 w-full"
                    required
                  />
                  <InputError message={form.errors.password_confirmation} />
                </div>

                <div className="flex flex-col gap-3 mt-2">
                  <Button
                    type="submit"
                    className="w-full py-3 rounded-md bg-gradient-to-r from-emerald-400 to-lime-300 text-black font-semibold tracking-wide shadow-[0_6px_18px_rgba(16,185,129,0.18)]"
                    disabled={form.processing}
                  >
                    ZAREJESTRUJ
                  </Button>

                  <div className="text-center text-sm text-emerald-200/60">
                    Masz już konto?{' '}
                    <TextLink href={route('login')} className="text-emerald-300">
                      Zaloguj się
                    </TextLink>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="mt-6 h-1 rounded-full bg-gradient-to-r from-emerald-400/40 via-transparent to-lime-300/20"></div>
        </div>
      </div>
    </>
  );
}
