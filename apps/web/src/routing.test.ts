import { describe, expect, it, vi } from 'vitest';
import { createBrowserRouteAdapter, resolveRoute } from './routing';

describe('project route adapter', () => {
  it('resolves a direct contextual load without creating mechanical state', () => {
    expect(resolveRoute({ pathname: '/inventory', search: '?slot=slot-2' })).toMatchObject({
      destination: 'inventory',
      slotId: 'slot-2',
      fallback: null,
    });
  });

  it('returns unknown paths and guarded paths to safe save slots', () => {
    expect(resolveRoute({ pathname: '/not-a-page', search: '' })).toMatchObject({
      destination: 'save-slots',
      fallback: 'unknown-route',
    });
    expect(resolveRoute({ pathname: '/expedition', search: '' })).toMatchObject({
      destination: 'save-slots',
      fallback: 'missing-context',
    });
  });

  it('publishes navigation and browser-history changes', () => {
    const location = { pathname: '/', search: '' };
    const popstate = new Set<() => void>();
    const environment = {
      location,
      history: {
        pushState: vi.fn((_state, _unused, url) => {
          const parsed = new URL(String(url), 'https://example.test');
          location.pathname = parsed.pathname;
          location.search = parsed.search;
        }),
      },
      addEventListener: vi.fn((_type: 'popstate', listener: () => void) => popstate.add(listener)),
      removeEventListener: vi.fn((_type: 'popstate', listener: () => void) =>
        popstate.delete(listener),
      ),
    };
    const adapter = createBrowserRouteAdapter(environment);
    const listener = vi.fn();
    const unsubscribe = adapter.subscribe(listener);
    adapter.navigate({ destination: 'history', slotId: 'slot-1' });
    expect(environment.history.pushState).toHaveBeenCalledWith(null, '', '/history?slot=slot-1');
    expect(listener).toHaveBeenLastCalledWith(expect.objectContaining({ destination: 'history' }));
    location.pathname = '/about';
    location.search = '';
    popstate.forEach((notify) => notify());
    expect(listener).toHaveBeenLastCalledWith(expect.objectContaining({ destination: 'about' }));
    unsubscribe();
  });
});
