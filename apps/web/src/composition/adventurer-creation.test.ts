// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { bundledContentStatus } from '@notequest/content';
import { NOTEQUEST_SLOT_IDS } from '@notequest/infrastructure';

import { createWebComposition } from './index';

afterEach(() => vi.restoreAllMocks());

describe('production adventurer creation composition', () => {
  it('exposes governed content through a durable production creation port', async () => {
    Object.defineProperty(navigator, 'storage', {
      configurable: true,
      value: { persisted: vi.fn().mockResolvedValue(true) },
    });
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
    const composition = await createWebComposition();
    try {
      expect(bundledContentStatus).toBe('authorized-notequest-adventurer-creation-selected');
      const port = composition.services.adventurerCreation;
      expect(port).toBeDefined();
      const result = await port!.create(NOTEQUEST_SLOT_IDS[0], 'Local Hero');
      expect(result).toMatchObject({ ok: true, committed: true, playerAuthoredName: 'Local Hero' });
      await expect(port!.loadCommitted(NOTEQUEST_SLOT_IDS[0])).resolves.toMatchObject({
        kind: 'committed',
        result: { state: result.ok ? result.state : undefined },
      });
      expect(composition.services.updateSafety.getSnapshot()).toMatchObject({
        safePoint: 'durable',
        commandPending: false,
      });
    } finally {
      composition.close();
    }
  });
});
