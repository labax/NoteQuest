import { describe, expect, it } from 'vitest';

import { SHELL_NOTICE_STATUS, shellNotices } from './shell-notices';

describe('offline shell notice inventory', () => {
  it('contains one clearly marked record for every placeholder concern', () => {
    expect(shellNotices.map(({ id }) => id)).toEqual([
      'project-status',
      'source-rights',
      'third-party',
      'storage',
      'privacy',
      'feedback',
    ]);
    expect(shellNotices.every(({ status }) => status === SHELL_NOTICE_STATUS)).toBe(true);
    expect(shellNotices.every(({ paragraphs }) => paragraphs.length > 0)).toBe(true);
  });
});
