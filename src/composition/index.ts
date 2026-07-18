import { applicationLayerName } from '../application';
import { contentAreaName } from '../content';
import { infrastructureLayerName } from '../infrastructure';
import { uiLayerName } from '../ui';

export const compositionRootName = 'composition' as const;

export const webCompositionLayers = [
  applicationLayerName,
  infrastructureLayerName,
  uiLayerName,
  contentAreaName,
] as const;
