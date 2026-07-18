import { applicationLayerName } from '@notequest/application';
import { contentAreaName } from '@notequest/content';
import { domainLayerName } from '@notequest/domain';
import { infrastructureLayerName } from '@notequest/infrastructure';
import { uiLayerName } from '@notequest/ui';
import { compositionRootName } from './composition';

export const architectureLayerNames = [
  domainLayerName,
  applicationLayerName,
  infrastructureLayerName,
  uiLayerName,
  contentAreaName,
  compositionRootName,
] as const;
