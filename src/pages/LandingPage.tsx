import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Shield, Languages, Sparkles, Zap, Activity, Workflow } from 'lucide-react';
import { AppControls } from '../components/AppControls';
import { siteCopy } from '../content/siteCopy';
import { useAppSettings } from '../context/AppSettingsContext';

export const LandingPage = () => {
  const { language } = useAppSettings();
  const copy = siteCopy[language];
  const featureIcons = [Bot, Shield, Languages] as const;
  const previewIcons = [Sparkles, Activity, Workflow] as const;

  return (
    <div className="page-shell min-h-screen overflow-hidden">
      <nav
        className="fixed inset-x-0 top-0 z-50 border-b app-border backdrop-blur-md"
        style={{ backgroundColor: 'var(--app-bg)' }}
      >
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="app-logo-badge h-11 w-11 rounded-2xl">
              <Zap size={18} className="text-[color:var(--app-accent)]" />
            </span>
            <span className="text-lg font-semibold tracking-tight app-text">{copy.common.brand}</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/sign-in"
              className="hidden text-sm font-medium app-muted transition-colors hover:text-[color:var(--app-text)] sm:inline-flex"
            >
              {copy.common.signIn}
            </Link>
            <Link to="/sign-up" className="hidden rounded-full app-button-primary px-4 py-2 text-sm font-semibold sm:inline-flex">
              {copy.common.signUp}
            </Link>
            <AppControls compact />
          </div>
        </div>
      </nav>

      <main className="px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        <section className="mx-auto grid w-full max-w-7xl gap-8 xl:grid-cols-[minmax(0,1.1fr)_460px] xl:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full app-pill px-3 py-1.5 text-xs font-semibold">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: 'var(--app-accent)' }}
              />
              <span className="app-muted">{copy.landing.badge}</span>
            </div>

            <div className="max-w-4xl space-y-5">
              <h1 className="text-4xl font-semibold tracking-tight app-text sm:text-5xl lg:text-6xl">
                {copy.landing.title}
              </h1>
              <p className="max-w-3xl text-base leading-8 app-muted sm:text-lg">
                {copy.landing.description}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/sign-up" className="app-button-primary inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold">
                {copy.landing.primaryCta}
                <ArrowRight size={16} />
              </Link>
              <Link to="/dashboard" className="app-button-secondary inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold">
                {copy.landing.secondaryCta}
              </Link>
            </div>

            <div className="app-panel-subtle rounded-[28px] p-5 sm:p-6">
              <div className="text-sm font-semibold app-text">{copy.landing.socialProofLabel}</div>
              <div className="mt-4 flex flex-wrap gap-3">
                {copy.landing.socialProofItems.map((item) => (
                  <span key={item} className="rounded-full app-pill px-3 py-1.5 text-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="surface-card rounded-[32px] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold app-text">{copy.landing.previewTitle}</div>
                <p className="mt-2 text-sm leading-6 app-muted">{copy.landing.previewDescription}</p>
              </div>
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: 'var(--app-accent-soft)',
                  color: 'var(--app-accent)',
                }}
              >
                {copy.landing.liveBadge}
              </span>
            </div>

            <div className="mt-6 rounded-[28px] app-panel-subtle p-5">
              <div className="grid gap-4">
                {copy.landing.previewCards.map((card, index) => {
                  const Icon = previewIcons[index] ?? Sparkles;

                  return (
                    <div key={card.label} className="rounded-[22px] app-panel px-4 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-medium app-muted">{card.label}</div>
                          <div className="mt-2 text-3xl font-semibold app-text">{card.value}</div>
                          <div className="mt-2 text-sm app-muted">{card.caption}</div>
                        </div>
                        <span
                          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl"
                          style={{
                            backgroundColor: 'var(--app-accent-soft)',
                            color: 'var(--app-accent)',
                          }}
                        >
                          <Icon size={18} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-10 w-full max-w-7xl border-t app-border pt-10 sm:mt-14 sm:pt-14">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight app-text">{copy.landing.featureTitle}</h2>
            <p className="mt-4 text-base leading-7 app-muted">{copy.landing.featureDescription}</p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {copy.landing.features.map((feature, index) => {
              const Icon = featureIcons[index] ?? Bot;

              return (
                <div key={feature.title} className="surface-card rounded-[28px] p-6 transition-transform duration-200 hover:-translate-y-0.5">
                  <span
                    className="inline-flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{
                      backgroundColor: 'var(--app-accent-soft)',
                      color: 'var(--app-accent)',
                    }}
                  >
                    <Icon size={20} />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold app-text">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 app-muted">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t app-border px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="inline-flex items-center gap-2">
            <span className="app-logo-badge h-9 w-9 rounded-xl">
              <Zap size={15} className="text-[color:var(--app-accent)]" />
            </span>
            <span className="text-sm font-semibold app-text">{copy.common.brand}</span>
          </div>
          <p className="text-xs app-muted">
            © {new Date().getFullYear()} {copy.common.brand}
          </p>
        </div>
      </footer>
    </div>
  );
};
