// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { bundledContentStatus } from '@notequest/content';
import {
  authorizedNoteQuestAdventurerCreationTableIds,
  authorizedNoteQuestStartingState,
} from '@notequest/content';
import { NOTEQUEST_SLOT_IDS } from '@notequest/infrastructure';

import { classifyCreationReconciliationObservation, createWebComposition } from './index';

afterEach(() => vi.restoreAllMocks());

describe('production adventurer creation composition', () => {
  it('exposes governed content through a durable production creation port', async () => {
    Object.defineProperty(navigator, 'storage', {
      configurable: true,
      value: { persisted: vi.fn().mockResolvedValue(true) },
    });
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
    const composition = await createWebComposition();
    try {
      expect(bundledContentStatus).toBe('authorized-notequest-adventurer-creation-selected');
      const port = composition.services.adventurerCreation;
      expect(port).toBeDefined();
      const result = await port!.create(NOTEQUEST_SLOT_IDS[0], 'Local Hero');
      expect(result).toMatchObject({ ok: true, committed: true, playerAuthoredName: 'Local Hero' });
      if (!result.ok) throw new Error(result.message);
      expect(result.evidence.race.tableId).toBe(
        authorizedNoteQuestAdventurerCreationTableIds.races,
      );
      expect(result.evidence.adventurerClass.tableId).toBe(
        authorizedNoteQuestAdventurerCreationTableIds.classes,
      );
      expect(result.state).toMatchObject({
        usableArms: authorizedNoteQuestStartingState.usableArms,
        usableHands: authorizedNoteQuestStartingState.usableHands,
        torches: authorizedNoteQuestStartingState.torches,
        coins: authorizedNoteQuestStartingState.coins,
        status: authorizedNoteQuestStartingState.status,
        location: authorizedNoteQuestStartingState.location,
      });
      expect(result.state.equipment[0]?.damage).toMatchObject({ diceCount: 1, dieSides: 6 });
      expect(result.state.effects.map((effect) => effect.version)).toEqual(
        result.state.effects.map(() => result.state.contentVersion),
      );
      const loaded = await port!.loadCommitted(NOTEQUEST_SLOT_IDS[0]);
      expect(loaded).toMatchObject({
        kind: 'committed',
        result: { state: result.ok ? result.state : undefined },
      });
      if (loaded.kind !== 'committed' || loaded.result.event === undefined)
        throw new Error('Expected committed creation fixture.');
      const expected = {
        actionId: loaded.result.event.metadata.commandId,
        adventurerId: loaded.result.state.adventurerId,
      };
      expect(
        classifyCreationReconciliationObservation(
          { ...loaded, result: { ...loaded.result, stateRevision: 5 } },
          {
            actionId: expected.actionId,
            stateRevision: loaded.result.event.metadata.stateRevision,
          },
          expected,
        ),
      ).toBe('same-action');
      for (const marker of [
        undefined,
        null,
        {},
        { actionId: 'different-action', stateRevision: 1 },
        { actionId: expected.actionId, stateRevision: 99 },
      ]) {
        expect(classifyCreationReconciliationObservation(loaded, marker, expected)).toBe('unknown');
      }
      expect(
        classifyCreationReconciliationObservation({ kind: 'empty' }, undefined, expected),
      ).toBe('known-false');
      expect(
        classifyCreationReconciliationObservation(
          { kind: 'unavailable', message: 'read failed' },
          { actionId: expected.actionId, stateRevision: 1 },
          expected,
        ),
      ).toBe('unknown');
      expect(composition.services.updateSafety.getSnapshot()).toMatchObject({
        safePoint: 'durable',
        commandPending: false,
      });
    } finally {
      composition.close();
    }
  });
});
