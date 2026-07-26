import 'fake-indexeddb/auto';

import { describe, expect, it, vi } from 'vitest';

import * as infrastructure from '@notequest/infrastructure';
import {
  createNoteQuestDatabase,
  DexieActionTransactionCoordinator,
  DexieSnapshotService,
} from '@notequest/infrastructure';
import { createPersistenceFaultController } from '@notequest/test-support';

describe('production persistence fault boundary', () => {
  it('does not expose fault controls from the production infrastructure entrypoint', () => {
    expect(infrastructure).not.toHaveProperty('createPersistenceFaultController');
    expect(infrastructure).not.toHaveProperty('PERSISTENCE_FAULT_SCENARIOS');
    expect(infrastructure).not.toHaveProperty('InjectedPersistenceFault');
  });

  it('constructs normal production adapters without a fault dependency', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const database = await createNoteQuestDatabase('notequest-production-boundary-normal');
    try {
      expect(() => new DexieActionTransactionCoordinator(database)).not.toThrow();
      expect(() => new DexieSnapshotService(database)).not.toThrow();
    } finally {
      database.close();
      await database.delete();
      vi.unstubAllEnvs();
    }
  });

  it('rejects every test control at production adapter and controller boundaries', async () => {
    const testHook = { hit: () => undefined };
    vi.stubEnv('NODE_ENV', 'production');
    const database = await createNoteQuestDatabase('notequest-production-boundary-rejection');
    try {
      expect(
        () => new DexieActionTransactionCoordinator(database, {}, undefined, testHook),
      ).toThrow('Persistence fault hooks cannot be enabled outside a test process.');
      expect(() => new DexieSnapshotService(database, undefined, testHook)).toThrow(
        'Persistence fault hooks cannot be enabled outside a test process.',
      );
      expect(() => createPersistenceFaultController()).toThrow(
        'Persistence fault injection is available only in test processes.',
      );
    } finally {
      database.close();
      await database.delete();
      vi.unstubAllEnvs();
    }
  });
});
