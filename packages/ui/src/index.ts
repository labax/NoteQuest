import { applicationLayerName } from '@notequest/application';

export const uiLayerName = 'ui' as const;

export const uiDependsOn = [applicationLayerName] as const;
