import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const workspacePackages = [
  '@notequest/domain',
  '@notequest/application',
  '@notequest/infrastructure',
  '@notequest/content',
  '@notequest/ui',
  '@notequest/test-support',
  '@notequest/web',
] as const;

const forbiddenDomainDependencyPattern = /(?:from\s+['"][^'"]*(?:react|dexie|workbox|router|service-worker|infrastructure|ui|application|apps\/web)[^'"]*['"]|\b(?:window|document|localStorage|indexedDB|navigator\.serviceWorker)\b)/i;

function walkFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? walkFiles(path) : [path];
  });
}

describe('architecture workspace scaffold', () => {
  it('declares the approved npm workspace globs and packages', () => {
    const rootPackage = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

    expect(rootPackage.workspaces).toEqual(['apps/*', 'packages/*']);

    for (const packageName of workspacePackages) {
      const manifestPath = packageName === '@notequest/web'
        ? join(root, 'apps/web/package.json')
        : join(root, `packages/${packageName.replace('@notequest/', '')}/package.json`);
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

      expect(manifest.name).toBe(packageName);
      expect(manifest.exports).toBeDefined();
    }
  });

  it('keeps shared layers in packages and web composition in apps/web', () => {
    for (const workspace of ['domain', 'application', 'infrastructure', 'content', 'ui', 'test-support']) {
      expect(existsSync(join(root, 'packages', workspace, 'src/index.ts'))).toBe(true);
      expect(existsSync(join(root, 'packages', workspace, 'README.md'))).toBe(true);
    }

    expect(existsSync(join(root, 'apps/web/src/composition/index.ts'))).toBe(true);
    expect(existsSync(join(root, 'src/domain'))).toBe(false);
    expect(existsSync(join(root, 'src/application'))).toBe(false);
    expect(existsSync(join(root, 'src/infrastructure'))).toBe(false);
    expect(existsSync(join(root, 'src/ui'))).toBe(false);
    expect(existsSync(join(root, 'src/content'))).toBe(false);
    expect(existsSync(join(root, 'src/composition'))).toBe(false);
  });

  it('exposes workspace package entrypoints and web composition without circular inward imports', async () => {
    await expect(import('@notequest/domain')).resolves.toMatchObject({ domainLayerName: 'domain' });
    await expect(import('@notequest/application')).resolves.toMatchObject({ applicationLayerName: 'application' });
    await expect(import('@notequest/infrastructure')).resolves.toMatchObject({ infrastructureLayerName: 'infrastructure' });
    await expect(import('@notequest/ui')).resolves.toMatchObject({ uiLayerName: 'ui' });
    await expect(import('@notequest/content')).resolves.toMatchObject({ contentAreaName: 'content' });
    await expect(import('@notequest/test-support')).resolves.toMatchObject({ testSupportPackageName: 'test-support' });
    await expect(import('../apps/web/src/architecture')).resolves.toMatchObject({
      architectureLayerNames: ['domain', 'application', 'infrastructure', 'ui', 'content', 'web-composition'],
    });
  });

  it('keeps domain package sources free of browser, React, routing, and adapter dependencies', () => {
    const domainSource = join(root, 'packages/domain/src');
    const domainModules = walkFiles(domainSource).filter((path) => /\.tsx?$/.test(path));

    expect(domainModules.length).toBeGreaterThan(0);

    for (const path of domainModules) {
      const source = readFileSync(path, 'utf8');
      expect(source, `${relative(root, path)} must stay pure`).not.toMatch(forbiddenDomainDependencyPattern);
    }
  });
});
