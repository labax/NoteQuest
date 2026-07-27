import { describe, expect, it, vi } from 'vitest';
import { NOTEQUEST_SLOT_IDS } from '@notequest/infrastructure';
import { createBrowserRouteAdapter, resolveRoute } from './routing';

describe('project route adapter', () => {
  it('resolves a direct contextual load without creating mechanical state', () => {
    expect(
      resolveRoute(
        { pathname: '/inventory', search: `?slot=${NOTEQUEST_SLOT_IDS[1]}` },
        NOTEQUEST_SLOT_IDS,
      ),
    ).toMatchObject({ destination: 'inventory', slotId: NOTEQUEST_SLOT_IDS[1], fallback: null });
  });

  it('returns unknown paths and guarded paths to safe save slots', () => {
    expect(resolveRoute({ pathname: '/not-a-page', search: '' }, NOTEQUEST_SLOT_IDS)).toMatchObject(
      {
        destination: 'save-slots',
        fallback: 'unknown-route',
      },
    );
    expect(resolveRoute({ pathname: '/expedition', search: '' }, NOTEQUEST_SLOT_IDS)).toMatchObject(
      {
        destination: 'save-slots',
        fallback: 'missing-context',
      },
    );
  });

  it.each([
    ['empty', '?slot='],
    ['whitespace', '?slot=%20%20'],
    ['malformed encoding', '?slot=%E0%A4%A'],
    ['ambiguous duplicate', `?slot=${NOTEQUEST_SLOT_IDS[0]}&slot=invalid`],
    ['arbitrary', '?slot=invalid'],
    ['plausible but non-catalogued', '?slot=slot-2'],
  ])('rejects %s selected-slot context', (_name, search) => {
    const route = resolveRoute({ pathname: '/inventory', search }, NOTEQUEST_SLOT_IDS);
    expect(route).toMatchObject({ destination: 'save-slots' });
    expect(route).not.toHaveProperty('slotId');
    expect(route.fallback).toMatch(/^(missing|invalid)-context$/);
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
    const adapter = createBrowserRouteAdapter(NOTEQUEST_SLOT_IDS, environment);
    const listener = vi.fn();
    const unsubscribe = adapter.subscribe(listener);
    adapter.navigate({ destination: 'history', slotId: NOTEQUEST_SLOT_IDS[0] });
    expect(environment.history.pushState).toHaveBeenCalledWith(
      null,
      '',
      `/history?slot=${NOTEQUEST_SLOT_IDS[0]}`,
    );
    expect(listener).toHaveBeenLastCalledWith(expect.objectContaining({ destination: 'history' }));
    location.pathname = '/about';
    location.search = '';
    popstate.forEach((notify) => notify());
    expect(listener).toHaveBeenLastCalledWith(expect.objectContaining({ destination: 'about' }));
    unsubscribe();
  });
});
