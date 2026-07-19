import type {
  AdventurerId,
  DefinitionId,
  DungeonId,
  DungeonSegmentId,
  EncounterId,
  EventId,
  ExpeditionId,
  ItemInstanceId,
  MonsterInstanceId,
  RandomStreamId,
  RollResultId,
  SaveSlotId,
} from '../primitives/index.ts';

export type CommandId = string & { readonly __brand: 'CommandId' };
export type CorrelationId = string & { readonly __brand: 'CorrelationId' };
export type IdempotencyKey = string & { readonly __brand: 'IdempotencyKey' };
export type RulesVersion = string & { readonly __brand: 'RulesVersion' };
export type ContentVersion = string & { readonly __brand: 'ContentVersion' };
export type IsoDateTimeString = string & { readonly __brand: 'IsoDateTimeString' };
export type EventSequence = number & { readonly __brand: 'EventSequence' };

export type ActionModule =
  'adventurer' | 'dungeon' | 'exploration' | 'combat' | 'inventory' | 'town' | 'persistence';

export type ActionVerb =
  | 'create_adventurer'
  | 'enter_dungeon'
  | 'move_to_segment'
  | 'resolve_door'
  | 'attack_monster'
  | 'cast_spell'
  | 'use_item'
  | 'equip_item'
  | 'drop_item'
  | 'retreat_to_town'
  | 'rest_in_town';

export interface CommandMetadata {
  readonly commandId: CommandId;
  readonly idempotencyKey?: IdempotencyKey;
  readonly correlationId?: CorrelationId;
  readonly issuedAt?: IsoDateTimeString;
  readonly expectedStateRevision?: number;
}

export interface CommandBase<TType extends ActionVerb> {
  readonly type: TType;
  readonly module: ActionModule;
  readonly slotId: SaveSlotId;
  readonly actorId?: AdventurerId;
  readonly metadata: CommandMetadata;
}

export interface CreateAdventurerCommand extends CommandBase<'create_adventurer'> {
  readonly module: 'adventurer';
  readonly playerAuthoredName?: string;
  readonly creationMode: 'canonical_random' | 'manual_test_fixture';
}

export interface EnterDungeonCommand extends CommandBase<'enter_dungeon'> {
  readonly module: 'dungeon';
  readonly actorId: AdventurerId;
  readonly dungeonDefinitionId: DefinitionId;
}

export interface MoveToSegmentCommand extends CommandBase<'move_to_segment'> {
  readonly module: 'exploration';
  readonly actorId: AdventurerId;
  readonly expeditionId: ExpeditionId;
  readonly fromSegmentId: DungeonSegmentId;
  readonly toSegmentId: DungeonSegmentId;
}

export interface ResolveDoorCommand extends CommandBase<'resolve_door'> {
  readonly module: 'exploration';
  readonly actorId: AdventurerId;
  readonly expeditionId: ExpeditionId;
  readonly doorId: string;
  readonly approach: 'open' | 'unlock_with_key' | 'break' | 'inspect_for_trap';
}

export interface AttackMonsterCommand extends CommandBase<'attack_monster'> {
  readonly module: 'combat';
  readonly actorId: AdventurerId;
  readonly encounterId: EncounterId;
  readonly targetId: MonsterInstanceId;
  readonly weaponId?: ItemInstanceId;
}

export interface CastSpellCommand extends CommandBase<'cast_spell'> {
  readonly module: 'combat';
  readonly actorId: AdventurerId;
  readonly encounterId?: EncounterId;
  readonly spellDefinitionId: DefinitionId;
  readonly targetId?: MonsterInstanceId | AdventurerId | DungeonSegmentId;
}

export interface UseItemCommand extends CommandBase<'use_item'> {
  readonly module: 'inventory' | 'combat' | 'exploration';
  readonly actorId: AdventurerId;
  readonly itemId: ItemInstanceId;
  readonly targetId?: MonsterInstanceId | AdventurerId | DungeonSegmentId;
}

export interface EquipItemCommand extends CommandBase<'equip_item'> {
  readonly module: 'inventory';
  readonly actorId: AdventurerId;
  readonly itemId: ItemInstanceId;
  readonly slot: 'weapon_hand' | 'off_hand' | 'armour';
}

