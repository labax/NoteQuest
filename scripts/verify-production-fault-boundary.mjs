import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { stdout } from 'node:process';
import { fileURLToPath, URL } from 'node:url';

const productionOutput = fileURLToPath(new URL('../dist/apps/web/', import.meta.url));
const forbiddenFaultControls = [
  'PERSISTENCE_FAULT_SCENARIOS',
  'createPersistenceFaultController',
  'InjectedPersistenceFault',
  'Persistence fault injection is available only',
];
const inspectedExtensions = new Set(['.html', '.js', '.css', '.json', '.map']);

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? filesBelow(path) : [path];
    }),
  );
  return nested.flat();
}

const files = (await filesBelow(productionOutput)).filter((file) =>
  inspectedExtensions.has(extname(file)),
);
if (files.length === 0) throw new Error('Production web output contains no inspectable files.');

for (const file of files) {
  const contents = await readFile(file, 'utf8');
  const forbidden = forbiddenFaultControls.find((identifier) => contents.includes(identifier));
  if (forbidden !== undefined) {
    throw new Error(`Production artifact ${file} contains test fault control ${forbidden}.`);
  }
}

stdout.write(
  `Verified ${files.length} production files contain no test persistence fault controls.\n`,
);
