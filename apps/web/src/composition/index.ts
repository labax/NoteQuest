import type { SaveSlotService } from '@notequest/application';
import {
  createDexieSaveSlotService,
  createNoteQuestDatabase,
  initializeSaveSlotFoundation,
} from '@notequest/infrastructure';

export const compositionRootName = 'web-composition' as const;

export type ShellRoute = 'home';

export interface RouteAdapter {
  current(): ShellRoute;
  navigate(route: ShellRoute): void;
}

export interface PwaStatusAdapter {
  getStatus(): Readonly<{ offlineReady: boolean; updateAvailable: boolean }>;
}

export interface AppServices {
  readonly saveSlots: SaveSlotService;
}

export interface AppComposition {
  readonly services: AppServices;
  readonly route: RouteAdapter;
  readonly pwa: PwaStatusAdapter;
  readonly version: string;
  close(): void;
}

function createBrowserRouteAdapter(): RouteAdapter {
  return {
    current: () => 'home',
    navigate: () => {
      window.history.pushState(null, '', '/');
    },
  };
}

function createPwaStatusAdapter(): PwaStatusAdapter {
  return {
    getStatus: () => ({
      offlineReady: navigator.onLine && 'serviceWorker' in navigator,
      updateAvailable: false,
    }),
  };
}

/** The only production location that constructs application-level adapters. */
export async function createWebComposition(): Promise<AppComposition> {
  const database = await createNoteQuestDatabase();
  await database.open();
  const initialized = await initializeSaveSlotFoundation(database);
  if (!initialized.ok) {
    database.close();
    throw new Error(initialized.error.message);
  }

  return {
    services: { saveSlots: createDexieSaveSlotService(database) },
    route: createBrowserRouteAdapter(),
    pwa: createPwaStatusAdapter(),
    version: import.meta.env.VITE_APP_VERSION ?? 'development',
    close: () => database.close(),
  };
}
