// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type {
  AdventurerCreationCommitResult,
  AdventurerCreationLoadResult,
} from '@notequest/application';

import { AdventurerCreation, type AdventurerCreationUiPort } from './adventurer-creation';

const committed = {
  ok: true,
  committed: true,
  stateRevision: 1,
  playerAuthoredName: 'Local Hero',
  state: {
    adventurerId: 'adventurer.fixture',
    raceId: 'fixture.race',
    classId: 'fixture.class',
    maxHp: 18,
    currentHp: 18,
    usableArms: 2,
    usableHands: 2,
    torches: 10,
    coins: 0,
    status: 'alive',
    location: 'town',
    backpackItemIds: [],
    armourItemIds: [],
    death: null,
    equipment: [
      {
        itemId: 'item.fixture',
        definitionId: 'fixture.weapon',
        label: 'Fixture blade',
        equipped: true,
        hands: 1,
        damage: { diceCount: 1, dieSides: 6, modifier: 0, damageType: 'physical' },
      },
    ],
    spellCharges: [],
    effectIds: [],
    effects: [],
    rulesVersion: 'rules.fixture',
    contentVersion: 'content.fixture',
  },
  evidence: {
    race: {
      rollResultId: 'roll.race',
      streamId: 'stream.fixture',
      naturalDice: [3, 4],
      finalValue: 7,
      tableId: 'fixture.races',
      rowId: 'fixture.race',
      manualEntry: false,
      resultId: 'fixture.race',
      resultLabel: 'Fixture folk',
    },
    adventurerClass: {
      rollResultId: 'roll.class',
      streamId: 'stream.fixture',
      naturalDice: [2, 5],
      finalValue: 7,
      tableId: 'fixture.classes',
      rowId: 'fixture.class',
      manualEntry: false,
      resultId: 'fixture.class',
      resultLabel: 'Fixture keeper',
    },
    spells: [],
    derivedMaxHp: 18,
    rulesVersion: 'rules.fixture',
    contentVersion: 'content.fixture',
  },
} as unknown as Extract<AdventurerCreationCommitResult, { ok: true }>;