export interface DropItemCommand extends CommandBase<'drop_item'> {
  readonly module: 'inventory';
  readonly actorId: AdventurerId;
  readonly itemId: ItemInstanceId;
  readonly locationId: DungeonSegmentId;
}

export interface RetreatToTownCommand extends CommandBase<'retreat_to_town'> {
  readonly module: 'town';
  readonly actorId: AdventurerId;
  readonly expeditionId: ExpeditionId;
}

export interface RestInTownCommand extends CommandBase<'rest_in_town'> {
  readonly module: 'town';
  readonly actorId: AdventurerId;
}

export type MechanicalCommand =
  | CreateAdventurerCommand
  | EnterDungeonCommand
  | MoveToSegmentCommand
  | ResolveDoorCommand
  | AttackMonsterCommand
  | CastSpellCommand
  | UseItemCommand
  | EquipItemCommand
  | DropItemCommand
  | RetreatToTownCommand
  | RestInTownCommand;

export type GuardSeverity = 'info' | 'warning' | 'blocker';

export interface GuardCheck {
  readonly code: string;
  readonly message: string;
  readonly satisfied: boolean;
  readonly severity: GuardSeverity;
  readonly requirementIds?: readonly string[];
  readonly entityIds?: readonly string[];
}

export interface GuardEvaluation {
  readonly commandId: CommandId;
  readonly legal: boolean;
  readonly checks: readonly GuardCheck[];
}

export type ValidationIssueSeverity = 'error' | 'warning';

export interface ValidationIssue {
  readonly code: string;
  readonly path: string;
  readonly message: string;
  readonly severity: ValidationIssueSeverity;
}

export type ResultStatus = 'success' | 'failure' | 'validation_error' | 'blocked';

export interface CommandResultBase<TStatus extends ResultStatus> {
  readonly status: TStatus;
  readonly commandId: CommandId;
  readonly correlationId?: CorrelationId;
}

export interface SuccessResult<
  TEvent extends MechanicalEvent = MechanicalEvent,
> extends CommandResultBase<'success'> {
  readonly committed: true;
  readonly stateRevision: number;
  readonly events: readonly TEvent[];
}

export interface FailureResult extends CommandResultBase<'failure'> {
  readonly committed: false;
  readonly reason: 'conflict' | 'missing_state' | 'rules_gap' | 'unexpected_domain_failure';
  readonly message: string;
  readonly retryable: boolean;
}

export interface ValidationErrorResult extends CommandResultBase<'validation_error'> {
  readonly committed: false;
  readonly issues: readonly ValidationIssue[];
}

export interface BlockedResult extends CommandResultBase<'blocked'> {
  readonly committed: false;
  readonly guard: GuardEvaluation;
}

export type CommandResult<TEvent extends MechanicalEvent = MechanicalEvent> =
  SuccessResult<TEvent> | FailureResult | ValidationErrorResult | BlockedResult;

export interface EventMetadata {
  readonly eventId: EventId;
  readonly sequence: EventSequence;
  readonly commandId: CommandId;
  readonly correlationId?: CorrelationId;
  readonly occurredAt: IsoDateTimeString;
  readonly rulesVersion: RulesVersion;
  readonly contentVersion: ContentVersion;
  readonly stateRevision: number;
  readonly schemaVersion: 1;
}

export interface CommitMetadata {
  readonly committedAt: IsoDateTimeString;
  readonly stateRevisionBefore: number;
  readonly stateRevisionAfter: number;
  readonly eventIds: readonly EventId[];
}

export interface RollReference {
  readonly rollResultId: RollResultId;
  readonly streamId: RandomStreamId;
  readonly naturalDice: readonly number[];
  readonly finalValue: number;
  readonly tableId?: DefinitionId;
  readonly rowId?: DefinitionId;
  readonly manualEntry: boolean;
}

export interface EventEntityRefs {
  readonly slotId: SaveSlotId;
  readonly adventurerId?: AdventurerId;
  readonly dungeonId?: DungeonId;
  readonly expeditionId?: ExpeditionId;
  readonly encounterId?: EncounterId;
  readonly segmentIds?: readonly DungeonSegmentId[];
  readonly itemIds?: readonly ItemInstanceId[];
  readonly monsterIds?: readonly MonsterInstanceId[];
}

