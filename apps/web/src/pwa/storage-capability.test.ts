import { describe, expect, it, vi } from 'vitest';
import { checkStorageCapability } from './storage-capability';

describe('storage capability check', () => {
  it('requires evidence from the app-owned persistence transaction', async () => {
    await expect(
      checkStorageCapability(vi.fn().mockRejectedValue(new Error('write blocked'))),
    ).resolves.toBe('unavailable');
  });

  it('accepts verified IndexedDB when optional estimate support is absent', async () => {
    const verified = vi.fn().mockResolvedValue(undefined);
    await expect(checkStorageCapability(verified)).resolves.toBe('available');
  });

  it('contains rejected and non-resolving storage checks as unavailable', async () => {
    const verified = vi.fn().mockResolvedValue(undefined);
    await expect(
      checkStorageCapability(verified, {
        estimate: vi.fn().mockRejectedValue(new Error('restricted')),
      }),
    ).resolves.toBe('unavailable');

    vi.useFakeTimers();
    const pending = checkStorageCapability(
      verified,
      { estimate: vi.fn(() => new Promise<{ usage?: number; quota?: number }>(() => undefined)) },
      { timeoutMs: 10 },
    );
    await vi.advanceTimersByTimeAsync(10);
    await expect(pending).resolves.toBe('unavailable');
    vi.useRealTimers();
  });

  it.each([
    { usage: 70, quota: 100 },
    { usage: 81 * 1024 * 1024, quota: 100 * 1024 * 1024 },
  ])('reports the approved storage warning bands as limited: %o', async (estimate) => {
    await expect(
      checkStorageCapability(vi.fn().mockResolvedValue(undefined), {
        estimate: vi.fn().mockResolvedValue(estimate),
      }),
    ).resolves.toBe('limited');
  });

  it('reports available capacity outside the warning bands', async () => {
    await expect(
      checkStorageCapability(vi.fn().mockResolvedValue(undefined), {
        estimate: vi.fn().mockResolvedValue({ usage: 10, quota: 100 * 1024 * 1024 }),
      }),
    ).resolves.toBe('available');
  });
});
