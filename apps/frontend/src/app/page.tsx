import React from 'react';

const highlights = [
  {
    title: 'Backend foundation',
    description:
      'NestJS bootstrap, Prisma service wiring, auth, users, and health modules are now in place.',
  },
  {
    title: 'Shared data model',
    description:
      'The Prisma schema defines users, sessions, and profiles for the first product flows.',
  },
  {
    title: 'Frontend shell',
    description:
      'The app router is set up and the homepage now acts like a real product entry point.',
  },
];

const nextSteps = [
  'Connect auth screens to the backend endpoints.',
  'Add real dashboard or discovery flows.',
  'Wire form state, validation, and loading states.',
  'Add tests and seed data for the first business flow.',
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#09111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.18),_transparent_28%),linear-gradient(180deg,_#0b1220_0%,_#090f1a_48%,_#050814_100%)]" />
      <div className="absolute left-1/2 top-[-12rem] h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 lg:px-10">
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-xl">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Findora</p>
            <p className="text-sm text-white/70">Monorepo product foundation</p>
          </div>
          <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
            Backend scaffold ready
          </div>
        </header>

        <div className="grid flex-1 gap-10 py-12 lg:grid-cols-[1.3fr_0.7fr] lg:items-center lg:py-20">
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
              <span className="h-2 w-2 rounded-full bg-cyan-300" />
              Ready to turn structure into product
            </div>

            <div className="space-y-5">
              <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
                Build the first Findora experience on a clean full-stack base.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-white/72 sm:text-xl">
                The repo now has a working monorepo layout, a NestJS backend shell with Prisma,
                and a frontend landing page that can become the first real user journey.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <a
                href="#next"
                className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                See what to build next
              </a>
              <a
                href="#foundation"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Review the foundation
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur">
                <p className="text-3xl font-semibold text-white">3</p>
                <p className="mt-1 text-sm text-white/60">core folders wired</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur">
                <p className="text-3xl font-semibold text-white">1</p>
                <p className="mt-1 text-sm text-white/60">shared types package</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur">
                <p className="text-3xl font-semibold text-white">0</p>
                <p className="mt-1 text-sm text-white/60">finished product flows</p>
              </div>
            </div>
          </div>

          <aside className="grid gap-4">
            <div className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.25em] text-cyan-200/70">Foundation</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">What is already built</h2>
              <div className="mt-5 space-y-4">
                {highlights.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-white/65">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div id="foundation" className="rounded-[2rem] border border-amber-300/15 bg-amber-300/10 p-6 backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.25em] text-amber-100/70">Readiness</p>
              <p className="mt-3 text-lg leading-7 text-amber-50">
                The project is scaffolded and partially wired, but the user-facing product still needs
                real flows, data integration, and tests.
              </p>
            </div>
          </aside>
        </div>

        <section id="next" className="grid gap-5 border-t border-white/10 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:py-14">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-200/70">Next steps</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">The shortest path to an MVP</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/65">
              Build one complete vertical slice first: authentication, one primary dashboard or discovery
              flow, and the data needed to support it end to end.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {nextSteps.map((step) => (
              <div key={step} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/80">
                {step}
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
