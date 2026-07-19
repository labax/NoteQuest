import { invalid, valid, type DomainResult } from './result.ts';

export type Brand<K, T extends string> = K & { readonly __brand: T };

export type WorkspaceId = Brand<'workspace.local', 'WorkspaceId'>;
export type SaveSlotId = Brand<string, 'SaveSlotId'>;
export type SaveSnapshotId = Brand<string, 'SaveSnapshotId'>;
export type SaveGameStateId = Brand<string, 'SaveGameStateId'>;
export type RandomStreamId = Brand<string, 'RandomStreamId'>;
export type RollResultId = Brand<string, 'RollResultId'>;
export type EventId = Brand<string, 'EventId'>;
export type AdventurerId = Brand<string, 'AdventurerId'>;
export type DungeonId = Brand<string, 'DungeonId'>;
export type DungeonFloorId = Brand<string, 'DungeonFloorId'>;
export type DungeonSegmentId = Brand<string, 'DungeonSegmentId'>;
export type DungeonConnectionId = Brand<string, 'DungeonConnectionId'>;
export type ExpeditionId = Brand<string, 'ExpeditionId'>;
export type EncounterId = Brand<string, 'EncounterId'>;
export type ItemInstanceId = Brand<string, 'ItemInstanceId'>;
export type MonsterInstanceId = Brand<string, 'MonsterInstanceId'>;
export type GraveyardRecordId = Brand<string, 'GraveyardRecordId'>;
export type RecoverableContainerId = Brand<string, 'RecoverableContainerId'>;
export type DefinitionId = Brand<string, 'DefinitionId'>;

const runtimeIdPattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*_[a-zA-Z0-9_-]{8,}$/;
const definitionIdPattern = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*\.[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/;

export const workspaceLocalId = 'workspace.local' as WorkspaceId;

export function createRuntimeId<T extends Brand<string, string>>(
  value: string,
  path: string,
): DomainResult<T> {
  if (!runtimeIdPattern.test(value)) {
    return invalid({
      code: 'invalid_format',
      path,
      message: `${path} must be an opaque runtime ID with a type prefix and at least 8 token characters`,
    });
  }

  return valid(value as T);
}

export function createDefinitionId(value: string, path: string): DomainResult<DefinitionId> {
  if (!definitionIdPattern.test(value)) {
    return invalid({
      code: 'invalid_format',
      path,
      message: `${path} must be a stable namespaced definition ID`,
    });
  }

  return valid(value as DefinitionId);
}
