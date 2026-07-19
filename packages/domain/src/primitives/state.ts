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

// Data/domain model v0.1 section 11 controls these enum-like primitive values.
export type SaveSlotStatus =
  'empty' | 'creating' | 'ready' | 'active' | 'importing' | 'migrating' | 'isolated' | 'resetting';
export type SnapshotKind =
  | 'current'
  | 'last_valid'
  | 'pre_migration'
  | 'pre_import'
  | 'import_staging'
  | 'migration_staging'
  | 'manual_backup';
export type IntegrityStatus =
  'not_checked' | 'valid' | 'warning' | 'invalid' | 'unsupported_newer_version';
export type ValidationStatus = 'valid' | 'invalid' | 'pending';
export type RandomStreamKind = 'dungeon' | 'combat' | 'reward' | 'repopulation';
export type InputMode = 'generated' | 'manual_physical_dice';
export type EventCategory =
  | 'system'
  | 'creation'
  | 'generation'
  | 'exploration'
  | 'door'
  | 'trap'
  | 'stealth'
  | 'combat'
  | 'spell'
  | 'inventory'
  | 'reward'
  | 'town'
  | 'expedition'
  | 'death'
  | 'recovery'
  | 'graveyard'
  | 'save'
  | 'migration'
  | 'import'
  | 'correction'
  | 'completion';

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
  readonly actionType: string;
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
  readonly eventCategory: EventCategory;
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
