import {
  createNamedRandomStream,
  serializeNamedRandomStream,
  type AdventurerCreatedEvent,
  type AdventurerId,
  type CreateAdventurerCommand,
  type DefinitionId,
  type EventId,
  type EventSequence,
  type IsoDateTimeString,
  type ItemInstanceId,
  type RandomStreamId,
  type RollReference,
  type RollResultId,
  type RulesVersion,
  type ContentVersion,
} from '@notequest/domain';

import type { ActionTransactionCoordinator } from './action-commit.ts';
import type {
  EventRepository,
  RecordRepository,
  SnapshotRepository,
  SlotRepository,
  PersistedRecord,
  SlotRecord,
} from './repositories.ts';

export interface AdventurerCreationTableRow {
  readonly id: DefinitionId;
  readonly total: number;
  readonly label: string;
}

export interface AdventurerRaceDefinition extends AdventurerCreationTableRow {
  readonly baseHp: number;
  readonly startingSpellCharges: number;
  readonly randomSpellDraws?: number;
  readonly fixedSpellGrants?: readonly {
    readonly spellId: DefinitionId;
    readonly charges: number;
  }[];
  readonly effectIds: readonly DefinitionId[];
}

export interface AdventurerClassDefinition extends AdventurerCreationTableRow {
  readonly hpModifier: number;
  readonly startingSpellCharges: number;
  readonly randomSpellDraws?: number;
  readonly fixedSpellGrants?: readonly {
    readonly spellId: DefinitionId;
    readonly charges: number;
  }[];
  readonly weapon: {
    readonly definitionId: DefinitionId;
    readonly label: string;
    readonly hands: number;
    readonly damage?: {
      readonly diceCount: number;
      readonly dieSides: number;
      readonly modifier: number;
      readonly damageType: string;
    };
  };
  readonly effectIds: readonly DefinitionId[];
}

export interface AdventurerCreationContent {
  readonly raceTableId: DefinitionId;
  readonly classTableId: DefinitionId;
  readonly spellTableId: DefinitionId;
  readonly races: readonly AdventurerRaceDefinition[];
  readonly classes: readonly AdventurerClassDefinition[];
  readonly spells: Readonly<Record<number, { readonly id: DefinitionId; readonly label: string }>>;
}

export interface CanonicalAdventurerState {
  readonly adventurerId: AdventurerId;
  readonly raceId: DefinitionId;
  readonly classId: DefinitionId;
  readonly maxHp: number;
  readonly currentHp: number;
  readonly usableArms: 2;
  readonly usableHands: 2;
  readonly torches: 10;
  readonly coins: 0;
  readonly status: 'alive';
  readonly location: 'town';
  readonly backpackItemIds: readonly ItemInstanceId[];
  readonly armourItemIds: readonly ItemInstanceId[];
  readonly death: null;
  readonly equipment: readonly {
    readonly itemId: ItemInstanceId;
    readonly definitionId: DefinitionId;
    readonly label: string;
    readonly equipped: true;
    readonly hands: number;
    readonly damage?: {
      readonly diceCount: number;
      readonly dieSides: number;
      readonly modifier: number;
      readonly damageType: string;
    };
  }[];
  readonly spellCharges: readonly {
    readonly chargeId: string;
    readonly definitionId: DefinitionId;
    readonly label: string;
    readonly remainingUses: 1;
    readonly source: 'fixed' | 'random';
  }[];
  readonly effectIds: readonly DefinitionId[];
  readonly rulesVersion: RulesVersion;
  readonly contentVersion: ContentVersion;
}

export interface AdventurerCreationEvidence {
  readonly race: RollReference & { readonly resultId: DefinitionId; readonly resultLabel: string };
  readonly adventurerClass: RollReference & {
    readonly resultId: DefinitionId;
    readonly resultLabel: string;
  };
  readonly spells: readonly (RollReference & {
    readonly resultId: DefinitionId;
    readonly resultLabel: string;
  })[];
  readonly derivedMaxHp: number;
  readonly rulesVersion: RulesVersion;
  readonly contentVersion: ContentVersion;
}

