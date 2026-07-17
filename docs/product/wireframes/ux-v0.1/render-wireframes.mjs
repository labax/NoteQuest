import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import wireloom from 'wireloom';

const directory = path.dirname(fileURLToPath(import.meta.url));
const files = (await fs.readdir(directory))
  .filter((file) => file.endsWith('.wireloom'))
  .sort();

for (const file of files) {
  const sourcePath = path.join(directory, file);
  const source = await fs.readFile(sourcePath, 'utf8');
  const id = path.basename(file, '.wireloom');

  const document = wireloom.parse(source);
  const canonical = wireloom.serialize(document);
  if (!canonical.trim()) {
    throw new Error(`Wireloom produced empty canonical source for ${file}`);
  }

  const { svg } = await wireloom.render(id, source, { theme: 'default' });
  await fs.writeFile(path.join(directory, `${id}.svg`), svg, 'utf8');
  console.log(`Rendered ${file}`);
}
