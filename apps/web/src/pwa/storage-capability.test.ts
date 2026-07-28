import { describe, expect, it, vi } from 'vitest';
import { checkStorageCapability } from './storage-capability';

describe('storage capability check', () => {
  it('reports unavailable when the mandatory app-owned write rejects', async () => {
    await expect(
      checkStorageCapability(vi.fn().mockRejectedValue(new Error('write blocked'))),
    ).resolves.toBe('unavailable');
  });

  it('bounds a non-resolving mandatory app-owned write as unavailable', async () => {
    vi.useFakeTimers();
    const pending = checkStorageCapability(
      vi.fn(() => new Promise<void>(() => undefined)),
      undefined,
      { timeoutMs: 10 },
    );
    await vi.advanceTimersByTimeAsync(10);
    await expect(pending).resolves.toBe('unavailable');
    vi.useRealTimers();
  });

  it('accepts verified IndexedDB when optional estimate support is absent', async () => {
    const verified = vi.fn().mockResolvedValue(undefined);
    await expect(checkStorageCapability(verified)).resolves.toBe('available');
  });

  it('preserves verified durability when the optional estimate rejects', async () => {
    const verified = vi.fn().mockResolvedValue(undefined);
    await expect(
      checkStorageCapability(verified, {
        estimate: vi.fn().mockRejectedValue(new Error('restricted')),
      }),
    ).resolves.toBe('available');
  });

  it('bounds a non-resolving optional estimate and preserves verified durability', async () => {
    const verified = vi.fn().mockResolvedValue(undefined);
    vi.useFakeTimers();
    const pending = checkStorageCapability(
      verified,
      { estimate: vi.fn(() => new Promise<{ usage?: number; quota?: number }>(() => undefined)) },
      { timeoutMs: 10 },
    );
    await vi.advanceTimersByTimeAsync(10);
    await expect(pending).resolves.toBe('available');
    vi.useRealTimers();
  });

  it.each([{}, { usage: Number.NaN, quota: 100 }, { usage: 10, quota: 0 }])(
    'treats an inconclusive optional estimate as available: %o',
    async (estimate) => {
      await expect(
        checkStorageCapability(vi.fn().mockResolvedValue(undefined), {
          estimate: vi.fn().mockResolvedValue(estimate),
        }),
      ).resolves.toBe('available');
    },
  );

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
