import { describe, expect, it } from 'vitest';
import { architectureLayerNames } from './architecture';

const forbiddenDomainDependencyPattern = /(?:from\s+['"][^'"]*(?:react|dexie|workbox|router|service-worker|infrastructure|ui|application|composition)[^'"]*['"]|\b(?:window|document|localStorage|indexedDB|navigator\.serviceWorker)\b)/i;

describe('architecture layer scaffold', () => {
  it('exposes the approved source areas without coupling domain to outer layers', async () => {
    await expect(import('./domain')).resolves.toMatchObject({ domainLayerName: 'domain' });
    await expect(import('./application')).resolves.toMatchObject({ applicationLayerName: 'application' });
    await expect(import('./infrastructure')).resolves.toMatchObject({ infrastructureLayerName: 'infrastructure' });
    await expect(import('./ui')).resolves.toMatchObject({ uiLayerName: 'ui' });
    await expect(import('./content')).resolves.toMatchObject({ contentAreaName: 'content' });
    await expect(import('./composition')).resolves.toMatchObject({ compositionRootName: 'composition' });

    expect(architectureLayerNames).toEqual([
      'domain',
      'application',
      'infrastructure',
      'ui',
      'content',
      'composition',
    ]);
  });

  it('keeps the domain scaffold free of browser, React, routing, and adapter dependencies', () => {
    const domainModules = import.meta.glob('./domain/**/*.{ts,tsx}', {
      query: '?raw',
      import: 'default',
      eager: true,
    });

    expect(Object.keys(domainModules).length).toBeGreaterThan(0);

    for (const [path, source] of Object.entries(domainModules)) {
      expect(source, `${path} must stay pure`).not.toMatch(forbiddenDomainDependencyPattern);
    }
  });
});
