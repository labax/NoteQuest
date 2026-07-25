import { describe, expect, it } from 'vitest';

import type { IdempotencyKey, SaveSlotId } from '@notequest/domain';

import type {
  ActionCommitEnvelope,
  ActionCommitResult,
  ActionTransactionCoordinator,
} from './action-commit.ts';
import { PerSlotActionCommitQueue } from './action-commit-queue.ts';

const slotOne = '00000000-0000-4000-8000-000000000001' as SaveSlotId;
const slotTwo = '00000000-0000-4000-8000-000000000002' as SaveSlotId;

function envelope(slotId: SaveSlotId, actionId: string): ActionCommitEnvelope {
  return {
    actionId,
    slotId,
    idempotencyKey: `${actionId}.token` as IdempotencyKey,
    expectedRevision: 0,
    stateRecords: [],
    events: [],
  };
}

function success(actionId: string): ActionCommitResult {
  return {
    ok: true,
    actionId,
    committed: true,
    duplicate: false,
    stateRevision: 1,
    written: {
      stateRecords: 0,
      events: 0,
      randomStreamRecords: 0,
      randomResultRecords: 0,
      slotMetadata: 0,
      recoverySnapshots: 0,
      recoveryWorkspaceEntries: 0,
      idempotencyMarkers: 1,
    },
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((complete) => {
    resolve = complete;
  });
  return { promise, resolve };
}

describe('PerSlotActionCommitQueue', () => {
  it('starts overlapping commits for one slot strictly in submission order', async () => {
    const first = deferred<ActionCommitResult>();
    const calls: string[] = [];
    const downstream: ActionTransactionCoordinator = {
      commit: (submitted) => {
        calls.push(submitted.actionId);
        return submitted.actionId === 'first' ? first.promise : Promise.resolve(success('second'));
      },
    };
    const queue = new PerSlotActionCommitQueue(downstream);

    const firstResult = queue.commit(envelope(slotOne, 'first'));
    const secondResult = queue.commit(envelope(slotOne, 'second'));
    await Promise.resolve();
    expect(calls).toEqual(['first']);

    first.resolve(success('first'));
    await expect(firstResult).resolves.toMatchObject({ ok: true, actionId: 'first' });
    await expect(secondResult).resolves.toMatchObject({ ok: true, actionId: 'second' });
    expect(calls).toEqual(['first', 'second']);
  });

  it('does not make a different slot wait behind a pending commit', async () => {
    const first = deferred<ActionCommitResult>();
    const calls: string[] = [];
    const downstream: ActionTransactionCoordinator = {
      commit: (submitted) => {
        calls.push(submitted.actionId);
        return submitted.slotId === slotOne
          ? first.promise
          : Promise.resolve(success(submitted.actionId));
      },
    };
    const queue = new PerSlotActionCommitQueue(downstream);

    const pending = queue.commit(envelope(slotOne, 'slot-one'));
    const independent = queue.commit(envelope(slotTwo, 'slot-two'));
    await expect(independent).resolves.toMatchObject({ ok: true, actionId: 'slot-two' });
    expect(calls).toEqual(['slot-one', 'slot-two']);

    first.resolve(success('slot-one'));
    await expect(pending).resolves.toMatchObject({ ok: true, actionId: 'slot-one' });
  });

  it('continues a slot queue after an unexpected downstream rejection', async () => {
    const downstream: ActionTransactionCoordinator = {
      commit: (submitted) =>
        submitted.actionId === 'rejected'
          ? Promise.reject(new Error('synthetic rejection'))
          : Promise.resolve(success(submitted.actionId)),
    };
    const queue = new PerSlotActionCommitQueue(downstream);

    const rejected = queue.commit(envelope(slotOne, 'rejected'));
    const recovered = queue.commit(envelope(slotOne, 'recovered'));
    await expect(rejected).rejects.toThrow('synthetic rejection');
    await expect(recovered).resolves.toMatchObject({ ok: true, actionId: 'recovered' });
  });
});
