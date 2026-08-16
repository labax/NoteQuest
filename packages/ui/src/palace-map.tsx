import { useId, useRef, useState, type RefObject } from 'react';
import type { PalaceMapSurface } from '@notequest/application';

export interface PalaceMapProps {
  readonly model: PalaceMapSurface;
  readonly initialView?: 'visual' | 'textual';
}

export function PalaceMap({ model, initialView = 'visual' }: PalaceMapProps) {
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
        <VisualPalaceMap model={model} currentHeading={currentHeading} />
      ) : (
        <TextualPalaceMap model={model} currentHeading={currentHeading} />
      )}
    </section>
  );
}

interface SurfaceProps {
  readonly model: PalaceMapSurface;
  readonly currentHeading: RefObject<HTMLHeadingElement | null>;
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

function ActionList({ model }: Pick<SurfaceProps, 'model'>) {
  return (
    <section aria-label="Available map actions">
      <h3>Connection actions</h3>
      <p>Exploration is not available yet. The connections below are saved topology only.</p>
      <div className="map-actions">
        {model.actions.map((action, index) => (
          <button key={action.connectionId} type="button" disabled>
            Open exit {index + 1}
          </button>
        ))}
      </div>
    </section>
  );
}

export function VisualPalaceMap({ model, currentHeading }: SurfaceProps) {
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
      <ActionList model={model} />
    </div>
  );
}

export function TextualPalaceMap({ model, currentHeading }: SurfaceProps) {
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
      <ActionList model={model} />
    </div>
  );
}
