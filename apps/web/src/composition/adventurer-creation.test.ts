// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  AdventurerCreationLoadResult,
  PreparedAdventurerCreation,
} from '@notequest/application';
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

  it('reconciles opaque production-port attempts and preserves ambiguous update safety', async () => {
    Object.defineProperty(navigator, 'storage', {
      configurable: true,
      value: { persisted: vi.fn().mockResolvedValue(true) },
    });
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
    let prepared: PreparedAdventurerCreation | undefined;
    let loaded: AdventurerCreationLoadResult = { kind: 'empty' };
    let marker: unknown;
    let observationFailure = false;
    let lookupFailure = false;
    let durableRevision = 1;
    const ids = Array.from({ length: 30 }, (_, index) => `composition-id-${index}`);
    const composition = await createWebComposition({
      newId: () => ids.shift()!,
      commit: async (action) => {
        prepared = action;
        return {
          ok: false,
          committed: 'unknown',
          retryable: false,
          message: 'Receipt lost.',
        };
      },
      observe: async () => {
        if (observationFailure) throw new Error('read failed');
        return { loaded, marker };
      },
      lookupDurableSlot: async (slotId) =>
        lookupFailure
          ? { ok: false, error: { code: 'read_failure', message: 'read failed' } }
          : {
              ok: true,
              value: {
                slotId,
                slotIndex: 1,
                displayName: 'Slot 1',
                revision: durableRevision,
                createdAt: '2026-01-01T00:00:00.000Z',
                updatedAt: '2026-01-01T00:00:00.000Z',
                status: durableRevision > 1 ? 'active' : 'ready',
                schemaVersion: 1,
                rulesVersion: 'notequest-palace-v0.1',
                contentVersion: 'authorized-notequest-adventurer-creation-v0.1',
                currentSnapshotId: 'snapshot',
                lastValidSnapshotId: 'snapshot',
                recoveryAvailable: true,
                integrityStatus: 'valid',
              },
            },
    });
    try {
      const port = composition.services.adventurerCreation!;
      const first = await port.create(NOTEQUEST_SLOT_IDS[1], 'Receipt Hero');
      expect(first).toMatchObject({ committed: 'unknown' });
      const firstToken = first.reconciliationToken!;
      expect(prepared).toBeDefined();
      const firstCommandId = prepared!.command.metadata.commandId;
      const committedResult = () => ({
        kind: 'committed' as const,
        result: {
          ok: true as const,
          committed: true as const,
          stateRevision: 1,
          state: prepared!.state,
          playerAuthoredName: prepared!.playerAuthoredName,
          evidence: prepared!.evidence,
          event: prepared!.event,
        },
      });

      loaded = committedResult();
      marker = { actionId: firstCommandId, stateRevision: 1 };
      lookupFailure = true;
      await expect(port.reconcile(firstToken)).resolves.toMatchObject({ committed: 'unknown' });
      expect(composition.services.updateSafety.getSnapshot()).toMatchObject({
        safePoint: 'saving',
      });
      lookupFailure = false;
      durableRevision = 5;
      await expect(port.reconcile(firstToken)).resolves.toMatchObject({ committed: true });
      expect(composition.services.updateSafety.getSnapshot()).toMatchObject({
        safePoint: 'durable',
        commandPending: false,
      });
      await expect(port.reconcile(firstToken)).resolves.toMatchObject({ committed: 'unknown' });

      const second = await port.create(NOTEQUEST_SLOT_IDS[1], 'Second Hero');
      const secondToken = second.reconciliationToken!;
      expect(prepared!.command.metadata.commandId).not.toBe(firstCommandId);
      loaded = { kind: 'empty' };
      marker = undefined;
      await expect(port.reconcile(secondToken)).resolves.toMatchObject({ committed: false });
      expect(composition.services.updateSafety.getSnapshot()).toMatchObject({
        safePoint: 'failed',
        commandPending: false,
      });
      await expect(port.reconcile(secondToken)).resolves.toMatchObject({ committed: 'unknown' });

      const third = await port.create(NOTEQUEST_SLOT_IDS[1], 'Third Hero');
      const thirdToken = third.reconciliationToken!;
      const thirdCommandId = prepared!.command.metadata.commandId;
      loaded = committedResult();
      for (const ambiguousMarker of [
        undefined,
        {},
        { actionId: 'different-action', stateRevision: 1 },
        { actionId: thirdCommandId, stateRevision: 99 },
      ]) {
        marker = ambiguousMarker;
        await expect(port.reconcile(thirdToken)).resolves.toMatchObject({ committed: 'unknown' });
        expect(composition.services.updateSafety.getSnapshot().safePoint).toBe('saving');
      }
      observationFailure = true;
      await expect(port.reconcile(thirdToken)).resolves.toMatchObject({ committed: 'unknown' });
      observationFailure = false;
      marker = { actionId: thirdCommandId, stateRevision: 1 };
      durableRevision = 1;
      await expect(port.reconcile(thirdToken)).resolves.toMatchObject({ committed: true });
    } finally {
      composition.close();
    }
  });
});
