// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NOTEQUEST_SLOT_IDS } from '@notequest/infrastructure';

import { createWebComposition } from './index';

afterEach(() => vi.restoreAllMocks());

describe('production adventurer creation composition', () => {
  it('exposes a durable Dexie-backed creation port with approved versioned content', async () => {
    Object.defineProperty(navigator, 'storage', {
      configurable: true,
      value: { persisted: vi.fn().mockResolvedValue(true) },
    });
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
    const composition = await createWebComposition();
    try {
      const port = composition.services.adventurerCreation;
      expect(port).toBeDefined();
      const result = await port!.create(NOTEQUEST_SLOT_IDS[0], 'Local Hero');
      expect(result).toMatchObject({
        ok: true,
        committed: true,
        playerAuthoredName: 'Local Hero',
        state: {
          rulesVersion: 'digital-rules-specification-v0.1',
          contentVersion: '0.1.0',
        },
      });
      await expect(port!.loadCommitted(NOTEQUEST_SLOT_IDS[0])).resolves.toMatchObject({
        ok: true,
        state: result.ok ? result.state : undefined,
        evidence: result.ok ? result.evidence : undefined,
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
