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

export function resolveRoute(location: BrowserLocation): RouteState {
  const destination = destinationsByPath.get(normalizePath(location.pathname));
  if (destination === undefined) return fallback('unknown-route');

  const slotId = new URLSearchParams(location.search).get('slot')?.trim() || undefined;
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
  environment: BrowserRouteEnvironment = window,
): RouteAdapter {
  const listeners = new Set<(route: RouteState) => void>();
  const notify = () => {
    const route = resolveRoute(environment.location);
    listeners.forEach((listener) => listener(route));
  };

  return {
    current: () => resolveRoute(environment.location),
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
