export const domainLayerName = 'domain' as const;

export type DomainLayerName = typeof domainLayerName;

export * from './primitives/index.ts';
export * from './rng.ts';
