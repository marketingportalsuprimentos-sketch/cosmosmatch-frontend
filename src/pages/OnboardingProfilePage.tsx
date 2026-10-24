import React from 'react';
import { FiCheckCircle, FiLock, FiStar } from 'react-icons/fi';
import { EditProfileForm } from '../features/profile/components/EditProfileForm';

export const OnboardingProfilePage: React.FC = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050814] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(124,58,237,0.20),transparent_28%),radial-gradient(circle_at_88%_16%,rgba(236,72,153,0.12),transparent_24%),linear-gradient(180deg,#050814_0%,#080b18_52%,#050713_100%)]" />
      <div className="pointer-events-none absolute left-[-160px] top-[34%] h-96 w-96 rounded-full bg-violet-700/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-140px] right-[-120px] h-96 w-96 rounded-full bg-fuchsia-600/10 blur-3xl" />

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <div className="inline-flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full border border-violet-400/30 bg-violet-500/10 text-violet-200 shadow-[0_0_28px_rgba(139,92,246,0.2)]">
            ◉
          </span>
          <span className="text-xl font-extrabold tracking-[-0.04em]">
            Cosmos<span className="text-fuchsia-300">Match</span>
          </span>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/5 px-4 py-2 text-xs font-bold text-emerald-300 sm:flex">
          <FiCheckCircle />
          Conta criada
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 lg:px-10">
        <section className="mx-auto mb-8 max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-violet-200">
            <FiStar />
            Última etapa
          </span>

          <h1 className="mt-5 text-4xl font-black tracking-[-0.055em] sm:text-5xl lg:text-6xl">
            Complete seu perfil para o CosmosMatch
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Essas informações ajudam a montar seu perfil, calcular compatibilidades
            e personalizar sua experiência dentro da plataforma.
          </p>

          <div className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">
              <FiLock className="text-violet-300" />
              Dados sensíveis não ficam públicos
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">
              <FiStar className="text-fuchsia-300" />
              Usado para compatibilidade
            </span>
          </div>
        </section>

        <EditProfileForm />
      </main>
    </div>
  );
};

export default OnboardingProfilePage;
