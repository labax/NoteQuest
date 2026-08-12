// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generatePalaceDungeon } from '@notequest/domain';
import { projectPalaceMapSurfaces } from '@notequest/application';
import { describe, expect, it, vi } from 'vitest';
import { PalaceMap } from './palace-map';

function model() {
  const generated = generatePalaceDungeon('0x0000000000000001', {
    packageId: 'palace',
    contentVersion: '0.1.0',
    rulesVersion: 'digital-rules-specification-v0.1',
    entranceDefinitionId: 'palace.entrance.prototype',
    entranceConnectionCount: 2,
    validationEvidence: ['synthetic-test-evidence'],
  });
  if (!generated.ok) throw new Error(generated.error.message);
  return projectPalaceMapSurfaces(generated.dungeon);
}

describe('Palace map surfaces', () => {
  it('renders current position, connections, and actions visually', () => {
    render(<PalaceMap model={model().visual} onAction={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Current position: Entrance' })).toBeInTheDocument();
    expect(screen.getByLabelText('Palace floor 1 topology')).toHaveTextContent(
      'Exit 1: unresolved',
    );
    expect(screen.getAllByRole('button', { name: /Open exit/ })).toHaveLength(2);
  });

  it('switches to an equivalent semantic textual surface and dispatches the same action ID', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const surfaces = model();
    render(<PalaceMap model={surfaces.visual} onAction={onAction} />);
    await user.click(screen.getByRole('button', { name: 'Textual map' }));
    expect(screen.getByRole('heading', { name: 'Connections' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(surfaces.textual.connections.length);
    await user.click(screen.getByRole('button', { name: 'Open exit 1' }));
    expect(onAction).toHaveBeenCalledWith(surfaces.textual.actions[0]);
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
