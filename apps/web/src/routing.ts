import {
  routeMetadata,
  shellDestinations,
  type RouteAdapter,
  type RouteSelection,
  type RouteState,
  type ShellDestination,
} from '@notequest/ui';

interface BrowserLocation {
  readonly pathname: string;
  readonly search: string;
}

interface BrowserRouteEnvironment {
  readonly location: BrowserLocation;
  readonly history: Pick<History, 'pushState'>;
  addEventListener(type: 'popstate', listener: () => void): void;
  removeEventListener(type: 'popstate', listener: () => void): void;
}

const destinationsByPath = new Map(
  shellDestinations.map((destination) => [routeMetadata[destination].path, destination]),
);

export function resolveRoute(
  location: BrowserLocation,
  validSlotIds: readonly string[],
): RouteState {
  const destination = destinationsByPath.get(normalizePath(location.pathname));
  if (destination === undefined) return fallback('unknown-route');

  const slotParameters = new URLSearchParams(location.search).getAll('slot');
  if (slotParameters.length > 1) return fallback('invalid-context');
  const rawSlotId = slotParameters[0] ?? null;
  const slotId = rawSlotId?.trim() || undefined;
  if (rawSlotId !== null && (slotId === undefined || !validSlotIds.includes(slotId))) {
    return fallback(slotId === undefined ? 'missing-context' : 'invalid-context');
  }
  if (routeMetadata[destination].requiresSelectedSlot && slotId === undefined) {
    return fallback('missing-context');
  }
  return {
    destination,
    ...(slotId === undefined ? {} : { slotId }),
    metadata: routeMetadata[destination],
    fallback: null,
  };
}

export function createBrowserRouteAdapter(
  validSlotIds: readonly string[],
  environment: BrowserRouteEnvironment = window,
): RouteAdapter {
  const catalogueSlotIds = [...validSlotIds];
  const listeners = new Set<(route: RouteState) => void>();
  const notify = () => {
    const route = resolveRoute(environment.location, catalogueSlotIds);
    listeners.forEach((listener) => listener(route));
  };

  return {
    current: () => resolveRoute(environment.location, catalogueSlotIds),
    navigate: (selection) => {
      environment.history.pushState(null, '', routeUrl(selection));
      notify();
    },
    subscribe: (listener) => {
      if (listeners.size === 0) environment.addEventListener('popstate', notify);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) environment.removeEventListener('popstate', notify);
      };
    },
  };
}

function normalizePath(path: string): string {
  if (path === '/') return path;
  return path.replace(/\/+$/, '') || '/';
}

function fallback(reason: NonNullable<RouteState['fallback']>): RouteState {
  const destination: ShellDestination = 'save-slots';
  return { destination, metadata: routeMetadata[destination], fallback: reason };
}

function routeUrl(selection: RouteSelection): string {
  const search = new URLSearchParams();
  if (selection.slotId) search.set('slot', selection.slotId);
  const query = search.toString();
  return `${routeMetadata[selection.destination].path}${query ? `?${query}` : ''}`;
}
