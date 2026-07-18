import { applicationLayerName } from './application';
import { compositionRootName } from './composition';
import { contentAreaName } from './content';
import { domainLayerName } from './domain';
import { infrastructureLayerName } from './infrastructure';
import { uiLayerName } from './ui';

export const architectureLayerNames = [
  domainLayerName,
  applicationLayerName,
  infrastructureLayerName,
  uiLayerName,
  contentAreaName,
  compositionRootName,
] as const;
