import type { SaveSlotOperationStatusPort, SaveSlotService } from '@notequest/application';
import type { RouteAdapter } from '@notequest/ui';
import {
  createDexieSaveSlotService,
  createNoteQuestDatabase,
  initializeSaveSlotFoundation,
} from '@notequest/infrastructure';
import { createBrowserRouteAdapter } from '../routing';
import { createPwaLifecycleAdapter, type PwaLifecycleAdapter } from '../pwa/service-worker';
import { createPwaUpdateCoordinator, type PwaUpdateCoordinator } from '../pwa/update-coordinator';

export const compositionRootName = 'web-composition' as const;

/** Read-only lifecycle view exposed to presentation code; activation stays coordinator-owned. */
export type PwaStatusAdapter = Pick<PwaLifecycleAdapter, 'getStatus' | 'subscribe'>;

export interface AppServices {
  readonly saveSlots: SaveSlotService;
  readonly saveSlotOperations: SaveSlotOperationStatusPort;
}

export interface AppComposition {
  readonly services: AppServices;
  readonly route: RouteAdapter;
  readonly pwa: PwaStatusAdapter;
  readonly updates: PwaUpdateCoordinator;
  readonly version: string;
  close(): void;
}

export const createPwaStatusAdapter = createPwaLifecycleAdapter;

/** The only production location that constructs application-level adapters. */
export async function createWebComposition(): Promise<AppComposition> {
  const database = await createNoteQuestDatabase();
  await database.open();
  const initialized = await initializeSaveSlotFoundation(database);
  if (!initialized.ok) {
    database.close();
    throw new Error(initialized.error.message);
  }

  const pwa = createPwaLifecycleAdapter();
  const updates = createPwaUpdateCoordinator(pwa);
  if (import.meta.env.PROD) void pwa.register();

  return {
    services: {
      saveSlots: createDexieSaveSlotService(database),
      saveSlotOperations: { get: () => undefined },
    },
    route: createBrowserRouteAdapter(initialized.value.catalogue.slotIds),
    pwa,
    updates,
    version: import.meta.env.VITE_APP_VERSION ?? 'development',
    close: () => {
      updates.close();
      pwa.close();
      database.close();
    },
  };
}
