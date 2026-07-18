import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
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

const forbiddenImportSpecifiers = [
  /^react(?:$|-|\/)/,
  /^react-dom(?:$|\/)/,
  /^jsx-runtime$/,
  /^@notequest\/(?:application|infrastructure|ui|content|web)(?:$|\/)/,
  /^apps\/web(?:$|\/)/,
  /(?:^|\/)composition(?:$|\/)/,
  /^dexie(?:$|\/)/,
  /^workbox(?:$|-|\/)/,
  /(?:^|\/)(?:router|routing|routes)(?:$|\/)/,
  /(?:^|[-/])service-worker(?:$|[-/])/,
  /(?:^|\/)(?:storage|indexeddb|idb|localforage)(?:$|\/)/,
  /^vitest(?:$|\/)/,
  /^@testing-library(?:$|\/)/,
  /^playwright(?:$|\/)/,
  /^@playwright\/test$/,
];

const forbiddenGlobals = [
  'window',
  'document',
  'localStorage',
  'sessionStorage',
  'indexedDB',
  'caches',
  'navigator',
  'fetch',
  'WebSocket',
  'EventSource',
  'XMLHttpRequest',
  'setTimeout',
  'clearTimeout',
  'setInterval',
  'clearInterval',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'requestIdleCallback',
  'cancelIdleCallback',
  'describe',
  'it',
  'test',
  'expect',
  'vi',
];

const forbiddenDomainSourceFileNamePattern = /(?:^|[.-])(?:test|spec|fixture|fixtures|testing)(?:[.-]|$)|(?:^|[.-])test-?helpers?(?:[.-]|$)/i;

const staticImportPattern = /import\s+(?:type\s+)?(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/g;
const dynamicImportPattern = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

function walkFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? walkFiles(path) : [path];
  });
}

function findForbiddenDomainDependencyViolations(source: string, path = 'packages/domain/src/index.ts'): string[] {
  const violations: string[] = [];
  const fileName = basename(path);

  if (forbiddenDomainSourceFileNamePattern.test(fileName)) {
    violations.push(`test-only domain source file name: ${fileName}`);
  }

  for (const pattern of [staticImportPattern, dynamicImportPattern]) {
    pattern.lastIndex = 0;
    for (const match of source.matchAll(pattern)) {
      const specifier = match[1];

      if (specifier !== undefined && forbiddenImportSpecifiers.some((forbidden) => forbidden.test(specifier))) {
        violations.push(`forbidden import: ${specifier}`);
      }
    }
  }

  for (const globalName of forbiddenGlobals) {
    const globalPattern = new RegExp(`(?<![\\w$.'"])${globalName}(?![\\w$])`);

    if (globalPattern.test(source)) {
      violations.push(`forbidden global: ${globalName}`);
    }
  }

  return violations;
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

  it('detects each documented forbidden domain dependency category', () => {
    const forbiddenExamples = [
      ['React import', "import React from 'react';\nexport const value = React;"],
      ['JSX runtime import', "import { jsx } from 'react/jsx-runtime';\nexport const value = jsx;"],
      ['side-effect import', "import 'react';\nexport const value = 'bad';"],
      ['application package import', "import { applicationLayerName } from '@notequest/application';\nexport const value = applicationLayerName;"],
      ['infrastructure package import', "import '@notequest/infrastructure';\nexport const value = 'bad';"],
      ['ui package import', "import type { ComponentType } from '@notequest/ui';\nexport type Value = ComponentType;"],
      ['content package import', "import { contentAreaName } from '@notequest/content';\nexport const value = contentAreaName;"],
      ['web package import', "import { architectureLayerNames } from '@notequest/web';\nexport const value = architectureLayerNames;"],
      ['apps/web import', "import { App } from 'apps/web/src/App';\nexport const value = App;"],
      ['composition import', "import { compositionRootName } from '../../apps/web/src/composition';\nexport const value = compositionRootName;"],
      ['Dexie import', "import Dexie from 'dexie';\nexport const value = Dexie;"],
      ['Workbox import', "import 'workbox-precaching';\nexport const value = 'bad';"],
      ['router import', "import { createBrowserRouter } from 'react-router-dom';\nexport const value = createBrowserRouter;"],
      ['service-worker import', "import { registerSW } from 'virtual:pwa-register/service-worker';\nexport const value = registerSW;"],
      ['browser storage adapter import', "import { openDB } from 'idb';\nexport const value = openDB;"],
      ['dynamic forbidden import', "export async function load() { return import('@notequest/content'); }"],
      ['browser globals', 'export const value = window.location.href + document.title + localStorage.length + sessionStorage.length + indexedDB;'],
      ['cache and service-worker globals', 'export const value = caches && navigator.serviceWorker;'],
      ['network APIs', 'export const value = [fetch, WebSocket, EventSource, XMLHttpRequest];'],
      ['timer APIs', 'export const value = [setTimeout, clearTimeout, setInterval, clearInterval, requestAnimationFrame, cancelAnimationFrame, requestIdleCallback, cancelIdleCallback];'],
      ['test import', "import { describe, expect, it, vi } from 'vitest';\nexport const value = [describe, expect, it, vi];"],
      ['Testing Library import', "import { render } from '@testing-library/react';\nexport const value = render;"],
      ['test globals', 'describe("domain", () => { it("fails", () => expect(vi.fn()).toBeDefined()); });'],
    ] as const;

    for (const [label, source] of forbiddenExamples) {
      expect(findForbiddenDomainDependencyViolations(source), label).not.toEqual([]);
    }

    expect(findForbiddenDomainDependencyViolations('export const value = 1 as const;')).toEqual([]);
    expect(findForbiddenDomainDependencyViolations("import { value } from './value';\nexport const copy = value;")).toEqual([]);
    expect(findForbiddenDomainDependencyViolations("import type { Value } from './value';\nexport type Copy = Value;")).toEqual([]);
    expect(findForbiddenDomainDependencyViolations('export const helper = true;', 'packages/domain/src/test-helper.ts')).not.toEqual([]);
  });

  it('keeps domain package sources free of browser, React, routing, and adapter dependencies', () => {
    const domainSource = join(root, 'packages/domain/src');
    const domainModules = walkFiles(domainSource).filter((path) => /\.tsx?$/.test(path));

    expect(domainModules.length).toBeGreaterThan(0);

    for (const path of domainModules) {
      const source = readFileSync(path, 'utf8');
      expect(findForbiddenDomainDependencyViolations(source, path), `${relative(root, path)} must stay pure`).toEqual([]);
    }
  });
});
