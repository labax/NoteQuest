import { domainLayerName } from '@notequest/domain';

export const applicationLayerName = 'application' as const;

export const applicationDependsOn = [domainLayerName] as const;
