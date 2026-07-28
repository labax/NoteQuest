import { Component, type ErrorInfo, type ReactNode, useEffect, useRef, useState } from 'react';
import { describeSaveSlotCapability, type SlotRecord } from '@notequest/application';
import { routeMetadata, shellDestinations, type RouteState } from '@notequest/ui';
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

function statusLabel(status: 'not-checked'): string {
  return status.replace('-', ' ');
}

function recorded(value: string | null): string {
  return value ?? 'Not recorded';
}

function SlotMetadata({ slot }: { readonly slot: SlotRecord }) {
  return (
    <dl className="slot-metadata">
      <div>
        <dt>Last updated</dt>
        <dd>
          <time dateTime={slot.updatedAt}>{slot.updatedAt || 'Unknown'}</time>
        </dd>
      </div>
      <div>
        <dt>Rules version</dt>
        <dd>{recorded(slot.rulesVersion)}</dd>
      </div>
      <div>
        <dt>Content version</dt>
        <dd>{recorded(slot.contentVersion)}</dd>
      </div>
    </dl>
  );
}

function DataSlotReview({
  slot,
  composition,
}: {
  readonly slot: SlotRecord;
  readonly composition: AppComposition;
}) {
  const capability = describeSaveSlotCapability(
    slot,
    composition.services.saveSlotOperations.get(slot.slotId),
  );
  return (
    <section className="slot-review" aria-labelledby="slot-review-title">
      <p className="eyebrow">Selected local slot</p>
      <h3 id="slot-review-title">
        Slot {slot.slotIndex}: {slot.displayName}
      </h3>
      <p>
        <strong>State:</strong> <span aria-label="Capability state">{capability.state}</span>
      </p>
      <p>{capability.summary}</p>
      <p>
        <strong>Recovery:</strong>{' '}
        {capability.recoveryAvailable
          ? 'Last-known-valid data is available.'
          : 'No recovery snapshot is recorded.'}
      </p>
      <p role="status">
        No reset or data mutation occurred. This view only explains the selected slot.
      </p>
      <SlotMetadata slot={slot} />
    </section>
  );
}