/** User-authored identity is local private data, never bundled or source-labelled content. */
export interface LocalAdventurerProfile {
  readonly adventurerId: AdventurerId;
  readonly playerAuthoredName: string;
  readonly sourceCategory: 'user-authored';
  readonly private: true;
  readonly updatedAt: string;
}

export interface PreparedAdventurerCreation {
  readonly command: CreateAdventurerCommand;
  readonly expectedRevision: number;
  readonly playerAuthoredName: string;
  readonly state: CanonicalAdventurerState;
  readonly evidence: AdventurerCreationEvidence;
  readonly streamRecord: PersistedRecord;
  readonly rollRecords: readonly PersistedRecord[];
  readonly event: AdventurerCreatedEvent;
}

export type AdventurerCreationPrepareResult =
  | { readonly ok: true; readonly prepared: PreparedAdventurerCreation }
  | {
      readonly ok: false;
      readonly kind: 'validation' | 'cancelled' | 'unavailable';
      readonly message: string;
    };

export type AdventurerCreationCommitResult =
  | {
      readonly ok: true;
      readonly committed: true;
      readonly stateRevision: number;
      readonly state: CanonicalAdventurerState;
      readonly playerAuthoredName: string;
      readonly evidence: AdventurerCreationEvidence;
      readonly event?: AdventurerCreatedEvent;
    }
  | {
      readonly ok: false;
      readonly committed: false | 'unknown';
      readonly retryable: boolean;
      readonly message: string;
    };

export type AdventurerCreationLoadResult =
  | { readonly kind: 'empty' }
  | {
      readonly kind: 'committed';
      readonly result: Extract<AdventurerCreationCommitResult, { ok: true }>;
    }
  | {
      readonly kind: 'unavailable' | 'incoherent';
      readonly message: string;
    };

export interface AdventurerCreationDependencies {
  readonly slots: SlotRepository;
  readonly records: RecordRepository;
  readonly events: EventRepository;
  readonly snapshots: SnapshotRepository;
  readonly coordinator: ActionTransactionCoordinator;
  readonly content: AdventurerCreationContent;
  readonly rulesVersion: RulesVersion;
  readonly contentVersion: ContentVersion;
  readonly masterSeedForSlot: (slotId: CreateAdventurerCommand['slotId']) => string;
  readonly newId: () => string;
  readonly now: () => string;
}

function validateCreationContent(content: AdventurerCreationContent): string | null {
  const totals = Array.from({ length: 11 }, (_, index) => index + 2);
  const validTable = (rows: readonly AdventurerCreationTableRow[]) =>
    rows.length === totals.length &&
    totals.every((total) => rows.filter((row) => row.total === total).length === 1) &&
    new Set(rows.map((row) => row.id)).size === rows.length;
  if (
    !validTable(content.races) ||
    content.races.some(
      (row) =>
        row.baseHp <= 0 ||
        (row.randomSpellDraws ?? row.startingSpellCharges) < 0 ||
        row.fixedSpellGrants?.some(
          (grant) =>
            grant.charges <= 0 ||
            !Object.values(content.spells).some((spell) => spell.id === grant.spellId),
        ),
    )
  )
    return 'Approved race creation content is incomplete or invalid.';
  if (
    !validTable(content.classes) ||
    content.classes.some(
      (row) =>
        (row.randomSpellDraws ?? row.startingSpellCharges) < 0 ||
        row.fixedSpellGrants?.some(
          (grant) =>
            grant.charges <= 0 ||
            !Object.values(content.spells).some((spell) => spell.id === grant.spellId),
        ) ||
        row.weapon.label.trim() === '' ||
        row.weapon.hands < 0 ||
        row.weapon.hands > 2,
    )
  )
    return 'Approved class or equipment creation content is incomplete or invalid.';
  if (
    ![1, 2, 3, 4, 5, 6].every(
      (roll) => content.spells[roll] !== undefined && content.spells[roll]!.label.trim() !== '',
    ) ||
    new Set(Object.values(content.spells).map((spell) => spell.id)).size !== 6
  )
    return 'Approved spell creation content is incomplete or invalid.';
  return null;
}

