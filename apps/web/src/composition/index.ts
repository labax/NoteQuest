import { applicationLayerName } from '@notequest/application';
import { contentAreaName } from '@notequest/content';
import { infrastructureLayerName } from '@notequest/infrastructure';
import { uiLayerName } from '@notequest/ui';

export const compositionRootName = 'web-composition' as const;

export const webCompositionLayers = [
  applicationLayerName,
  infrastructureLayerName,
  uiLayerName,
  contentAreaName,
] as const;
