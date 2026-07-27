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
  getStatus(): Readonly<{
    serviceWorkerSupport: 'supported' | 'unsupported';
    offlineReadiness: 'not-checked';
    updateStatus: 'not-checked';
  }>;
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

export function createPwaStatusAdapter(environment: object = navigator): PwaStatusAdapter {
  return {
    getStatus: () => ({
      serviceWorkerSupport: 'serviceWorker' in environment ? 'supported' : 'unsupported',
      offlineReadiness: 'not-checked',
      updateStatus: 'not-checked',
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
