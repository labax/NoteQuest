import type {
  AdventurerId,
  DungeonId,
  EventId,
  ExpeditionId,
  GraveyardRecordId,
  RandomStreamId,
  RollResultId,
  SaveGameStateId,
  SaveSlotId,
  SaveSnapshotId,
} from './ids.ts';
import type { NonNegativeInteger, PositiveInteger } from './validation.ts';

export type SaveSlotStatus = 'empty' | 'playable' | 'invalid' | 'unsupported' | 'import_staging';
export type IntegrityStatus = 'not_checked' | 'valid' | 'invalid' | 'recoverable';
export type ValidationStatus = 'valid' | 'invalid' | 'pending';
export type SnapshotKind = 'current' | 'last_valid' | 'pre_migration' | 'pre_import' | 'staging';
export type RandomStreamKind = 'dungeon' | 'combat' | 'reward' | 'repopulation';
export type InputMode = 'generated' | 'manual';
export type DomainCommandType =
  'create_adventurer' | 'enter_dungeon' | 'resolve_roll' | 'commit_action' | 'restore_snapshot';

export type EventType =
  | 'creation'
  | 'roll'
  | 'generation'
  | 'door'
  | 'trap'
  | 'movement'
  | 'combat'
  | 'item'
  | 'spell'
  | 'town'
  | 'expedition'
  | 'death'
  | 'recovery'
  | 'completion'
  | 'correction'
  | 'import'
  | 'migration';

export interface VersionRef {
  readonly id: string;
  readonly version: string;
}

export interface ContentVersionRef extends VersionRef {
  readonly hash?: string;
}

export interface SaveSlotCore {
  readonly slotId: SaveSlotId;
  readonly slotIndex: 1 | 2 | 3;
  readonly displayName: string;
  readonly status: SaveSlotStatus;
  readonly currentSnapshotId: SaveSnapshotId | null;
  readonly lastValidSnapshotId: SaveSnapshotId | null;
  readonly schemaVersion: PositiveInteger | null;
  readonly rulesVersion: string | null;
  readonly contentVersionSet: readonly ContentVersionRef[];
  readonly integrityStatus: IntegrityStatus;
  readonly recoveryAvailable: boolean;
}

export interface SaveGameStateCore {
  readonly gameStateId: SaveGameStateId;
  readonly slotId: SaveSlotId;
  readonly activeAdventurerId: AdventurerId | null;
  readonly activeExpeditionId: ExpeditionId | null;
  readonly dungeonIds: readonly DungeonId[];
  readonly graveyardRecordIds: readonly GraveyardRecordId[];
  readonly randomStreamIds: Readonly<Record<RandomStreamKind, RandomStreamId>>;
  readonly nextEventSequence: PositiveInteger;
  readonly rulesVersion: string;
  readonly contentVersionSet: readonly ContentVersionRef[];
}

export interface SaveSnapshotCore {
  readonly snapshotId: SaveSnapshotId;
  readonly slotId: SaveSlotId;
  readonly kind: SnapshotKind;
  readonly stateRootId: SaveGameStateId;
  readonly schemaVersion: PositiveInteger;
  readonly rulesVersion: string;
  readonly contentVersionSet: readonly ContentVersionRef[];
  readonly eventSequence: NonNegativeInteger;
  readonly reason: string;
  readonly validationStatus: ValidationStatus;
}

export interface DomainCommandCore {
  readonly commandType: DomainCommandType;
  readonly slotId: SaveSlotId;
  readonly expectedEventSequence: PositiveInteger;
}

export interface RandomStreamStateCore {
  readonly streamId: RandomStreamId;
  readonly slotId: SaveSlotId;
  readonly kind: RandomStreamKind;
  readonly algorithmId: string;
  readonly algorithmVersion: string;
  readonly seedMaterial: string;
  readonly state: string;
  readonly drawCount: NonNegativeInteger;
}

export interface EventEntryCore {
  readonly eventId: EventId;
  readonly sequence: PositiveInteger;
  readonly eventType: EventType;
  readonly slotId: SaveSlotId;
  readonly rulesVersion: string;
}

export interface RollResultCore {
  readonly rollResultId: RollResultId;
  readonly slotId: SaveSlotId;
  readonly streamKind: RandomStreamKind | null;
  readonly streamDrawStart: NonNegativeInteger | null;
  readonly naturalDice: readonly (1 | 2 | 3 | 4 | 5 | 6)[];
  readonly inputMode: InputMode;
  readonly tableId: string | null;
  readonly tableRowId: string | null;
  readonly finalValue: number | null;
  readonly rulesVersion: string;
}
