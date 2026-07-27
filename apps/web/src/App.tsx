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
      return <RenderErrorState onRetry={this.props.onRetry} />;
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
        <p>The local workspace could not be checked. No game action was requested.</p>
        <button type="button" onClick={onRetry}>
          Try again
        </button>
      </div>
    </main>
  );
}

function RenderErrorState({ onRetry }: { readonly onRetry: () => void }) {
  return (
    <main className="root-state" aria-labelledby="render-error-title">
      <div className="state-card error-card" role="alert">
        <p className="eyebrow">Display unavailable</p>
        <h1 id="render-error-title">NoteQuest could not display this workspace</h1>
        <p>
          The application encountered an unexpected display error. Check the current data status
          after retrying.
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

function statusLabel(status: 'not-checked'): string {
  return status.replace('-', ' ');
}

function ApplicationShell({ composition }: { readonly composition: AppComposition }) {
  const [slotRequest, setSlotRequest] = useState<
    | { readonly status: 'loading' }
    | { readonly status: 'failed' }
    | { readonly status: 'ready'; readonly slots: readonly SlotRecord[] }
  >({ status: 'loading' });
  const [slotRequestAttempt, setSlotRequestAttempt] = useState(0);
  const pwa = composition.pwa.getStatus();

  useEffect(() => {
    let active = true;
    void composition.services.saveSlots
      .list()
      .then((result) => {
        if (!active) return;
        setSlotRequest(result.ok ? { status: 'ready', slots: result.value } : { status: 'failed' });
      })
      .catch(() => {
        if (active) setSlotRequest({ status: 'failed' });
      });
    return () => {
      active = false;
    };
  }, [composition, slotRequestAttempt]);

  const retrySlots = () => {
    setSlotRequest({ status: 'loading' });
    setSlotRequestAttempt((value) => value + 1);
  };

  return (
    <div className="app-shell">
      <header className="shell-header">
        <div>
          <p className="eyebrow">Local-first workspace</p>
          <h1>NoteQuest</h1>
        </div>
        <div className="status-cluster" aria-label="Application status">
          <span>Save status: not checked</span>
          <span>Offline readiness: {statusLabel(pwa.offlineReadiness)}</span>
          <span>Updates: {statusLabel(pwa.updateStatus)}</span>
          <span>Service workers: {pwa.serviceWorkerSupport}</span>
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
          {slotRequest.status === 'failed' ? (
            <div className="inline-error" role="alert">
              <p>Local slots could not be read.</p>
              <button type="button" onClick={retrySlots}>
                Retry local slots
              </button>
            </div>
          ) : null}
          {slotRequest.status === 'loading' ? <p role="status">Loading local slots…</p> : null}
          {slotRequest.status === 'ready' ? (
            <div className="slot-grid">
              {slotRequest.slots.map((slot) => (
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