export const ADVENTURER_NAME_MAX_GRAPHEMES = 40;

export type AdventurerNameValidation =
  | { readonly ok: true; readonly normalized: string; readonly graphemeCount: number }
  | { readonly ok: false; readonly message: string };

/** Shared application validation keeps UI and command handling on one Unicode-aware rule. */
export function validateAdventurerName(rawName: string): AdventurerNameValidation {
  const normalized = rawName.trim();
  if (normalized === '') {
    return { ok: false, message: 'Enter an adventurer name.' };
  }
  if (/\p{Cc}/u.test(normalized)) {
    return { ok: false, message: 'Adventurer names cannot contain control characters.' };
  }
  const graphemeCount = Array.from(
    new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(normalized),
  ).length;
  if (graphemeCount > ADVENTURER_NAME_MAX_GRAPHEMES) {
    return {
      ok: false,
      message: `Use ${ADVENTURER_NAME_MAX_GRAPHEMES} or fewer characters for the adventurer name.`,
    };
  }
  return { ok: true, normalized, graphemeCount };
}

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isAdventurerCreatedEvent(value: unknown): value is AdventurerCreatedEvent {
  return (
    object(value) &&
    value.type === 'adventurer_created' &&
    typeof value.adventurerId === 'string' &&
    object(value.metadata) &&
    typeof value.metadata.eventId === 'string' &&
    typeof value.metadata.commandId === 'string' &&
    typeof value.metadata.stateRevision === 'number'
  );
}
function isCanonicalAdventurerState(value: unknown): value is CanonicalAdventurerState {
  return (
    object(value) &&
    typeof value.adventurerId === 'string' &&
    typeof value.raceId === 'string' &&
    typeof value.classId === 'string' &&
    typeof value.maxHp === 'number' &&
    typeof value.currentHp === 'number' &&
    Array.isArray(value.equipment) &&
    Array.isArray(value.spellCharges) &&
    Array.isArray(value.effectIds) &&
    typeof value.rulesVersion === 'string' &&
    typeof value.contentVersion === 'string'
  );
}
function isLocalAdventurerProfile(value: unknown): value is LocalAdventurerProfile {
  return (
    object(value) &&
    typeof value.adventurerId === 'string' &&
    typeof value.playerAuthoredName === 'string' &&
    value.sourceCategory === 'user-authored' &&
    value.private === true
  );
}
function isCreationEvidenceRecord(
  value: unknown,
): value is { evidence: AdventurerCreationEvidence; event: AdventurerCreatedEvent } {
  return object(value) && object(value.evidence) && isAdventurerCreatedEvent(value.event);
}
function isCreationSnapshotBody(value: unknown): value is {
  stateRecords: readonly PersistedRecord[];
  randomStreamRecords: readonly PersistedRecord[];
  randomResultRecords: readonly PersistedRecord[];
  creationEvent: AdventurerCreatedEvent;
} {
  return (
    object(value) &&
    Array.isArray(value.stateRecords) &&
    Array.isArray(value.randomStreamRecords) &&
    Array.isArray(value.randomResultRecords) &&
    isAdventurerCreatedEvent(value.creationEvent)
  );
}

export class AdventurerCreationService {
  private readonly preparedByAction = new Map<string, PreparedAdventurerCreation>();

  constructor(private readonly dependencies: AdventurerCreationDependencies) {}

