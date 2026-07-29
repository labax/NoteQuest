import { domainLayerName } from '@notequest/domain';

export const applicationLayerName = 'application' as const;

export const applicationDependsOn = [domainLayerName] as const;

export * from './repositories.ts';
export * from './action-commit.ts';
export * from './action-commit-queue.ts';
export * from './save-slots.ts';
export * from './update-safety.ts';
