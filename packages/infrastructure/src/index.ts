import { applicationLayerName } from '@notequest/application';
import { domainLayerName } from '@notequest/domain';

export const infrastructureLayerName = 'infrastructure' as const;

export const infrastructureDependsOn = [applicationLayerName, domainLayerName] as const;

export * from './canonical-json.ts';
