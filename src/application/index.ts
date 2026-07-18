import { domainLayerName } from '../domain';

export const applicationLayerName = 'application' as const;

export const applicationDependsOn = [domainLayerName] as const;
