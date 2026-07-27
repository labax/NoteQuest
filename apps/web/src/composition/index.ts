import type { SaveSlotService } from '@notequest/application';
import type { RouteAdapter } from '@notequest/ui';
import {
  createDexieSaveSlotService,
  createNoteQuestDatabase,
  initializeSaveSlotFoundation,
} from '@notequest/infrastructure';
import { createBrowserRouteAdapter } from '../routing';

export const compositionRootName = 'web-composition' as const;

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