function ApplicationShell({ composition }: { readonly composition: AppComposition }) {
  const [route, setRoute] = useState<RouteState>(() => composition.route.current());
  const destinationHeading = useRef<HTMLHeadingElement>(null);
  const [slotRequest, setSlotRequest] = useState<
    | { readonly status: 'loading' }
    | { readonly status: 'failed' }
    | { readonly status: 'ready'; readonly slots: readonly SlotRecord[] }
  >({ status: 'loading' });
  const [slotRequestAttempt, setSlotRequestAttempt] = useState(0);
  const pwa = composition.pwa.getStatus();

  useEffect(() => composition.route.subscribe(setRoute), [composition]);

  useEffect(() => {
    document.title = route.metadata.title;
    destinationHeading.current?.focus();
  }, [route]);

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

  const chooseSlot = async (slot: SlotRecord) => {
    const capability = describeSaveSlotCapability(
      slot,
      composition.services.saveSlotOperations.get(slot.slotId),
    );
    if (!capability.usable) {
      composition.route.navigate({ destination: 'data', slotId: slot.slotId });
      return;
    }
    const listedSlots = slotRequest.status === 'ready' ? slotRequest.slots : [];
    setSlotRequest({ status: 'loading' });
    const selected = await composition.services.saveSlots.select(slot.slotId).catch(() => null);
    if (selected === null || !selected.ok) {
      setSlotRequest({ status: 'failed' });
      return;
    }
    const selectedCapability = describeSaveSlotCapability(
      selected.value.slot,
      composition.services.saveSlotOperations.get(slot.slotId),
    );
    if (!selectedCapability.usable) {
      setSlotRequest({
        status: 'ready',
        slots: listedSlots.map((listed) =>
          listed.slotId === slot.slotId ? selected.value.slot : listed,
        ),
      });
      composition.route.navigate({ destination: 'data', slotId: slot.slotId });
      return;
    }
    composition.route.navigate({
      destination: selectedCapability.destination,
      slotId: slot.slotId,
    });
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
        <nav
          className="destination-nav"
          aria-label="Primary destinations"
          aria-describedby={route.slotId === undefined ? 'guarded-navigation-help' : undefined}
        >
          {shellDestinations
            .filter((destination) => routeMetadata[destination].showInNavigation)
            .map((destination) => {
              const metadata = routeMetadata[destination];
              const unavailable = metadata.requiresSelectedSlot && route.slotId === undefined;
              return (
                <button
                  type="button"
                  key={destination}
                  aria-current={route.destination === destination ? 'page' : undefined}
                  disabled={unavailable}
                  aria-describedby={unavailable ? 'guarded-navigation-help' : undefined}
                  onClick={() =>
                    composition.route.navigate({
                      destination,
                      ...(route.slotId === undefined ? {} : { slotId: route.slotId }),
                    })
                  }
                >
                  {metadata.heading}
                </button>
              );
            })}
        </nav>
        {route.slotId === undefined ? (
          <p className="navigation-help" id="guarded-navigation-help">
            Select an available save slot to open Town, Expedition, Inventory, History, or
            Graveyard. Data and About remain available without a selected slot.
          </p>
        ) : null}
        <main className="workspace" aria-labelledby="workspace-title">
          <p className="eyebrow">Primary workspace</p>
          <h2 id="workspace-title" ref={destinationHeading} tabIndex={-1}>
            {route.metadata.heading}
          </h2>
          {route.fallback !== null ? (
            <div className="route-notice" role="status">
              {route.fallback === 'unknown-route'
                ? 'That page is not available. You are back at the save slots.'
                : route.fallback === 'invalid-context'
                  ? 'That save slot is not available. Choose an available save slot to continue.'
                  : 'Select a save slot before opening that destination.'}
            </div>
          ) : null}
          <p className="intro">
            {route.destination === 'save-slots'
              ? 'Choose one of three independent local workspaces. Your data stays in this browser unless you deliberately export it.'
              : 'This destination is represented in the shell. Its gameplay features are not available yet.'}
          </p>
          {slotRequest.status === 'failed' ? (
            <div className="inline-error" role="alert">
              <p>Local slots could not be read.</p>
              <button type="button" onClick={retrySlots}>
                Retry local slots
              </button>
            </div>
          ) : null}
          {route.destination === 'save-slots' && slotRequest.status === 'loading' ? (
            <div className="slot-grid" role="status" aria-label="Loading local slots">
              {[1, 2, 3].map((index) => (
                <article className="slot-card slot-skeleton" key={index} aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </article>
              ))}
              <span className="visually-hidden">Loading local slots…</span>
            </div>
          ) : null}
          {route.destination === 'save-slots' && slotRequest.status === 'ready' ? (
            <div className="slot-grid">
              {slotRequest.slots.map((slot) => {
                const capability = describeSaveSlotCapability(
                  slot,
                  composition.services.saveSlotOperations.get(slot.slotId),
                );
                return (
                  <article className={`slot-card slot-${capability.state}`} key={slot.slotId}>
                    <div className="slot-heading">
                      <h3>Slot {slot.slotIndex}</h3>
                      <span className="state-badge">{capability.state}</span>
                    </div>
                    <p className="slot-name">{slot.displayName}</p>
                    <p>{capability.summary}</p>
                    <SlotMetadata slot={slot} />
                    {capability.recoveryAvailable ? (
                      <p>Last-known-valid data is available.</p>
                    ) : null}
                    <button type="button" onClick={() => void chooseSlot(slot)}>
                      {capability.actionLabel}
                    </button>
                  </article>
                );
              })}
            </div>
          ) : null}
          {route.destination === 'data' &&
          route.slotId !== undefined &&
          slotRequest.status === 'ready'
            ? (() => {
                const slot = slotRequest.slots.find(
                  (candidate) => candidate.slotId === route.slotId,
                );
                return slot === undefined ? null : (
                  <DataSlotReview slot={slot} composition={composition} />
                );
              })()
            : null}
          {route.destination === 'save-slots' ? (
            <section className="local-guidance" aria-labelledby="local-guidance-title">
              <h3 id="local-guidance-title">Local data and safety</h3>
              <p>
                Browser storage is local to this browser profile. Clearing site data can remove all
                three slots.
              </p>
              <button
                type="button"
                onClick={() => composition.route.navigate({ destination: 'data' })}
              >
                Learn about local storage
              </button>
            </section>
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
        <span>Destination: {route.metadata.heading}</span>
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
