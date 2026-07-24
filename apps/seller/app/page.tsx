export default function SellerHomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10 sm:px-10">
      <header className="flex items-center justify-between border-b border-border pb-5">
        <span className="font-semibold tracking-tight">Sourcera Seller</span>
        <a
          className="inline-flex min-h-11 items-center rounded-md border border-border px-4 text-sm text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          href="/api/health"
        >
          System health
        </a>
      </header>
      <section className="my-auto max-w-3xl py-20">
        <p className="mb-4 font-mono text-sm text-primary">Seller Console</p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
          Respond with confidence.
        </h1>
        <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">
          Invitations, required agreements, and evaluation responses will stay
          in one secure workspace.
        </p>
      </section>
      <footer className="border-t border-border pt-5 font-mono text-xs text-muted-foreground">
        R0 Seller foundation
      </footer>
    </main>
  );
}
