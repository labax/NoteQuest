import {
  resolvePalaceExplorationAction,
  type IdempotencyKey,
  type PalaceExplorationCommand,
  type PalaceExplorationResult,
  type PalaceExplorationState,
  type SaveSlotId,
} from '@notequest/domain';
import type { ActionTransactionCoordinator } from './action-commit.ts';
import type { EventRecord, PersistedRecord, SlotRecord, SnapshotRecord } from './repositories.ts';

export interface CommitPalaceExplorationCommand {
  readonly actionId: string;
  readonly eventId: string;
  readonly resultIds: readonly string[];
  readonly idempotencyKey: IdempotencyKey;
  readonly slotId: SaveSlotId;
  readonly dungeonId: string;
  readonly expeditionId: string;
  readonly adventurerId: string;
  readonly expectedRevision: number;
  readonly rulesVersion: string;
  readonly contentVersion: string;
  readonly generationVersion: string;
  readonly action: PalaceExplorationCommand;
}

export interface PalaceExplorationCommitDependencies {
  readonly coordinator: ActionTransactionCoordinator;
  readonly now: () => string;
  readonly load: (slotId: SaveSlotId) => Promise<{
    readonly slot: SlotRecord;
    readonly state: PalaceExplorationState;
    readonly nextEventSequence: number;
    readonly cumulativeSnapshot: SnapshotRecord;
  } | null>;
}

export type CommitPalaceExplorationResult =
  | PalaceExplorationResult
  | {
      readonly ok: false;
      readonly code: 'not-found' | 'identity-mismatch' | 'commit-failed';
      readonly explanation: string;
    };

/** The application command is the sole state-changing exploration path. */
export async function commitPalaceExplorationAction(
  command: CommitPalaceExplorationCommand,
  dependencies: PalaceExplorationCommitDependencies,
): Promise<CommitPalaceExplorationResult> {
  const loaded = await dependencies.load(command.slotId);
  if (!loaded)
    return {
      ok: false,
      code: 'not-found',
      explanation: 'No current Palace expedition was found for this slot.',
    };
  const { state, slot } = loaded;
  if (
    state.dungeonId !== command.dungeonId ||
    state.expeditionId !== command.expeditionId ||
    state.adventurerId !== command.adventurerId ||
    state.rulesVersion !== command.rulesVersion ||
    state.contentVersion !== command.contentVersion ||
    state.generationVersion !== command.generationVersion
  )
    return {
      ok: false,
      code: 'identity-mismatch',
      explanation: 'The command does not identify the committed Palace run.',
    };

  const resolved = resolvePalaceExplorationAction(state, command.action, command.expectedRevision);
  if (!resolved.ok) return resolved;
  if (command.resultIds.length !== resolved.randomEvidence.length)
    return {
      ok: false,
      code: 'identity-mismatch',
      explanation: 'Random-result identities do not match the resolved action.',
    };

  const timestamp = dependencies.now();
  const stateRecord: PersistedRecord = {
    slotId: command.slotId,
    recordType: 'palace-exploration-state',
    recordId: state.dungeonId,
    dungeonId: state.dungeonId,
    expeditionId: state.expeditionId,
    updatedAt: timestamp,
    body: resolved.state,
  };
  const resultRecords: PersistedRecord[] = resolved.randomEvidence.map((evidence, index) => ({
    slotId: command.slotId,
    recordType: 'random-result',
    recordId: command.resultIds[index]!,
    dungeonId: state.dungeonId,
    expeditionId: state.expeditionId,
    updatedAt: timestamp,
    body: { resultId: command.resultIds[index], actionId: command.actionId, ...evidence },
  }));
  const event: EventRecord = {
    slotId: command.slotId,
    sequence: loaded.nextEventSequence,
    timestamp,
    eventType: `palace.exploration.${command.action.kind}`,
    dungeonId: state.dungeonId,
    expeditionId: state.expeditionId,
    aggregateType: 'palace-exploration',
    aggregateId: command.eventId,
    retentionClass: 'canonical-history',
    body: {
      eventId: command.eventId,
      actionId: command.actionId,
      target:
        'connectionId' in command.action ? command.action.connectionId : state.currentSegmentId,
      preRevision: state.revision,
      commitRevision: resolved.state.revision,
      ruleIds: resolved.ruleIds,
      resultIds: command.resultIds,
      light: {
        before: {
          physical: state.physicalLight,
          virtual: state.virtualLight,
          charges: state.lightCharges,
        },
        after: {
          physical: resolved.state.physicalLight,
          virtual: resolved.state.virtualLight,
          charges: resolved.state.lightCharges,
        },
      },
      position: { before: state.currentSegmentId, after: resolved.state.currentSegmentId },
    },
  };
  const snapshot: SnapshotRecord = {
    ...loaded.cumulativeSnapshot,
    createdAt: timestamp,
    sourceRevision: resolved.state.revision,
    body: mergeCumulativeSnapshot(
      loaded.cumulativeSnapshot.body,
      stateRecord,
      event,
      resultRecords,
    ),
  };
  const slotMetadata: SlotRecord = {
    ...slot,
    revision: resolved.state.revision,
    updatedAt: timestamp,
    status: resolved.state.status === 'active' ? 'active' : 'ready',
    recoveryAvailable: true,
  };
  const committed = await dependencies.coordinator.commit({
    actionId: command.actionId,
    idempotencyKey: command.idempotencyKey,
    slotId: command.slotId,
    expectedRevision: command.expectedRevision,
    stateRecords: [stateRecord],
    events: [event],
    randomResultRecords: resultRecords,
    slotMetadata,
    recoveryPointers: { snapshots: [snapshot] },
  });
  if (!committed.ok)
    return {
      ok: false,
      code: 'commit-failed',
      explanation: 'The exploration action was not durably committed.',
    };
  return resolved;
}

function mergeCumulativeSnapshot(
  body: unknown,
  state: PersistedRecord,
  event: EventRecord,
  results: readonly PersistedRecord[],
) {
  const prior = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
  const records = Array.isArray(prior.records)
    ? prior.records.filter(
        (candidate) =>
          !(
            typeof candidate === 'object' &&
            candidate !== null &&
            Reflect.get(candidate, 'recordType') === state.recordType &&
            Reflect.get(candidate, 'recordId') === state.recordId
          ),
      )
    : [];
  return {
    ...prior,
    records: [...records, state, ...results],
    events: [...(Array.isArray(prior.events) ? prior.events : []), event],
  };
}
