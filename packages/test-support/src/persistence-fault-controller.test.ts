import { describe, expect, it } from 'vitest';

import {
  createPersistenceFaultController,
  InjectedPersistenceFault,
  PERSISTENCE_FAULT_POINTS,
  PERSISTENCE_FAULT_SCENARIOS,
} from './persistence-fault-controller';

describe('test-only persistence fault controller', () => {
  it('fires an armed scenario once and identifies the exact point', () => {
    const controller = createPersistenceFaultController();
    controller.arm('snapshot.restore.before-completion');

    expect(() => controller.hit('snapshot.retain.before-completion')).not.toThrow();
    expect(() => controller.hit('snapshot.restore.before-completion')).toThrow(
      new InjectedPersistenceFault('snapshot.restore.before-completion'),
    );
    expect(controller.pending).toBeNull();
    expect(() => controller.hit('snapshot.restore.before-completion')).not.toThrow();
  });

  it('keeps the scenario registry unique for synthetic fixtures', () => {
    expect(new Set(PERSISTENCE_FAULT_POINTS).size).toBe(PERSISTENCE_FAULT_POINTS.length);
  });

  it('does not advertise untruthful post-completion snapshot receipt faults', () => {
    expect(PERSISTENCE_FAULT_POINTS).not.toContain(
      'snapshot.retain.after-completion-before-receipt',
    );
    expect(PERSISTENCE_FAULT_POINTS).not.toContain(
      'snapshot.restore.after-completion-before-receipt',
    );
  });

  it('arms a named quota-like scenario with a machine-readable failure kind', () => {
    const controller = createPersistenceFaultController();
    controller.armScenario(PERSISTENCE_FAULT_SCENARIOS.quotaLikeTransactionFailure);

    expect(controller.pending).toBe('transaction.after-required-writes');
    expect(controller.pendingFailure).toBe('quota_exceeded');
    expect(() => controller.hit('transaction.after-required-writes')).toThrow(
      expect.objectContaining({
        name: 'InjectedPersistenceFault',
        point: 'transaction.after-required-writes',
        failure: 'quota_exceeded',
      }),
    );
  });
});
