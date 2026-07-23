import { applicationLayerName } from '@notequest/application';
import { domainLayerName } from '@notequest/domain';

export const infrastructureLayerName = 'infrastructure' as const;

export const infrastructureDependsOn = [applicationLayerName, domainLayerName] as const;

export * from './canonical-json.ts';
export * from './sha256.ts';
export * from './sha256-fixtures.ts';
export * from './persistence/schema';
export * from './persistence/dexie-database';
export * from './persistence/dexie-repositories';
