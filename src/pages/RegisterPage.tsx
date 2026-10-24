import { Link } from 'react-router-dom';
import { FiArrowLeft, FiHeart, FiLock, FiStar } from 'react-icons/fi';
import { RegisterForm } from '../features/auth/components/RegisterForm';

export function RegisterPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050814] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(124,58,237,0.22),transparent_28%),radial-gradient(circle_at_88%_12%,rgba(236,72,153,0.14),transparent_24%),linear-gradient(180deg,#050814_0%,#080b18_55%,#050713_100%)]" />
      <div className="pointer-events-none absolute left-[-140px] top-[32%] h-80 w-80 rounded-full bg-violet-700/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-120px] right-[-100px] h-96 w-96 rounded-full bg-fuchsia-600/10 blur-3xl" />

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link
          to="/"
          className="group inline-flex items-center gap-3 text-white no-underline"
          aria-label="Voltar para o CosmosMatch"
        >
          <span className="grid h-10 w-10 place-items-center rounded-full border border-violet-400/30 bg-violet-500/10 text-violet-200 shadow-[0_0_28px_rgba(139,92,246,0.2)]">
            ◉
          </span>
          <span className="text-xl font-extrabold tracking-[-0.04em]">
            Cosmos<span className="text-fuchsia-300">Match</span>
          </span>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
        >
          <FiArrowLeft />
          Voltar ao início
        </Link>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 pb-12 pt-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16 lg:px-10 lg:pb-16 lg:pt-8">
        <section className="hidden lg:block">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-violet-200">
            <FiStar />
            Sua jornada começa aqui
          </span>

          <h1 className="mt-7 max-w-xl text-6xl font-black leading-[0.98] tracking-[-0.06em]">
            Crie seu perfil e descubra conexões com mais
            <span className="block bg-gradient-to-r from-fuchsia-300 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
              sentido.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-400">
            Um cadastro simples para começar. Depois, você completa seu perfil,
            interesses e informações de compatibilidade dentro do CosmosMatch.
          </p>

          <div className="mt-10 grid max-w-xl gap-4">
            <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-fuchsia-500/10 text-fuchsia-300">
                <FiHeart />
              </span>
              <div>
                <h2 className="font-bold text-white">Seu @ é sua identidade pública</h2>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Escolha um identificador fácil de lembrar. É ele que outras pessoas verão no app.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-500/10 text-violet-300">
                <FiLock />
              </span>
              <div>
                <h2 className="font-bold text-white">Cadastro com mais clareza</h2>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Seu nome completo e seu identificador público ficam separados para evitar confusão.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-xl">
          <div className="rounded-[28px] border border-violet-300/15 bg-[#0c1226]/85 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:p-8 lg:p-10">
            <div className="mb-8">
              <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-violet-300">
                Criar conta
              </span>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
                Comece no CosmosMatch
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">
                Preencha seus dados básicos. Você poderá completar o restante do perfil depois.
              </p>
            </div>

            <RegisterForm />

            <p className="mt-6 text-center text-xs leading-5 text-slate-500">
              Ao criar sua conta, você concorda com nossos{' '}
              <Link to="/terms" className="font-semibold text-violet-300 hover:text-violet-200">
                Termos de Uso
              </Link>{' '}
              e{' '}
              <Link to="/privacy" className="font-semibold text-violet-300 hover:text-violet-200">
                Política de Privacidade
              </Link>.
            </p>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs uppercase tracking-[0.16em] text-slate-600">ou</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <p className="text-center text-sm text-slate-400">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="font-bold text-violet-300 transition hover:text-violet-200"
              >
                Entrar no CosmosMatch
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default RegisterPage;
