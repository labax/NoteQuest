import type { StorageCapability } from './update-coordinator';

const WARNING_USAGE_RATIO = 0.7;
const WARNING_REMAINING_BYTES = 20 * 1024 * 1024;

interface StorageManagerLike {
  estimate?(): Promise<{ readonly usage?: number; readonly quota?: number }>;
}

type BoundedResult<T> =
  { readonly completed: true; readonly value: T } | { readonly completed: false };

async function settleWithin<T>(promise: Promise<T>, timeoutMs: number): Promise<BoundedResult<T>> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise.then(
        (value): BoundedResult<T> => ({ completed: true, value }),
        (): BoundedResult<T> => ({ completed: false }),
      ),
      new Promise<BoundedResult<T>>((resolve) => {
        timeout = setTimeout(() => resolve({ completed: false }), timeoutMs);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

/**
 * Classifies browser storage only after the caller has completed a real app-owned
 * IndexedDB write transaction. Estimate support is optional and never overrides
 * that stronger durability evidence unless it reports an approved warning band.
 */
export async function checkStorageCapability(
  verifyApplicationWrite: () => Promise<void>,
  storage?: StorageManagerLike,
  options: { readonly timeoutMs?: number } = {},
): Promise<StorageCapability> {
  const timeoutMs = options.timeoutMs ?? 5_000;
  const write = await settleWithin(Promise.resolve().then(verifyApplicationWrite), timeoutMs);
  if (!write.completed) return 'unavailable';

  if (typeof storage?.estimate !== 'function') return 'available';
  const estimate = await settleWithin(
    Promise.resolve().then(() => storage.estimate!()),
    timeoutMs,
  );
  if (!estimate.completed) return 'available';

  const { usage, quota } = estimate.value;
  if (
    typeof usage !== 'number' ||
    !Number.isFinite(usage) ||
    usage < 0 ||
    typeof quota !== 'number' ||
    !Number.isFinite(quota) ||
    quota <= 0
  )
    return 'available';
  if (usage / quota >= WARNING_USAGE_RATIO || quota - usage < WARNING_REMAINING_BYTES) {
    return 'limited';
  }
  return 'available';
}
