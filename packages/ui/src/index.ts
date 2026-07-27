import { applicationLayerName } from '@notequest/application';

export const uiLayerName = 'ui' as const;

export const uiDependsOn = [applicationLayerName] as const;

export const shellDestinations = [
  'save-slots',
  'town',
  'expedition',
  'inventory',
  'history',
  'data',
  'graveyard',
  'about',
] as const;

export type ShellDestination = (typeof shellDestinations)[number];

/** Presentation selection only. This context never represents or changes game state. */
export interface RouteSelection {
  readonly destination: ShellDestination;
  readonly slotId?: string;
}

export interface RouteMetadata {
  readonly title: string;
  readonly heading: string;
  readonly path: string;
  readonly requiresSelectedSlot: boolean;
  readonly showInNavigation: boolean;
}

export interface RouteState extends RouteSelection {
  readonly metadata: RouteMetadata;
  readonly fallback: null | 'unknown-route' | 'missing-context' | 'invalid-context';
}

/** Project-owned boundary used by UI code instead of browser/router APIs. */
export interface RouteAdapter {
  current(): RouteState;
  navigate(selection: RouteSelection): void;
  subscribe(listener: (route: RouteState) => void): () => void;
}

export const routeMetadata: Readonly<Record<ShellDestination, RouteMetadata>> = {
  'save-slots': {
    title: 'Save Slots · NoteQuest',
    heading: 'Choose a local save slot',
    path: '/',
    requiresSelectedSlot: false,
    showInNavigation: true,
  },
  town: {
    title: 'Town · NoteQuest',
    heading: 'Town',
    path: '/town',
    requiresSelectedSlot: true,
    showInNavigation: true,
  },
  expedition: {
    title: 'Expedition · NoteQuest',
    heading: 'Expedition',
    path: '/expedition',
    requiresSelectedSlot: true,
    showInNavigation: true,
  },
  inventory: {
    title: 'Inventory · NoteQuest',
    heading: 'Inventory',
    path: '/inventory',
    requiresSelectedSlot: true,
    showInNavigation: true,
  },
  history: {
    title: 'History · NoteQuest',
    heading: 'History',
    path: '/history',
    requiresSelectedSlot: true,
    showInNavigation: true,
  },
  data: {
    title: 'Data · NoteQuest',
    heading: 'Manage local data',
    path: '/data',
    requiresSelectedSlot: false,
    showInNavigation: true,
  },
  graveyard: {
    title: 'Graveyard · NoteQuest',
    heading: 'Graveyard',
    path: '/graveyard',
    requiresSelectedSlot: true,
    showInNavigation: true,
  },
  about: {
    title: 'About and Credits · NoteQuest',
    heading: 'About and credits',
    path: '/about',
    requiresSelectedSlot: false,
    showInNavigation: true,
  },
};