export interface MechanicalEventBase<TType extends string> {
  readonly type: TType;
  readonly module: ActionModule;
  readonly metadata: EventMetadata;
  readonly entities: EventEntityRefs;
  readonly summary: string;
  readonly requirementIds?: readonly string[];
  readonly rollRefs?: readonly RollReference[];
  readonly before?: Record<string, unknown>;
  readonly after?: Record<string, unknown>;
}

export interface AdventurerCreatedEvent extends MechanicalEventBase<'adventurer_created'> {
  readonly module: 'adventurer';
  readonly adventurerId: AdventurerId;
}

export interface DungeonEnteredEvent extends MechanicalEventBase<'dungeon_entered'> {
  readonly module: 'dungeon';
  readonly dungeonId: DungeonId;
  readonly expeditionId: ExpeditionId;
}

export interface SegmentMovedEvent extends MechanicalEventBase<'segment_moved'> {
  readonly module: 'exploration';
  readonly fromSegmentId: DungeonSegmentId;
  readonly toSegmentId: DungeonSegmentId;
}

export interface DoorResolvedEvent extends MechanicalEventBase<'door_resolved'> {
  readonly module: 'exploration';
  readonly doorId: string;
  readonly outcome: 'opened' | 'unlocked' | 'broken' | 'trap_triggered' | 'left_closed';
}

export interface CombatActionResolvedEvent extends MechanicalEventBase<'combat_action_resolved'> {
  readonly module: 'combat';
  readonly encounterId: EncounterId;
  readonly targetId?: MonsterInstanceId | AdventurerId;
  readonly outcome: 'hit' | 'miss' | 'damage_applied' | 'defeated' | 'escaped' | 'no_effect';
}

export interface InventoryChangedEvent extends MechanicalEventBase<'inventory_changed'> {
  readonly module: 'inventory';
  readonly itemId: ItemInstanceId;
  readonly outcome: 'equipped' | 'used' | 'dropped' | 'destroyed' | 'recovered' | 'sold' | 'bought';
}

export interface TownActionResolvedEvent extends MechanicalEventBase<'town_action_resolved'> {
  readonly module: 'town';
  readonly outcome: 'rested' | 'repaired' | 'resupplied' | 'sold_items' | 'retreated';
}

export interface PersistenceCommittedEvent extends MechanicalEventBase<'persistence_committed'> {
  readonly module: 'persistence';
  readonly commit: CommitMetadata;
}

export type MechanicalEvent =
  | AdventurerCreatedEvent
  | DungeonEnteredEvent
  | SegmentMovedEvent
  | DoorResolvedEvent
  | CombatActionResolvedEvent
  | InventoryChangedEvent
  | TownActionResolvedEvent
  | PersistenceCommittedEvent;

export function isCommandBlocked(guard: GuardEvaluation): boolean {
  return (
    !guard.legal || guard.checks.some((check) => !check.satisfied && check.severity === 'blocker')
  );
}

export function blockedResult(command: MechanicalCommand, guard: GuardEvaluation): BlockedResult {
  return {
    status: 'blocked',
    commandId: command.metadata.commandId,
    ...(command.metadata.correlationId === undefined
      ? {}
      : { correlationId: command.metadata.correlationId }),
    committed: false,
    guard,
  };
}

export function validationErrorResult(
  command: MechanicalCommand,
  issues: readonly ValidationIssue[],
): ValidationErrorResult {
  return {
    status: 'validation_error',
    commandId: command.metadata.commandId,
    ...(command.metadata.correlationId === undefined
      ? {}
      : { correlationId: command.metadata.correlationId }),
    committed: false,
    issues,
  };
}

export function successResult<TEvent extends MechanicalEvent>(
  command: MechanicalCommand,
  stateRevision: number,
  events: readonly TEvent[],
): SuccessResult<TEvent> {
  return {
    status: 'success',
    commandId: command.metadata.commandId,
    ...(command.metadata.correlationId === undefined
      ? {}
      : { correlationId: command.metadata.correlationId }),
    committed: true,
    stateRevision,
    events,
  };
}
