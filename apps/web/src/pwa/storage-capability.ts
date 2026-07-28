import type { StorageCapability } from './update-coordinator';

const WARNING_USAGE_RATIO = 0.7;
const WARNING_REMAINING_BYTES = 20 * 1024 * 1024;

interface StorageManagerLike {
  estimate?(): Promise<{ readonly usage?: number; readonly quota?: number }>;
}

/**
 * Classifies browser storage only after the caller has completed a real app-owned
 * IndexedDB write transaction. Estimate support is optional and never overrides
 * that stronger durability evidence unless it reports an approved warning band.
 */
export async function checkStorageCapability(
  verifyApplicationWrite: () => Promise<void>,
  storage?: StorageManagerLike,
): Promise<StorageCapability> {
  try {
    await verifyApplicationWrite();
  } catch {
    return 'unavailable';
  }
  if (typeof storage?.estimate !== 'function') return 'available';
  try {
    const { usage, quota } = await storage.estimate();
    if (usage === undefined || quota === undefined || quota <= 0) return 'available';
    if (usage / quota >= WARNING_USAGE_RATIO || quota - usage < WARNING_REMAINING_BYTES) {
      return 'limited';
    }
    return 'available';
  } catch {
    return 'available';
  }
}
