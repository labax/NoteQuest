import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { env, stdout } from 'node:process';
import { fileURLToPath, URL } from 'node:url';

const outputDirectory = fileURLToPath(new URL('../dist/apps/web/', import.meta.url));
const releaseId = env.NOTEQUEST_RELEASE_ID ?? env.GITHUB_SHA ?? 'development';
const approvedStaticExtensions = new Set([
  '.css',
  '.html',
  '.ico',
  '.js',
  '.json',
  '.png',
  '.svg',
  '.webmanifest',
  '.woff2',
]);

const fail = (message) => {
  throw new Error(`PWA artifact verification failed: ${message}`);
};

const [indexHtml, serviceWorker] = await Promise.all([
  readFile(join(outputDirectory, 'index.html'), 'utf8'),
  readFile(join(outputDirectory, 'sw.js'), 'utf8'),
]);

if (!serviceWorker.includes(releaseId)) fail(`release id ${JSON.stringify(releaseId)} is absent`);
if (!serviceWorker.includes('NOTEQUEST_ACTIVATE_UPDATE')) {
  fail('controlled activation protocol is absent');
}

const precachedUrls = new Set(
  [...serviceWorker.matchAll(/"url":"([^"]+)"/g)].map((match) => match[1]),
);
if (!precachedUrls.has('index.html')) fail('index.html is not precached');

const shellReferences = new Set(
  [...indexHtml.matchAll(/(?:src|href)="\/?(assets\/[^"]+)"/g)].map((match) => match[1]),
);
if (shellReferences.size === 0) fail('index.html contains no emitted shell asset references');
for (const reference of shellReferences) {
  if (!precachedUrls.has(reference)) fail(`${reference} is referenced by HTML but not precached`);
}

for (const url of precachedUrls) {
  if (!approvedStaticExtensions.has(extname(url))) {
    fail(`${url} is outside the approved static precache extensions`);
  }
}

const emittedFiles = await readdir(outputDirectory, { recursive: true });
if (emittedFiles.some((file) => file.endsWith('.map'))) {
  fail('public source maps were emitted');
}

stdout.write(
  `Verified PWA artifact ${releaseId}: ${precachedUrls.size} approved precache entries, ` +
    `${shellReferences.size} HTML shell assets, controlled activation present.\n`,
);
