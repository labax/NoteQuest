import {
  createNamedRandomStream,
  deserializeNamedRandomStream,
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
  type NamedRandomStreamState,
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

export interface AdventurerEffectDefinition {
  readonly id: DefinitionId;
  readonly label: string;
  readonly version: ContentVersion;
  readonly trigger: string;
  readonly guards: readonly string[];
  readonly outcome: Readonly<Record<string, unknown>>;
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
    readonly damage: {
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
  readonly effects: Readonly<Record<string, AdventurerEffectDefinition>>;
  readonly startingState: {
    readonly usableArms: 2;
    readonly usableHands: 2;
    readonly torches: 10;
    readonly coins: 0;
    readonly status: 'alive';
    readonly location: 'town';
  };
}

export interface CanonicalAdventurerState {
  readonly adventurerId: AdventurerId;
  readonly raceId: DefinitionId;
  readonly classId: DefinitionId;
  readonly maxHp: number;
  readonly currentHp: number;
  readonly usableArms: number;
  readonly usableHands: number;
  readonly torches: number;
  readonly coins: number;
  readonly status: 'alive' | 'dead';
  readonly location: string;
  readonly backpackItemIds: readonly ItemInstanceId[];
  readonly armourItemIds: readonly ItemInstanceId[];
  readonly death: Readonly<Record<string, unknown>> | null;
  readonly equipment: readonly {
    readonly itemId: ItemInstanceId;
    readonly definitionId: DefinitionId;
    readonly label: string;
    readonly equipped: boolean;
    readonly hands: number;
    readonly damage: {
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
    readonly remainingUses: 0 | 1;
    readonly source: 'fixed' | 'random';
  }[];
  readonly effectIds: readonly DefinitionId[];
  readonly effects: readonly AdventurerEffectDefinition[];
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
        row.weapon.hands > 2 ||
        row.weapon.damage.diceCount <= 0 ||
        row.weapon.damage.dieSides <= 1,
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
  const referencedEffects = [...content.races, ...content.classes].flatMap((row) => row.effectIds);
  if (
    referencedEffects.some((id) => content.effects[id] === undefined) ||
    Object.values(content.effects).some(
      (effect) =>
        effect.version.trim() === '' || effect.label.trim() === '' || effect.trigger.trim() === '',
    )
  )
    return 'Approved effect creation content is incomplete or invalid.';
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

function strings(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Date.parse(value));
}

function isJsonValue(value: unknown): boolean {
  return (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value)) ||
    (Array.isArray(value) && value.every(isJsonValue)) ||
    (object(value) && Object.values(value).every(isJsonValue))
  );
}

function isBaseRollReference(value: unknown): value is RollReference {
  return (
    object(value) &&
    typeof value.rollResultId === 'string' &&
    typeof value.streamId === 'string' &&
    Array.isArray(value.naturalDice) &&
    value.naturalDice.length > 0 &&
    value.naturalDice.every((die) => Number.isInteger(die) && die >= 1 && die <= 6) &&
    Number.isInteger(value.finalValue) &&
    value.finalValue === value.naturalDice.reduce((sum: number, die) => sum + die, 0) &&
    typeof value.tableId === 'string' &&
    typeof value.rowId === 'string' &&
    value.manualEntry === false
  );
}

function isRollReference(value: unknown): value is RollReference & {
  readonly resultId: DefinitionId;
  readonly resultLabel: string;
} {
  return (
    isBaseRollReference(value) &&
    'resultId' in value &&
    typeof value.resultId === 'string' &&
    'resultLabel' in value &&
    typeof value.resultLabel === 'string' &&
    value.resultLabel.trim() !== ''
  );
}

function isEffect(value: unknown): value is AdventurerEffectDefinition {
  return (
    object(value) &&
    typeof value.id === 'string' &&
    typeof value.label === 'string' &&
    value.label.trim() !== '' &&
    typeof value.version === 'string' &&
    typeof value.trigger === 'string' &&
    Array.isArray(value.guards) &&
    strings(value.guards) &&
    object(value.outcome) &&
    typeof value.outcome.operation === 'string' &&
    isJsonValue(value.outcome)
  );
}

function isAdventurerCreatedEvent(value: unknown): value is AdventurerCreatedEvent {
  return (
    object(value) &&
    value.type === 'adventurer_created' &&
    value.module === 'adventurer' &&
    typeof value.adventurerId === 'string' &&
    object(value.metadata) &&
    typeof value.metadata.eventId === 'string' &&
    typeof value.metadata.commandId === 'string' &&
    Number.isSafeInteger(value.metadata.sequence) &&
    value.metadata.sequence === 1 &&
    (value.metadata.correlationId === undefined ||
      typeof value.metadata.correlationId === 'string') &&
    isIsoDate(value.metadata.occurredAt) &&
    Number.isInteger(value.metadata.stateRevision) &&
    typeof value.metadata.schemaVersion === 'number' &&
    typeof value.metadata.rulesVersion === 'string' &&
    typeof value.metadata.contentVersion === 'string' &&
    object(value.entities) &&
    typeof value.entities.slotId === 'string' &&
    value.entities.adventurerId === value.adventurerId &&
    typeof value.summary === 'string' &&
    value.summary.trim() !== '' &&
    Array.isArray(value.requirementIds) &&
    strings(value.requirementIds) &&
    value.requirementIds.length > 0 &&
    Array.isArray(value.rollRefs) &&
    value.rollRefs.every(isBaseRollReference) &&
    object(value.after) &&
    typeof value.after.maxHp === 'number' &&
    typeof value.after.currentHp === 'number' &&
    typeof value.after.torches === 'number' &&
    typeof value.after.coins === 'number'
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
    value.currentHp >= 0 &&
    value.currentHp <= value.maxHp &&
    typeof value.usableArms === 'number' &&
    Number.isSafeInteger(value.usableArms) &&
    value.usableArms >= 0 &&
    value.usableArms <= 2 &&
    typeof value.usableHands === 'number' &&
    Number.isSafeInteger(value.usableHands) &&
    value.usableHands >= 0 &&
    value.usableHands <= value.usableArms &&
    typeof value.torches === 'number' &&
    Number.isSafeInteger(value.torches) &&
    value.torches >= 0 &&
    typeof value.coins === 'number' &&
    Number.isSafeInteger(value.coins) &&
    value.coins >= 0 &&
    (value.status === 'alive' || value.status === 'dead') &&
    typeof value.location === 'string' &&
    value.location.trim() !== '' &&
    Array.isArray(value.backpackItemIds) &&
    strings(value.backpackItemIds) &&
    Array.isArray(value.armourItemIds) &&
    strings(value.armourItemIds) &&
    (value.death === null || (object(value.death) && isJsonValue(value.death))) &&
    Array.isArray(value.equipment) &&
    value.equipment.length === 1 &&
    value.equipment.every(
      (item) =>
        object(item) &&
        typeof item.itemId === 'string' &&
        typeof item.definitionId === 'string' &&
        typeof item.label === 'string' &&
        typeof item.equipped === 'boolean' &&
        Number.isInteger(item.hands) &&
        object(item.damage) &&
        Number.isInteger(item.damage.diceCount) &&
        Number.isInteger(item.damage.dieSides) &&
        typeof item.damage.modifier === 'number' &&
        typeof item.damage.damageType === 'string',
    ) &&
    Array.isArray(value.spellCharges) &&
    value.spellCharges.every(
      (charge) =>
        object(charge) &&
        typeof charge.chargeId === 'string' &&
        typeof charge.definitionId === 'string' &&
        typeof charge.label === 'string' &&
        typeof charge.remainingUses === 'number' &&
        Number.isSafeInteger(charge.remainingUses) &&
        charge.remainingUses >= 0 &&
        charge.remainingUses <= 1 &&
        (charge.source === 'fixed' || charge.source === 'random'),
    ) &&
    Array.isArray(value.effectIds) &&
    strings(value.effectIds) &&
    Array.isArray(value.effects) &&
    value.effects.every(isEffect) &&
    value.effects.length === (value.effectIds as readonly unknown[]).length &&
    value.effects.every(
      (effect, index) => effect.id === (value.effectIds as readonly unknown[])[index],
    ) &&
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
    value.private === true &&
    typeof value.updatedAt === 'string'
  );
}
function isPersistedRecord(value: unknown): value is PersistedRecord {
  return (
    object(value) &&
    typeof value.slotId === 'string' &&
    typeof value.recordType === 'string' &&
    value.recordType.trim() !== '' &&
    typeof value.recordId === 'string' &&
    value.recordId.trim() !== '' &&
    (value.ownerType === undefined || typeof value.ownerType === 'string') &&
    (value.ownerId === undefined || typeof value.ownerId === 'string') &&
    isIsoDate(value.updatedAt) &&
    'body' in value
  );
}
function isCreationEvidenceRecord(value: unknown): value is {
  evidence: AdventurerCreationEvidence;
  event: AdventurerCreatedEvent;
  initialState: CanonicalAdventurerState;
} {
  return (
    object(value) &&
    object(value.evidence) &&
    isRollReference(value.evidence.race) &&
    isRollReference(value.evidence.adventurerClass) &&
    Array.isArray(value.evidence.spells) &&
    value.evidence.spells.every(isRollReference) &&
    typeof value.evidence.derivedMaxHp === 'number' &&
    typeof value.evidence.rulesVersion === 'string' &&
    typeof value.evidence.contentVersion === 'string' &&
    isAdventurerCreatedEvent(value.event) &&
    isCanonicalAdventurerState(value.initialState)
  );
}
function isCreationSnapshotBody(value: unknown): value is {
  stateRecords: readonly PersistedRecord[];
  randomStreamRecords?: readonly PersistedRecord[];
  randomResultRecords?: readonly PersistedRecord[];
  creationEvent?: AdventurerCreatedEvent;
} {
  return (
    object(value) &&
    Array.isArray(value.stateRecords) &&
    value.stateRecords.every(isPersistedRecord) &&
    (value.randomStreamRecords === undefined ||
      (Array.isArray(value.randomStreamRecords) &&
        value.randomStreamRecords.every(isPersistedRecord))) &&
    (value.randomResultRecords === undefined ||
      (Array.isArray(value.randomResultRecords) &&
        value.randomResultRecords.every(isPersistedRecord))) &&
    (value.creationEvent === undefined || isAdventurerCreatedEvent(value.creationEvent))
  );
}

function sameValue(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function decodeNamedStream(value: unknown): NamedRandomStreamState | null {
  if (!object(value) || !object(value.rng)) return null;
  const state = {
    purpose: value.purpose,
    derivationId: value.derivationId,
    derivationVersion: value.derivationVersion,
    masterSeed: value.masterSeed,
    rng: {
      algorithmId: value.rng.algorithmId,
      algorithmVersion: value.rng.algorithmVersion,
      state: value.rng.state,
      streamSelector: value.rng.streamSelector,
    },
  } as NamedRandomStreamState;
  try {
    deserializeNamedRandomStream(state);
    return state;
  } catch {
    return null;
  }
}

function creationSemanticsMatch(
  content: AdventurerCreationContent,
  state: CanonicalAdventurerState,
  evidence: AdventurerCreationEvidence,
): boolean {
  const race = content.races.find((row) => row.id === evidence.race.resultId);
  const adventurerClass = content.classes.find(
    (row) => row.id === evidence.adventurerClass.resultId,
  );
  if (race === undefined || adventurerClass === undefined) return false;
  const fixed = [
    ...(race.fixedSpellGrants ?? []),
    ...(adventurerClass.fixedSpellGrants ?? []),
  ].flatMap((grant) => Array.from({ length: grant.charges }, () => grant.spellId));
  const fixedCharges = state.spellCharges
    .filter((charge) => charge.source === 'fixed')
    .map((charge) => charge.definitionId);
  const randomCharges = state.spellCharges.filter((charge) => charge.source === 'random');
  const effects = [...race.effectIds, ...adventurerClass.effectIds].map(
    (id) => content.effects[id],
  );
  return (
    evidence.race.tableId === content.raceTableId &&
    evidence.race.naturalDice.length === 2 &&
    evidence.adventurerClass.tableId === content.classTableId &&
    evidence.adventurerClass.naturalDice.length === 2 &&
    evidence.race.rowId === race.id &&
    evidence.race.resultId === race.id &&
    evidence.race.resultLabel === race.label &&
    evidence.race.finalValue === race.total &&
    evidence.adventurerClass.rowId === adventurerClass.id &&
    evidence.adventurerClass.resultId === adventurerClass.id &&
    evidence.adventurerClass.resultLabel === adventurerClass.label &&
    evidence.adventurerClass.finalValue === adventurerClass.total &&
    state.raceId === race.id &&
    state.classId === adventurerClass.id &&
    state.maxHp === race.baseHp + adventurerClass.hpModifier &&
    state.currentHp === state.maxHp &&
    state.usableArms === content.startingState.usableArms &&
    state.usableHands === content.startingState.usableHands &&
    state.torches === content.startingState.torches &&
    state.coins === content.startingState.coins &&
    state.status === content.startingState.status &&
    state.location === content.startingState.location &&
    state.backpackItemIds.length === 0 &&
    state.armourItemIds.length === 0 &&
    state.death === null &&
    state.equipment.length === 1 &&
    state.equipment[0]?.definitionId === adventurerClass.weapon.definitionId &&
    state.equipment[0]?.label === adventurerClass.weapon.label &&
    state.equipment[0]?.equipped === true &&
    state.equipment[0]?.hands === adventurerClass.weapon.hands &&
    sameValue(state.equipment[0]?.damage, adventurerClass.weapon.damage) &&
    sameValue(fixedCharges, fixed) &&
    randomCharges.length === evidence.spells.length &&
    randomCharges.every((charge, index) => {
      const roll = evidence.spells[index];
      const spell = roll === undefined ? undefined : content.spells[roll.finalValue];
      return (
        roll !== undefined &&
        spell !== undefined &&
        roll.naturalDice.length === 1 &&
        roll.tableId === content.spellTableId &&
        roll.rowId === spell.id &&
        roll.resultId === spell.id &&
        roll.resultLabel === spell.label &&
        charge.definitionId === spell.id &&
        charge.label === spell.label &&
        charge.remainingUses === 1
      );
    }) &&
    sameValue(state.effectIds, [...race.effectIds, ...adventurerClass.effectIds]) &&
    effects.every((effect) => effect !== undefined) &&
    sameValue(state.effects, effects) &&
    evidence.derivedMaxHp === state.maxHp &&
    evidence.rulesVersion === state.rulesVersion &&
    evidence.contentVersion === state.contentVersion
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
      ...this.dependencies.content.startingState,
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
          damage: { ...adventurerClass.weapon.damage },
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
      effects: [...race.effectIds, ...adventurerClass.effectIds].map((id) =>
        structuredClone(this.dependencies.content.effects[id]!),
      ),
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
    const creationEvidence = {
      evidence: prepared.evidence,
      event: prepared.event,
      initialState: prepared.state,
    };
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
      !Number.isSafeInteger(slot.value.revision) ||
      slot.value.revision < 1 ||
      slot.value.schemaVersion === null ||
      slot.value.rulesVersion === null ||
      slot.value.contentVersion === null ||
      !isIsoDate(slot.value.createdAt) ||
      !isIsoDate(slot.value.updatedAt) ||
      snapshot.value.slotId !== slotId ||
      snapshot.value.snapshotClass !== 'last-valid' ||
      !isIsoDate(snapshot.value.createdAt) ||
      snapshot.value.sourceRevision > slot.value.revision ||
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
    const stateRecord = states.value[0]!;
    const profileRecord = profiles.value[0]!;
    const evidenceRecord = evidenceRecords.value[0]!;
    if (
      stateRecord.slotId !== slotId ||
      stateRecord.recordType !== 'adventurer' ||
      stateRecord.recordId !== stateBody.adventurerId ||
      profileRecord.slotId !== slotId ||
      profileRecord.recordType !== 'adventurer-profile' ||
      profileRecord.recordId !== stateBody.adventurerId ||
      profileRecord.ownerType !== 'adventurer' ||
      profileRecord.ownerId !== stateBody.adventurerId ||
      evidenceRecord.slotId !== slotId ||
      evidenceRecord.recordType !== 'adventurer-creation-evidence' ||
      evidenceRecord.recordId !== stateBody.adventurerId ||
      evidenceRecord.ownerType !== 'adventurer' ||
      evidenceRecord.ownerId !== stateBody.adventurerId ||
      !isIsoDate(stateRecord.updatedAt) ||
      !isIsoDate(profileRecord.updatedAt) ||
      !isIsoDate(evidenceRecord.updatedAt) ||
      profileRecord.updatedAt !== profileBody.updatedAt ||
      evidenceBody.initialState.adventurerId !== stateBody.adventurerId
    )
      return { kind: 'incoherent', message: 'Committed record ownership is invalid.' };
    const creationEvents = events.value.filter(
      (record) =>
        isAdventurerCreatedEvent(record.body) &&
        record.body.metadata.eventId === evidenceBody.event.metadata.eventId &&
        record.slotId === slotId &&
        record.eventType === 'adventurer_created' &&
        record.aggregateType === 'adventurer' &&
        record.aggregateId === stateBody.adventurerId &&
        record.sequence === record.body.metadata.sequence,
    );
    const eventRecord = creationEvents[0];
    const eventBody = eventRecord?.body;
    const expectedRolls = [
      evidenceBody.evidence.race,
      evidenceBody.evidence.adventurerClass,
      ...evidenceBody.evidence.spells,
    ];
    const creationStreamId = expectedRolls[0]?.streamId;
    const creationStreams = streams.value.filter(
      (record) =>
        record.slotId === slotId &&
        record.recordType === 'random-stream' &&
        object(record.body) &&
        record.body.streamId === creationStreamId,
    );
    const streamRecord = creationStreams[0];
    const streamBody = streamRecord?.body;
    const serializedStream = decodeNamedStream(streamBody);
    if (
      !isAdventurerCreatedEvent(eventBody) ||
      creationEvents.length !== 1 ||
      creationStreams.length !== 1 ||
      !object(streamBody) ||
      serializedStream === null
    )
      return {
        kind: 'incoherent',
        message: 'Creation event or random stream is missing or malformed.',
      };
    let replay = createNamedRandomStream(serializedStream.masterSeed, serializedStream.purpose);
    const drawCount = streamBody.drawCount;
    if (typeof drawCount !== 'number' || !Number.isSafeInteger(drawCount) || drawCount < 0)
      return { kind: 'incoherent', message: 'Creation random stream draw count is invalid.' };
    for (let drawIndex = 0; drawIndex < drawCount; drawIndex += 1) {
      const draw = replay.rng.nextBounded(6);
      replay = { ...replay, rng: draw.state };
    }
    const creationState = evidenceBody.initialState;
    const creationRevision = eventBody.metadata.stateRevision;
    const snapshotIsCreation = snapshot.value.sourceRevision === creationRevision;
    const snapshotCurrentStates = snapshotBody.stateRecords.filter(
      (record) =>
        record.slotId === slotId &&
        record.recordType === 'adventurer' &&
        record.recordId === stateBody.adventurerId &&
        isCanonicalAdventurerState(record.body) &&
        sameValue(record, stateRecord),
    );
    const snapshotCreationRecordsMatch =
      (snapshotBody.randomStreamRecords ?? []).filter(
        (record) => record.recordId === creationStreamId && sameValue(record, streamRecord),
      ).length === 1 &&
      expectedRolls.every(
        (roll) =>
          (snapshotBody.randomResultRecords ?? []).filter((record) =>
            randomResults.value.some(
              (persisted) =>
                persisted.recordId === roll.rollResultId && sameValue(record, persisted),
            ),
          ).length === 1,
      ) &&
      snapshotBody.stateRecords.filter(
        (record) =>
          record.recordType === 'adventurer-profile' &&
          record.recordId === stateBody.adventurerId &&
          sameValue(record, profileRecord),
      ).length === 1 &&
      snapshotBody.stateRecords.filter(
        (record) =>
          record.recordType === 'adventurer-creation-evidence' &&
          record.recordId === stateBody.adventurerId &&
          sameValue(record, evidenceRecord),
      ).length === 1 &&
      sameValue(snapshotBody.creationEvent, eventBody);
    if (
      stateBody.adventurerId !== profileBody.adventurerId ||
      evidenceBody.event.adventurerId !== stateBody.adventurerId ||
      !sameValue(evidenceBody.event, eventBody) ||
      !creationSemanticsMatch(this.dependencies.content, creationState, evidenceBody.evidence) ||
      creationState.rulesVersion !== this.dependencies.rulesVersion ||
      creationState.contentVersion !== this.dependencies.contentVersion ||
      eventBody.metadata.eventId !== evidenceBody.event.metadata.eventId ||
      eventBody.metadata.commandId !== evidenceBody.event.metadata.commandId ||
      eventBody.module !== 'adventurer' ||
      eventBody.summary !== 'Adventurer creation committed.' ||
      !sameValue(eventBody.requirementIds, [
        'DRS-ADV-001',
        'DRS-ADV-002',
        'DRS-ADV-004',
        'DRS-ADV-009',
        'DRS-ADV-015',
      ]) ||
      !sameValue(eventBody.after, {
        maxHp: creationState.maxHp,
        currentHp: creationState.currentHp,
        torches: creationState.torches,
        coins: creationState.coins,
      }) ||
      eventBody.metadata.sequence !== eventRecord?.sequence ||
      eventRecord?.retentionClass !== 'mechanical-history' ||
      profileRecord.updatedAt !== eventRecord?.timestamp ||
      evidenceRecord.updatedAt !== eventRecord?.timestamp ||
      eventBody.metadata.stateRevision > slot.value.revision ||
      stateBody.rulesVersion !== slot.value.rulesVersion ||
      stateBody.contentVersion !== slot.value.contentVersion ||
      eventBody.entities.slotId !== slotId ||
      eventBody.metadata.rulesVersion !== stateBody.rulesVersion ||
      eventBody.metadata.contentVersion !== stateBody.contentVersion ||
      eventBody.rollRefs?.length !== expectedRolls.length ||
      eventBody.rollRefs?.every((roll, index) => {
        const expected = expectedRolls[index];
        return (
          expected !== undefined &&
          roll.rollResultId === expected.rollResultId &&
          roll.streamId === expected.streamId &&
          sameValue(roll.naturalDice, expected.naturalDice) &&
          roll.finalValue === expected.finalValue &&
          roll.tableId === expected.tableId &&
          roll.rowId === expected.rowId
        );
      }) !== true ||
      !expectedRolls.every(
        (roll) =>
          randomResults.value.filter(
            (record) =>
              record.slotId === slotId &&
              record.recordType === 'random-result' &&
              record.recordId === roll.rollResultId &&
              sameValue(record.body, roll),
          ).length === 1,
      ) ||
      streamRecord?.recordId !== creationStreamId ||
      !isIsoDate(streamRecord?.updatedAt) ||
      streamBody.streamId !== creationStreamId ||
      streamBody.purpose !== 'adventurer-creation' ||
      streamBody.drawCount !==
        expectedRolls.reduce((count, roll) => count + roll.naturalDice.length, 0) ||
      !sameValue(serializeNamedRandomStream(replay), serializedStream) ||
      randomResults.value
        .filter((record) => expectedRolls.some((roll) => roll.rollResultId === record.recordId))
        .some((record) => !isIsoDate(record.updatedAt)) ||
      snapshot.value.sourceRevision < creationRevision ||
      snapshotCurrentStates.length !== 1 ||
      (snapshotIsCreation && !snapshotCreationRecordsMatch)
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
