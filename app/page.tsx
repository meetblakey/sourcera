import { Activity, ArrowRight, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-between px-6 py-10 sm:px-10">
      <header className="flex items-center justify-between border-b border-border pb-5">
        <span className="font-semibold tracking-tight">Sourcera</span>
        <a
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          href="/api/health"
        >
          <Activity aria-hidden="true" className="size-4" />
          System health
        </a>
      </header>

      <section className="max-w-3xl py-20 sm:py-28">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground">
          <ShieldCheck aria-hidden="true" className="size-4 text-primary" />
          First defensible evaluation
        </div>
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
          Make software selection accountable.
        </h1>
        <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">
          Sourcera turns requirements, seller responses, scoring, and the final
          decision into one auditable record.
        </p>
        <a
          className="mt-9 inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          href="/api/health"
        >
          Verify the foundation
          <ArrowRight aria-hidden="true" className="size-4" />
        </a>
      </section>

      <footer className="border-t border-border pt-5 font-mono text-xs text-muted-foreground">
        R0 application foundation
      </footer>
    </main>
  );
}
