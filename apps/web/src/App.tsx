const buildVersion = import.meta.env.VITE_APP_VERSION ?? 'development';

export function App() {
  return (
    <main className="app-shell" aria-labelledby="app-title">
      <section className="hero-card" aria-describedby="app-summary">
        <p className="eyebrow">Local-first web application scaffold</p>
        <h1 id="app-title">NoteQuest</h1>
        <p id="app-summary">
          Initial Vite, React, and strict TypeScript foundation for the static no-backend PWA.
        </p>
        <dl className="status-list" aria-label="Scaffold status">
          <div>
            <dt>Build version</dt>
            <dd>{buildVersion}</dd>
          </div>
          <div>
            <dt>Persistence</dt>
            <dd>Not implemented in this scaffold</dd>
          </div>
          <div>
            <dt>Backend</dt>
            <dd>None required</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
