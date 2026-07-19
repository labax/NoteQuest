import { describe, expect, it } from 'vitest';
import { domainLayerName } from './index.ts';

function formatScaffoldLabel(layerName: string): string {
  return `NoteQuest ${layerName} scaffold`;
}

describe('domain scaffold', () => {
  it('runs pure TypeScript utility assertions without browser APIs', () => {
    expect(formatScaffoldLabel(domainLayerName)).toBe('NoteQuest domain scaffold');
  });
});
