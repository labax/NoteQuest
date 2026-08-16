import { useId, useRef, useState, type RefObject } from 'react';
import type { PalaceMapSurface } from '@notequest/application';

export interface PalaceMapProps {
  readonly model: PalaceMapSurface;
  readonly initialView?: 'visual' | 'textual';
  readonly onAction?: (action: PalaceMapSurface['actions'][number]) => void;
  readonly outcome?: string;
}

export function PalaceMap({ model, initialView = 'visual', onAction, outcome }: PalaceMapProps) {
  const [view, setView] = useState(initialView);
  const headingId = useId();
  const currentHeading = useRef<HTMLHeadingElement>(null);
  const current = model.segments.find((segment) => segment.segmentId === model.currentSegmentId);
  if (current === undefined) {
    return <p role="alert">The committed map has no valid current position.</p>;
  }

  const selectView = (next: 'visual' | 'textual') => {
    setView(next);
    requestAnimationFrame(() => currentHeading.current?.focus());
  };
  return (
    <section className="palace-map" aria-labelledby={headingId}>
      <h2 id={headingId}>Palace map</h2>
      <div className="map-switch" role="group" aria-label="Map view">
        <button type="button" aria-pressed={view === 'visual'} onClick={() => selectView('visual')}>
          Visual map
        </button>
        <button
          type="button"
          aria-pressed={view === 'textual'}
          onClick={() => selectView('textual')}
        >
          Textual map
        </button>
      </div>
      {view === 'visual' ? (
        <VisualPalaceMap model={model} currentHeading={currentHeading} onAction={onAction} />
      ) : (
        <TextualPalaceMap model={model} currentHeading={currentHeading} onAction={onAction} />
      )}
      {outcome ? <p role="status">{outcome}</p> : null}
    </section>
  );
}

interface SurfaceProps {
  readonly model: PalaceMapSurface;
  readonly currentHeading: RefObject<HTMLHeadingElement | null>;
  readonly onAction?: PalaceMapProps['onAction'];
}

function CurrentPosition({ model, currentHeading }: SurfaceProps) {
  const current = model.segments.find((segment) => segment.segmentId === model.currentSegmentId)!;
  return (
    <div className="map-current-position">
      <h3 ref={currentHeading} tabIndex={-1}>
        Current position: Entrance
      </h3>
      <dl>
        <div>
          <dt>Floor</dt>
          <dd>{current.floor}</dd>
        </div>
        <div>
          <dt>Encounter</dt>
          <dd>{current.encounter.state}</dd>
        </div>
        <div>
          <dt>Route to entrance</dt>
          <dd>Current segment</dd>
        </div>
      </dl>
    </div>
  );
}

function ActionList({ model, onAction }: Pick<SurfaceProps, 'model' | 'onAction'>) {
  return (
    <section aria-label="Available map actions">
      <h3>Connection actions</h3>
      <div className="map-actions">
        {model.actions.map((action, index) => {
          const explanationId = `palace-action-${action.connectionId}`;
          return (
            <div key={`${action.id}-${action.connectionId}`}>
              <button
                type="button"
                disabled={!action.enabled}
                aria-describedby={!action.enabled && action.explanation ? explanationId : undefined}
                onClick={() => onAction?.(action)}
              >
                {action.id === 'move'
                  ? 'Move through'
                  : action.id === 'break-door'
                    ? 'Break'
                    : 'Open'}{' '}
                exit {index + 1}
              </button>
              {!action.enabled && action.explanation ? (
                <p id={explanationId}>{action.explanation}</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function VisualPalaceMap({ model, currentHeading, onAction }: SurfaceProps) {
  return (
    <div className="visual-map-surface" data-map-view="visual">
      <CurrentPosition model={model} currentHeading={currentHeading} />
      <div className="map-diagram" aria-label="Palace floor 1 topology">
        <div className="map-node map-node-current" aria-current="location">
          Entrance
        </div>
        {model.connections.map((connection) => (
          <div className="map-node map-node-unresolved" key={connection.connectionId}>
            <span aria-hidden="true">↔ </span>
            {connection.directionLabel}: unresolved
          </div>
        ))}
      </div>
      <ActionList model={model} onAction={onAction} />
    </div>
  );
}

export function TextualPalaceMap({ model, currentHeading, onAction }: SurfaceProps) {
  return (
    <div className="textual-map-surface" data-map-view="textual">
      <CurrentPosition model={model} currentHeading={currentHeading} />
      <section aria-labelledby="connection-heading">
        <h3 id="connection-heading">Connections</h3>
        <ul>
          {model.connections.map((connection) => (
            <li key={connection.connectionId}>
              {connection.directionLabel} — unresolved connection from the current segment
            </li>
          ))}
        </ul>
      </section>
      <ActionList model={model} onAction={onAction} />
    </div>
  );
}