  async prepare(command: CreateAdventurerCommand): Promise<AdventurerCreationPrepareResult> {
    if (command.creationMode !== 'canonical_random') {
      return { ok: false, kind: 'validation', message: 'Only canonical creation is available.' };
    }
    const contentFailure = validateCreationContent(this.dependencies.content);
    if (contentFailure !== null) {
      return { ok: false, kind: 'unavailable', message: contentFailure };
    }
    const nameValidation = validateAdventurerName(command.playerAuthoredName ?? '');
    if (!nameValidation.ok) {
      return {
        ok: false,
        kind: 'validation',
        message: nameValidation.message,
      };
    }
    const playerAuthoredName = nameValidation.normalized;
    if (
      command.metadata.idempotencyKey === undefined ||
      command.metadata.idempotencyKey.trim() === ''
    ) {
      return {
        ok: false,
        kind: 'validation',
        message: 'Creation requires a stable idempotency key.',
      };
    }
    const actionKey = this.actionKey(command);
    const existingPreparation = this.preparedByAction.get(actionKey);
    if (existingPreparation !== undefined) {
      return existingPreparation.playerAuthoredName === playerAuthoredName
        ? { ok: true, prepared: existingPreparation }
        : {
            ok: false,
            kind: 'validation',
            message: 'This creation action is already associated with a different local name.',
          };
    }
    const slot = await this.dependencies.slots.get(command.slotId);
    if (!slot.ok || slot.value.status !== 'empty' || slot.value.revision !== 0) {
      return { ok: false, kind: 'unavailable', message: 'This save slot is not empty.' };
    }

    const timestamp = this.dependencies.now();
    const adventurerId = this.dependencies.newId() as AdventurerId;
    const streamId = this.dependencies.newId() as RandomStreamId;
    let stream = createNamedRandomStream(
      this.dependencies.masterSeedForSlot(command.slotId),
      'adventurer-creation',
    );
    const drawDie = (): number => {
      const draw = stream.rng.nextBounded(6);
      stream = { ...stream, rng: draw.state };
      return draw.value + 1;
    };
    const raceDice = [drawDie(), drawDie()] as const;
    const race = this.dependencies.content.races.find(
      (row) => row.total === raceDice[0] + raceDice[1],
    );
    const classDice = [drawDie(), drawDie()] as const;
    const adventurerClass = this.dependencies.content.classes.find(
      (row) => row.total === classDice[0] + classDice[1],
    );
    if (race === undefined || adventurerClass === undefined) {
      return {
        ok: false,
        kind: 'unavailable',
        message: 'Approved creation content is incomplete.',
      };
    }
    const raceRoll = this.rollReference(
      streamId,
      raceDice,
      raceDice[0] + raceDice[1],
      this.dependencies.content.raceTableId,
      race.id,
    );
    const classRoll = this.rollReference(
      streamId,
      classDice,
      classDice[0] + classDice[1],
      this.dependencies.content.classTableId,
      adventurerClass.id,
    );
    const spellRolls = Array.from(
      {
        length:
          (race.randomSpellDraws ?? race.startingSpellCharges) +
          (adventurerClass.randomSpellDraws ?? adventurerClass.startingSpellCharges),
      },
      () => {
        const value = drawDie();
        const spell = this.dependencies.content.spells[value];
        if (spell === undefined) throw new Error(`Approved spell content is missing row ${value}.`);
        return {
          ...this.rollReference(
            streamId,
            [value],
            value,
            this.dependencies.content.spellTableId,
            spell.id,
          ),
          resultId: spell.id,
          resultLabel: spell.label,
        };
      },
    );
    const fixedSpellCharges = [
      ...(race.fixedSpellGrants ?? []),
      ...(adventurerClass.fixedSpellGrants ?? []),
    ].flatMap((grant) => {
      const spell = Object.values(this.dependencies.content.spells).find(
        (candidate) => candidate.id === grant.spellId,
      )!;
      return Array.from({ length: grant.charges }, () => ({
        chargeId: this.dependencies.newId(),
        definitionId: spell.id,
        label: spell.label,
        remainingUses: 1 as const,
        source: 'fixed' as const,
      }));
    });
    const maxHp = race.baseHp + adventurerClass.hpModifier;
    const state: CanonicalAdventurerState = {
      adventurerId,
      raceId: race.id,
      classId: adventurerClass.id,
      maxHp,
      currentHp: maxHp,
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
          itemId: this.dependencies.newId() as ItemInstanceId,
          definitionId: adventurerClass.weapon.definitionId,
          label: adventurerClass.weapon.label,
          equipped: true,
          hands: adventurerClass.weapon.hands,
          ...(adventurerClass.weapon.damage === undefined
            ? {}
            : { damage: adventurerClass.weapon.damage }),
        },
      ],
      spellCharges: [
        ...fixedSpellCharges,
        ...spellRolls.map((roll) => ({
          chargeId: this.dependencies.newId(),
          definitionId: roll.resultId,
          label: roll.resultLabel,
          remainingUses: 1 as const,
          source: 'random' as const,
        })),
      ],
      effectIds: [...race.effectIds, ...adventurerClass.effectIds],
      rulesVersion: this.dependencies.rulesVersion,
      contentVersion: this.dependencies.contentVersion,
    };
    const evidence: AdventurerCreationEvidence = {
      race: { ...raceRoll, resultId: race.id, resultLabel: race.label },
      adventurerClass: {
        ...classRoll,
        resultId: adventurerClass.id,
        resultLabel: adventurerClass.label,
      },
      spells: spellRolls,
      derivedMaxHp: maxHp,
      rulesVersion: this.dependencies.rulesVersion,
      contentVersion: this.dependencies.contentVersion,
    };
    const eventId = this.dependencies.newId() as EventId;
    const event: AdventurerCreatedEvent = {
      type: 'adventurer_created',
      module: 'adventurer',
      adventurerId,
      metadata: {
        eventId,
        sequence: 1 as EventSequence,
        commandId: command.metadata.commandId,
        ...(command.metadata.correlationId === undefined
          ? {}
          : { correlationId: command.metadata.correlationId }),
        occurredAt: timestamp as IsoDateTimeString,
        rulesVersion: this.dependencies.rulesVersion,
        contentVersion: this.dependencies.contentVersion,
        stateRevision: 1,
        schemaVersion: 1,
      },
      entities: { slotId: command.slotId, adventurerId },
      summary: 'Adventurer creation committed.',
      requirementIds: ['DRS-ADV-001', 'DRS-ADV-002', 'DRS-ADV-004', 'DRS-ADV-009', 'DRS-ADV-015'],
      rollRefs: [raceRoll, classRoll, ...spellRolls],
      after: { maxHp, currentHp: maxHp, torches: 10, coins: 0 },
    };
    const rollRecords = [evidence.race, evidence.adventurerClass, ...evidence.spells].map(
      (roll) => ({
        slotId: command.slotId,
        recordType: 'random-result',
        recordId: roll.rollResultId,
        updatedAt: timestamp,
        body: roll,
      }),
    );
    const streamRecord: PersistedRecord = {
      slotId: command.slotId,
      recordType: 'random-stream',
      recordId: streamId,
      updatedAt: timestamp,
      body: { streamId, drawCount: 4 + spellRolls.length, ...serializeNamedRandomStream(stream) },
    };
    const prepared: PreparedAdventurerCreation = {
      command,
      expectedRevision: 0,
      playerAuthoredName,
      state,
      evidence,
      streamRecord,
      rollRecords,
      event,
    };
    this.preparedByAction.set(actionKey, prepared);
    return {
      ok: true,
      prepared,
    };
  }

  cancel(): AdventurerCreationPrepareResult {
    return {
      ok: false,
      kind: 'cancelled',
      message: 'Creation cancelled; the save slot was not changed.',
    };
  }

  async commit(prepared: PreparedAdventurerCreation): Promise<AdventurerCreationCommitResult> {
    if (
      prepared.command.metadata.idempotencyKey === undefined ||
      prepared.command.metadata.idempotencyKey.trim() === ''
    ) {
      return {
        ok: false,
        committed: false,
        retryable: false,
        message: 'Creation cannot commit without a stable idempotency key.',
      };
    }
    const timestamp = this.dependencies.now();
    const slotResult = await this.dependencies.slots.get(prepared.command.slotId);
    if (!slotResult.ok)
      return { ok: false, committed: false, retryable: true, message: slotResult.error.message };
    if (
      slotResult.value.status !== 'empty' ||
      slotResult.value.revision !== prepared.expectedRevision
    ) {
      const reconciled = await this.reconcileCommitted(prepared);
      return (
        reconciled ?? {
          ok: false,
          committed: false,
          retryable: false,
          message: 'This slot already contains a different committed creation.',
        }
      );
    }
    const profile: LocalAdventurerProfile = {
      adventurerId: prepared.state.adventurerId,
      playerAuthoredName: prepared.playerAuthoredName,
      sourceCategory: 'user-authored',
      private: true,
      updatedAt: timestamp,
    };
    const creationEvidence = { evidence: prepared.evidence, event: prepared.event };
    const stateRecords: readonly PersistedRecord[] = [
      {
        slotId: prepared.command.slotId,
        recordType: 'adventurer',
        recordId: prepared.state.adventurerId,
        updatedAt: timestamp,
        body: prepared.state,
      },
      {
        slotId: prepared.command.slotId,
        recordType: 'adventurer-profile',
        recordId: prepared.state.adventurerId,
        ownerType: 'adventurer',
        ownerId: prepared.state.adventurerId,
        updatedAt: timestamp,
        body: profile,
      },
      {
        slotId: prepared.command.slotId,
        recordType: 'adventurer-creation-evidence',
        recordId: prepared.state.adventurerId,
        ownerType: 'adventurer',
        ownerId: prepared.state.adventurerId,
        updatedAt: timestamp,
        body: creationEvidence,
      },
    ];
    const result = await this.dependencies.coordinator.commit({
      actionId: prepared.command.metadata.commandId,
      slotId: prepared.command.slotId,
      ...(prepared.command.metadata.idempotencyKey === undefined
        ? {}
        : { idempotencyKey: prepared.command.metadata.idempotencyKey }),
      expectedRevision: prepared.expectedRevision,
      stateRecords,
      randomStreamRecords: [prepared.streamRecord],
      randomResultRecords: prepared.rollRecords,
      events: [
        {
          slotId: prepared.command.slotId,
          sequence: 1,
          timestamp,
          eventType: prepared.event.type,
          aggregateType: 'adventurer',
          aggregateId: prepared.state.adventurerId,
          retentionClass: 'mechanical-history',
          body: prepared.event,
        },
      ],
      recoveryPointers: {
        snapshots: [
          {
            slotId: prepared.command.slotId,
            snapshotClass: 'last-valid',
            createdAt: timestamp,
            schemaVersion: 1,
            sourceRevision: 1,
            body: {
              stateRecords,
              randomStreamRecords: [prepared.streamRecord],
              randomResultRecords: prepared.rollRecords,
              creationEvent: prepared.event,
            },
          },
        ],
      },
      slotMetadata: this.committedSlot(slotResult.value, timestamp),
    });
    if (!result.ok) {
      if (result.committed === 'unknown') {
        const reconciled = await this.reconcileCommitted(prepared);
        if (reconciled !== null) return reconciled;
      }
      return {
        ok: false,
        committed: result.committed,
        retryable: result.error.code !== 'revision_conflict',
        message: result.error.message,
      };
    }
    if (result.duplicate) {
      const reconciled = await this.reconcileCommitted(prepared);
      return (
        reconciled ?? {
          ok: false,
          committed: false,
          retryable: false,
          message: 'The duplicate creation receipt could not be matched to durable state.',
        }
      );
    }
    return {
      ok: true,
      committed: true,
      stateRevision: result.stateRevision,
      state: prepared.state,
      playerAuthoredName: prepared.playerAuthoredName,
      evidence: prepared.evidence,
      event: prepared.event,
    };
  }

  async loadCommitted(
    slotId: CreateAdventurerCommand['slotId'],
  ): Promise<AdventurerCreationLoadResult> {
    const [slot, states, profiles, evidenceRecords, streams, randomResults, events, snapshot] =
      await Promise.all([
        this.dependencies.slots.get(slotId),
        this.dependencies.records.listByType(slotId, 'adventurer'),
        this.dependencies.records.listByType(slotId, 'adventurer-profile'),
        this.dependencies.records.listByType(slotId, 'adventurer-creation-evidence'),
        this.dependencies.records.listByType(slotId, 'random-stream'),
        this.dependencies.records.listByType(slotId, 'random-result'),
        this.dependencies.events.listForSlot(slotId),
        this.dependencies.snapshots.get(slotId, 'last-valid'),
      ]);
    if (!slot.ok)
      return { kind: 'unavailable', message: `slot read failed: ${slot.error.message}` };
    if (!states.ok)
      return {
        kind: 'unavailable',
        message: `adventurer state read failed: ${states.error.message}`,
      };
    if (!profiles.ok)
      return {
        kind: 'unavailable',
        message: `local profile read failed: ${profiles.error.message}`,
      };
    if (!evidenceRecords.ok)
      return {
        kind: 'unavailable',
        message: `creation evidence read failed: ${evidenceRecords.error.message}`,
      };
    if (!streams.ok)
      return {
        kind: 'unavailable',
        message: `random stream read failed: ${streams.error.message}`,
      };
    if (!randomResults.ok)
      return {
        kind: 'unavailable',
        message: `random result read failed: ${randomResults.error.message}`,
      };
    if (!events.ok)
      return { kind: 'unavailable', message: `event read failed: ${events.error.message}` };
    if (!snapshot.ok && snapshot.error.code !== 'missing_record')
      return {
        kind: 'unavailable',
        message: `protected snapshot read failed: ${snapshot.error.message}`,
      };
    if (
      !slot.ok ||
      !states.ok ||
      !profiles.ok ||
      !evidenceRecords.ok ||
      !streams.ok ||
      !randomResults.ok ||
      !events.ok
    )
      return { kind: 'unavailable', message: 'Creation data could not be read.' };

    if (slot.value.status === 'empty' && slot.value.revision === 0) {
      return states.value.length === 0 &&
        profiles.value.length === 0 &&
        evidenceRecords.value.length === 0 &&
        streams.value.length === 0 &&
        randomResults.value.length === 0 &&
        events.value.length === 0 &&
        !snapshot.ok
        ? { kind: 'empty' }
        : { kind: 'incoherent', message: 'The empty slot contains unexpected creation data.' };
    }
    if (
      !snapshot.ok ||
      slot.value.status !== 'ready' ||
      slot.value.integrityStatus !== 'valid' ||
      slot.value.currentSnapshotId !== 'last-valid' ||
      slot.value.lastValidSnapshotId !== 'last-valid' ||
      states.value.length !== 1 ||
      profiles.value.length !== 1 ||
      evidenceRecords.value.length !== 1 ||
      streams.value.length !== 1 ||
      snapshot.value.sourceRevision !== slot.value.revision ||
      snapshot.value.schemaVersion !== slot.value.schemaVersion
    )
      return { kind: 'incoherent', message: 'Committed adventurer records are incomplete.' };

    const stateBody = states.value[0]!.body;
    const profileBody = profiles.value[0]!.body;
    const evidenceBody = evidenceRecords.value[0]!.body;
    const snapshotBody = snapshot.value.body;
    if (
      !isCanonicalAdventurerState(stateBody) ||
      !isLocalAdventurerProfile(profileBody) ||
      !isCreationEvidenceRecord(evidenceBody) ||
      !isCreationSnapshotBody(snapshotBody)
    )
      return { kind: 'incoherent', message: 'Committed adventurer data has an invalid shape.' };
    const creationEvents = events.value.filter(
      (record) =>
        isAdventurerCreatedEvent(record.body) &&
        record.body.metadata.eventId === evidenceBody.event.metadata.eventId,
    );
    const eventBody = creationEvents[0]?.body;
    const expectedRolls = [
      evidenceBody.evidence.race,
      evidenceBody.evidence.adventurerClass,
      ...evidenceBody.evidence.spells,
    ];
    const streamBody = streams.value[0]!.body;
    if (!isAdventurerCreatedEvent(eventBody) || creationEvents.length !== 1 || !object(streamBody))
      return {
        kind: 'incoherent',
        message: 'Creation event or random stream is missing or malformed.',
      };
    if (
      stateBody.adventurerId !== profileBody.adventurerId ||
      evidenceBody.event.adventurerId !== stateBody.adventurerId ||
      eventBody.metadata.eventId !== evidenceBody.event.metadata.eventId ||
      eventBody.metadata.commandId !== evidenceBody.event.metadata.commandId ||
      eventBody.metadata.stateRevision !== slot.value.revision ||
      stateBody.rulesVersion !== slot.value.rulesVersion ||
      stateBody.contentVersion !== slot.value.contentVersion ||
      randomResults.value.length !== expectedRolls.length ||
      !expectedRolls.every((roll) =>
        randomResults.value.some(
          (record) =>
            record.recordId === roll.rollResultId &&
            object(record.body) &&
            record.body.streamId === roll.streamId,
        ),
      ) ||
      streamBody.streamId !== expectedRolls[0]?.streamId ||
      streamBody.drawCount !==
        expectedRolls.reduce((count, roll) => count + roll.naturalDice.length, 0) ||
      snapshotBody.randomStreamRecords.length !== 1 ||
      snapshotBody.randomResultRecords.length !== expectedRolls.length ||
      !snapshotBody.stateRecords.some(
        (record) =>
          record.recordType === 'adventurer' && record.recordId === stateBody.adventurerId,
      ) ||
      snapshotBody.creationEvent.metadata.eventId !== eventBody.metadata.eventId
    )
      return {
        kind: 'incoherent',
        message: 'Committed identity, event, snapshot, or versions disagree.',
      };
    return {
      kind: 'committed',
      result: {
        ok: true,
        committed: true,
        stateRevision: slot.value.revision,
        state: stateBody,
        playerAuthoredName: profileBody.playerAuthoredName,
        evidence: evidenceBody.evidence,
        event: eventBody,
      },
    };
  }

  private rollReference(
    streamId: RandomStreamId,
    naturalDice: readonly number[],
    finalValue: number,
    tableId: DefinitionId,
    rowId: DefinitionId,
  ): RollReference {
    return {
      rollResultId: this.dependencies.newId() as RollResultId,
      streamId,
      naturalDice,
      finalValue,
      tableId,
      rowId,
      manualEntry: false,
    };
  }

  private actionKey(command: CreateAdventurerCommand): string {
    return `${command.slotId}:${command.metadata.commandId}:${command.metadata.idempotencyKey ?? ''}`;
  }

  private async reconcileCommitted(
    prepared: PreparedAdventurerCreation,
  ): Promise<Extract<AdventurerCreationCommitResult, { ok: true }> | null> {
    const loaded = await this.loadCommitted(prepared.command.slotId);
    const committed = loaded.kind === 'committed' ? loaded.result : null;
    if (
      committed === null ||
      committed.event?.metadata.commandId !== prepared.command.metadata.commandId ||
      committed.state.adventurerId !== prepared.state.adventurerId
    ) {
      return null;
    }
    return committed;
  }

  private committedSlot(slot: SlotRecord, timestamp: string): SlotRecord {
    return {
      ...slot,
      updatedAt: timestamp,
      status: 'ready',
      schemaVersion: 1,
      rulesVersion: this.dependencies.rulesVersion,
      contentVersion: this.dependencies.contentVersion,
      currentSnapshotId: 'last-valid',
      lastValidSnapshotId: 'last-valid',
      recoveryAvailable: true,
      integrityStatus: 'valid',
    };
  }
}
