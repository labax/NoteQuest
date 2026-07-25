import type { SaveSlotId } from '@notequest/domain';

import type {
  ActionCommitEnvelope,
  ActionCommitResult,
  ActionTransactionCoordinator,
} from './action-commit.ts';

/**
 * Serializes mechanical commits per slot while allowing unrelated slots to
 * reach the persistence coordinator independently.
 */
export class PerSlotActionCommitQueue implements ActionTransactionCoordinator {
  private readonly tails = new Map<SaveSlotId, Promise<void>>();

  constructor(private readonly downstream: ActionTransactionCoordinator) {}

  commit(envelope: ActionCommitEnvelope): Promise<ActionCommitResult> {
    const previous = this.tails.get(envelope.slotId) ?? Promise.resolve();
    const result = previous.then(
      () => this.downstream.commit(envelope),
      () => this.downstream.commit(envelope),
    );
    const tail = result.then(
      () => undefined,
      () => undefined,
    );

    this.tails.set(envelope.slotId, tail);
    void tail.finally(() => {
      if (this.tails.get(envelope.slotId) === tail) {
        this.tails.delete(envelope.slotId);
      }
    });

    return result;
  }
}

export function createPerSlotActionCommitQueue(
  downstream: ActionTransactionCoordinator,
): ActionTransactionCoordinator {
  return new PerSlotActionCommitQueue(downstream);
}
