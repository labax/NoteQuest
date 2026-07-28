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
import { checkStorageCapability } from '../pwa/storage-capability';

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
  reload(): void;
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
  const updates = createPwaUpdateCoordinator(pwa, {
    onlineState: navigator.onLine ? 'online' : 'offline',
  });
  updates.updateStorageCapability(
    await checkStorageCapability(async () => {
      const key = 'workspace.local.capability-probe';
      await database.transaction('rw', database.workspace, async () => {
        await database.workspace.put({ key, value: { probe: true } });
        await database.workspace.delete(key);
      });
    }, navigator.storage),
  );
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
    reload: () => window.location.reload(),
    close: () => {
      updates.close();
      pwa.close();
      database.close();
    },
  };
}
