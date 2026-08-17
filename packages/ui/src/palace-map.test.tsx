// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generatePalaceDungeon } from '@notequest/domain';
import { projectPalaceMapSurfaces } from '@notequest/application';
import { describe, expect, it } from 'vitest';
import { PalaceMap } from './palace-map';

function model() {
  const generated = generatePalaceDungeon('0x0000000000000001', {
    packageId: 'palace',
    contentVersion: '0.1.0',
    rulesVersion: 'digital-rules-specification-v0.1',
    entranceDefinitionId: 'palace.entrance.prototype',
    entranceConnections: [
      {
        definitionId: 'palace.fixture.connection-a',
        directionLabel: 'Exit A',
        generationOriginCategory: 'room',
        connectionState: 'unresolved',
        doorState: 'unknown',
        alertState: 'quiet',
      },
      {
        definitionId: 'palace.fixture.connection-b',
        directionLabel: 'Exit B',
        generationOriginCategory: 'staircase',
        connectionState: 'unresolved',
        doorState: 'unknown',
        alertState: 'quiet',
      },
    ],
    validationEvidence: ['synthetic-test-evidence'],
  });
  if (!generated.ok) throw new Error(generated.error.message);
  return projectPalaceMapSurfaces(generated.dungeon);
}

describe('Palace map surfaces', () => {
  it('renders current position, connections, and actions visually', () => {
    render(<PalaceMap model={model().visual} />);
    expect(screen.getByRole('heading', { name: 'Current position: Entrance' })).toBeInTheDocument();
    expect(screen.getByLabelText('Palace floor 1 topology')).toHaveTextContent(
      'Exit A: unresolved',
    );
    expect(screen.getAllByRole('button', { name: /Open exit/ })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: /Open exit/ })).toSatisfy((buttons) =>
      buttons.every((button: HTMLButtonElement) => button.disabled),
    );
    expect(screen.getByText(/Exploration is not available yet/)).toBeInTheDocument();
  });

  it('switches to an equivalent semantic textual surface and dispatches the same action ID', async () => {
    const user = userEvent.setup();
    const surfaces = model();
    render(<PalaceMap model={surfaces.visual} />);
    await user.click(screen.getByRole('button', { name: 'Textual map' }));
    expect(screen.getByRole('heading', { name: 'Connections' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(surfaces.textual.connections.length);
    expect(screen.getAllByRole('button', { name: /Open exit/ })).toSatisfy((buttons) =>
      buttons.every((button: HTMLButtonElement) => button.disabled),
    );
  });

  it('keeps visual and textual required-information/action signatures equal', () => {
    const surfaces = model();
    const signature = (surface: typeof surfaces.visual) => ({
      currentSegmentId: surface.currentSegmentId,
      segmentIds: surface.segments.map((segment) => segment.segmentId),
      connectionIds: surface.connections.map((connection) => connection.connectionId),
      actions: surface.actions,
    });
    expect(signature(surfaces.visual)).toEqual(signature(surfaces.textual));
  });
});