function port(overrides: Partial<AdventurerCreationUiPort> = {}): AdventurerCreationUiPort {
  return {
    loadCommitted: vi.fn().mockResolvedValue({ kind: 'empty' }),
    create: vi.fn().mockResolvedValue(committed),
    ...overrides,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe('AdventurerCreation', () => {
  it('renders loading, entry, local-name guidance, validation, and cancellation states', async () => {
    const loading = deferred<AdventurerCreationLoadResult>();
    const onCancel = vi.fn();
    render(
      <AdventurerCreation
        slotId="slot.fixture"
        port={port({ loadCommitted: () => loading.promise })}
        onCancel={onCancel}
        onContinue={vi.fn()}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Checking this slot');
    loading.resolve({ kind: 'empty' });
    const input = await screen.findByRole('textbox', { name: 'Adventurer name' });
    await waitFor(() => expect(input).toHaveFocus());
    expect(screen.getByText(/private to this local save/i)).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Create and save adventurer' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter an adventurer name');
    expect(screen.getByRole('alert')).toHaveFocus();
    await userEvent.click(screen.getByRole('button', { name: 'Back to save slots' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('submits with the keyboard and renders a non-editable committing state', async () => {
    const saving = deferred<AdventurerCreationCommitResult>();
    const create = vi.fn(() => saving.promise);
    render(
      <AdventurerCreation
        slotId="slot.fixture"
        port={port({ create })}
        onCancel={vi.fn()}
        onContinue={vi.fn()}
      />,
    );
    const input = await screen.findByRole('textbox', { name: 'Adventurer name' });
    await userEvent.type(input, '  Local Hero{Enter}');
    expect(create).toHaveBeenCalledWith('slot.fixture', 'Local Hero');
    expect(screen.getByRole('status')).toHaveTextContent('Committing the complete adventurer');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    saving.resolve(committed);
    const committedHeading = await screen.findByRole('heading', { name: 'Local Hero' });
    await waitFor(() => expect(committedHeading).toHaveFocus());
  });

  it('renders the application Unicode boundary error without calling creation', async () => {
    const create = vi.fn();
    render(
      <AdventurerCreation
        slotId="slot.fixture"
        port={port({ create })}
        onCancel={vi.fn()}
        onContinue={vi.fn()}
      />,
    );
    const input = await screen.findByRole('textbox', { name: 'Adventurer name' });
    await userEvent.type(input, '🙂'.repeat(41));
    await userEvent.click(screen.getByRole('button', { name: 'Create and save adventurer' }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Use 40 or fewer characters for the adventurer name',
    );
    expect(create).not.toHaveBeenCalled();
  });

  it('suppresses duplicate submissions while the durable commit is pending', async () => {
    const saving = deferred<AdventurerCreationCommitResult>();
    const create = vi.fn(() => saving.promise);
    render(
      <AdventurerCreation
        slotId="slot.fixture"
        port={port({ create })}
        onCancel={vi.fn()}
        onContinue={vi.fn()}
      />,
    );
    const input = await screen.findByRole('textbox', { name: 'Adventurer name' });
    await userEvent.type(input, 'Local Hero');
    const form = input.closest('form');
    if (form === null) throw new Error('Creation form was not rendered.');
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(create).toHaveBeenCalledOnce();
    saving.resolve(committed);
    await screen.findByRole('heading', { name: 'Local Hero' });
  });

  it('shows authoritative committed state and roll evidence without a reroll action', async () => {
    const onContinue = vi.fn();
    render(
      <AdventurerCreation
        slotId="slot.fixture"
        port={port({
          loadCommitted: vi.fn().mockResolvedValue({ kind: 'committed', result: committed }),
        })}
        onCancel={vi.fn()}
        onContinue={onContinue}
      />,
    );
    expect(
      await screen.findByText(
        'Creation is saved. These results are committed and cannot be rerolled here.',
      ),
    ).toBeVisible();
    expect(screen.getAllByText('Fixture folk')).toHaveLength(2);
    expect(screen.getByText('3 + 4 = 7')).toBeVisible();
    expect(screen.getByText('Fixture blade (1d6, 1 hand)')).toBeVisible();
    expect(screen.getByText('Starting effects')).toBeVisible();
    expect(screen.getByText('Spell charges')).toBeVisible();
    expect(screen.queryByRole('button', { name: /reroll/i })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Continue to town' }));
    expect(onContinue).toHaveBeenCalledOnce();
  });

  it('reports a truthful save failure and retries from the entered local name', async () => {
    const create = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        committed: false,
        retryable: true,
        message: 'The creation transaction failed; nothing was saved.',
      })
      .mockResolvedValueOnce(committed);
    render(
      <AdventurerCreation
        slotId="slot.fixture"
        port={port({ create })}
        onCancel={vi.fn()}
        onContinue={vi.fn()}
      />,
    );
    const input = await screen.findByRole('textbox', { name: 'Adventurer name' });
    await userEvent.type(input, 'Local Hero');
    await userEvent.click(screen.getByRole('button', { name: 'Create and save adventurer' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('nothing was saved');
    expect(input).toHaveValue('Local Hero');
    await userEvent.click(screen.getByRole('button', { name: 'Create and save adventurer' }));
    expect(await screen.findByRole('heading', { name: 'Local Hero' })).toBeVisible();
    expect(create).toHaveBeenCalledTimes(2);
  });

  it('shows a reload failure without claiming committed state', async () => {
    render(
      <AdventurerCreation
        slotId="slot.fixture"
        port={port({ loadCommitted: vi.fn().mockRejectedValue(new Error('read failed')) })}
        onCancel={vi.fn()}
        onContinue={vi.fn()}
      />,
    );
    expect(await screen.findByRole('alert')).toHaveTextContent('could not be checked');
    expect(screen.queryByText('Creation is saved.')).not.toBeInTheDocument();
  });

  it('keeps an ambiguous commit neutral and allows only authoritative recheck', async () => {
    const loadCommitted = vi
      .fn()
      .mockResolvedValueOnce({ kind: 'empty' })
      .mockResolvedValueOnce({ kind: 'committed', result: committed });
    render(
      <AdventurerCreation
        slotId="slot.fixture"
        port={port({ loadCommitted, create: vi.fn().mockRejectedValue(new Error('receipt lost')) })}
        onCancel={vi.fn()}
        onContinue={vi.fn()}
      />,
    );
    await userEvent.type(await screen.findByRole('textbox'), 'Local Hero');
    await userEvent.click(screen.getByRole('button', { name: 'Create and save adventurer' }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('save status could not be confirmed');
    expect(alert).toHaveFocus();
    expect(
      screen.queryByRole('button', { name: 'Create and save adventurer' }),
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Recheck save status' }));
    expect(await screen.findByRole('heading', { name: 'Local Hero' })).toBeVisible();
  });
});
