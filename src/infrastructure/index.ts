import { applicationLayerName } from '../application';
import { domainLayerName } from '../domain';

export const infrastructureLayerName = 'infrastructure' as const;

export const infrastructureDependsOn = [applicationLayerName, domainLayerName] as const;
