import { Component, type ErrorInfo, type ReactNode, useEffect, useState } from 'react';
import type { SlotRecord } from '@notequest/application';
import { createWebComposition, type AppComposition } from './composition';

interface AppProps {
  readonly compose?: () => Promise<AppComposition>;
}

interface BoundaryProps {
  readonly children: ReactNode;
  readonly onRetry: () => void;
}

interface BoundaryState {
  readonly error: Error | null;
}

export class RootErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Application shell render failed.', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.error !== null) {
      return <RootErrorState onRetry={this.props.onRetry} />;
    }
    return this.props.children;
  }
}

function RootLoadingState() {
  return (
    <main className="root-state" aria-busy="true" aria-labelledby="loading-title">
      <div className="state-card">
        <p className="eyebrow">Preparing local workspace</p>
        <h1 id="loading-title">NoteQuest</h1>
        <p role="status">Checking local data. No game action is being performed.</p>
      </div>
    </main>
  );
}

function RootErrorState({ onRetry }: { readonly onRetry: () => void }) {
  return (
    <main className="root-state" aria-labelledby="error-title">
      <div className="state-card error-card" role="alert">
        <p className="eyebrow">Workspace unavailable</p>
        <h1 id="error-title">NoteQuest could not start</h1>
        <p>
          No progress was changed or reported as saved. Check browser storage access and try again.
        </p>
        <button type="button" onClick={onRetry}>
          Try again
        </button>
      </div>
    </main>
  );
}

function slotLabel(slot: SlotRecord): string {
  return slot.status === 'empty' ? 'Empty — ready for a future adventure' : 'Local data available';
}

function ApplicationShell({ composition }: { readonly composition: AppComposition }) {
  const [slots, setSlots] = useState<readonly SlotRecord[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const pwa = composition.pwa.getStatus();

  useEffect(() => {
    let active = true;
    void composition.services.saveSlots.list().then((result) => {
      if (!active) return;
      if (result.ok) setSlots(result.value);
      else setLoadFailed(true);
    });
    return () => {
      active = false;
    };
  }, [composition]);

  return (
    <div className="app-shell">
      <header className="shell-header">
        <div>
          <p className="eyebrow">Local-first workspace</p>
          <h1>NoteQuest</h1>
        </div>
        <div className="status-cluster" aria-label="Application status">
          <span>Save state: unchanged</span>
          <span>{pwa.offlineReady ? 'Offline support available' : 'Offline support pending'}</span>
          <span>{pwa.updateAvailable ? 'Update available' : 'App up to date'}</span>
        </div>
      </header>
      <div className="shell-layout">
        <main className="workspace" aria-labelledby="workspace-title">
          <p className="eyebrow">Primary workspace</p>
          <h2 id="workspace-title">Choose a local save slot</h2>
          <p className="intro">
            This shell is ready for later gameplay screens. Starting or continuing play is not part
            of this milestone.
          </p>
          {loadFailed ? (
            <p role="alert">Local slots could not be read. No progress was changed.</p>
          ) : null}
          {slots === null && !loadFailed ? <p role="status">Loading local slots…</p> : null}
          {slots !== null ? (
            <div className="slot-grid">
              {slots.map((slot) => (
                <article className="slot-card" key={slot.slotId}>
                  <h3>Slot {slot.slotIndex}</h3>
                  <p>{slotLabel(slot)}</p>
                  <button type="button" disabled>
                    Gameplay coming later
                  </button>
                </article>
              ))}
            </div>
          ) : null}
        </main>
        <aside className="context-panel" aria-labelledby="context-title">
          <p className="eyebrow">Contextual panel</p>
          <h2 id="context-title">Local data status</h2>
          <p>
            Shell initialization only reads or prepares local storage. It does not perform a
            mechanical action.
          </p>
        </aside>
      </div>
      <footer className="shell-footer">
        <span>Version {composition.version}</span>
        <span>Route: {composition.route.current()}</span>
      </footer>
    </div>
  );
}

export function App({ compose = createWebComposition }: AppProps) {
  const [attempt, setAttempt] = useState(0);
  const [composition, setComposition] = useState<AppComposition | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    let opened: AppComposition | null = null;
    void compose()
      .then((value) => {
        opened = value;
        if (active) setComposition(value);
        else value.close();
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
      opened?.close();
    };
  }, [attempt, compose]);

  const retry = () => {
    setComposition(null);
    setError(false);
    setAttempt((value) => value + 1);
  };
  if (error) return <RootErrorState onRetry={retry} />;
  if (composition === null) return <RootLoadingState />;
  return (
    <RootErrorBoundary onRetry={retry}>
      <ApplicationShell composition={composition} />
    </RootErrorBoundary>
  );
}
