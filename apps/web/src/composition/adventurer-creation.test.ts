// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { bundledContentStatus } from '@notequest/content';

import { createWebComposition } from './index';

afterEach(() => vi.restoreAllMocks());

describe('production adventurer creation composition', () => {
  it('keeps source-derived creation unavailable until a governed content package is approved', async () => {
    Object.defineProperty(navigator, 'storage', {
      configurable: true,
      value: { persisted: vi.fn().mockResolvedValue(true) },
    });
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
    const composition = await createWebComposition();
    try {
      expect(bundledContentStatus).toBe('no-approved-content-packages-yet');
      expect(composition.services.adventurerCreation).toBeUndefined();
    } finally {
      composition.close();
    }
  });
});
