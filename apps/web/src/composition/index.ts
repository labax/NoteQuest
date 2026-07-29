import {
  AdventurerCreationService,
  createUpdateSafetyState,
  type AdventurerCreationContent,
  type SaveSlotOperationStatusPort,
  type SaveSlotService,
  type UpdateSafetyStatePort,
} from '@notequest/application';
import type {
  CommandId,
  ContentVersion,
  IdempotencyKey,
  RulesVersion,
  SaveSlotId,
} from '@notequest/domain';
import {
  palaceAdventurerCreationApproval,
  palaceAdventurerCreationContent,
} from '@notequest/content';
import type { AdventurerCreationUiPort, RouteAdapter } from '@notequest/ui';
import {
  createDexieSaveSlotService,
  createDexieActionTransactionCoordinator,
  createDexiePersistenceRepositories,
  createNoteQuestDatabase,
  initializeSaveSlotFoundation,
  NOTEQUEST_SELECTED_SLOT_KEY,
} from '@notequest/infrastructure';
import { createBrowserRouteAdapter } from '../routing';
import { createPwaLifecycleAdapter, type PwaLifecycleAdapter } from '../pwa/service-worker';
import { createPwaUpdateCoordinator, type PwaUpdateCoordinator } from '../pwa/update-coordinator';
import { checkStorageCapability } from '../pwa/storage-capability';
import { createUpdateSafeSaveSlotService } from './update-safe-save-slots';

export const compositionRootName = 'web-composition' as const;

/** Read-only lifecycle view exposed to presentation code; activation stays coordinator-owned. */
export type PwaStatusAdapter = Pick<PwaLifecycleAdapter, 'getStatus' | 'subscribe'>;

export interface AppServices {
  readonly saveSlots: SaveSlotService;
  readonly saveSlotOperations: SaveSlotOperationStatusPort;
  readonly updateSafety: UpdateSafetyStatePort;
  /** Available once approved Palace creation content is composed at the web boundary. */
  readonly adventurerCreation?: AdventurerCreationUiPort;
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

  const checkApplicationStorage = () =>
    checkStorageCapability(async () => {
      const key = 'workspace.local.capability-probe';
      await database.transaction('rw', database.workspace, async () => {
        await database.workspace.put({ key, value: { probe: true } });
        await database.workspace.delete(key);
      });
    }, navigator.storage);
  const pwa = createPwaLifecycleAdapter();
  const updates = createPwaUpdateCoordinator(pwa, {
    onlineState: navigator.onLine ? 'online' : 'offline',
    retryStorage: checkApplicationStorage,
  });
  updates.updateStorageCapability(await checkApplicationStorage());
  const updateSafety = createUpdateSafetyState();
  const baseSaveSlots = createDexieSaveSlotService(database);
  const repositories = createDexiePersistenceRepositories(database);
  const selected = await database.workspace.get(NOTEQUEST_SELECTED_SLOT_KEY);
  const selectedSlotId =
    typeof selected?.value === 'object' &&
    selected.value !== null &&
    typeof Reflect.get(selected.value, 'selectedSlotId') === 'string'
      ? (Reflect.get(selected.value, 'selectedSlotId') as SaveSlotId)
      : undefined;
  if (selectedSlotId) {
    const persisted = await baseSaveSlots.lookup(selectedSlotId);
    if (persisted.ok) updateSafety.acceptDurableSlot(persisted.value);
  } else {
    updateSafety.clearActiveSlot();
  }
  const unsubscribeSafety = updateSafety.subscribe((snapshot) => updates.updateSafety(snapshot));
  const saveSlots: SaveSlotService = createUpdateSafeSaveSlotService(baseSaveSlots, updateSafety);
  const creationService = new AdventurerCreationService({
    slots: repositories.slots,
    records: repositories.records,
    coordinator: createDexieActionTransactionCoordinator(database),
    content: palaceAdventurerCreationContent as unknown as AdventurerCreationContent,
    rulesVersion: palaceAdventurerCreationApproval.rulesVersion as RulesVersion,
    contentVersion: palaceAdventurerCreationApproval.contentVersion as ContentVersion,
    masterSeedForSlot: (slotId) => {
      const material = slotId.replaceAll('-', '').slice(-16).padStart(16, '0');
      return `0x${material}`;
    },
    newId: () => crypto.randomUUID(),
    now: () => new Date().toISOString(),
  });
  const creationActions = new Map<
    string,
    { commandId: CommandId; idempotencyKey: IdempotencyKey }
  >();
  const adventurerCreation: AdventurerCreationUiPort = {
    loadCommitted: (slotId) => creationService.loadCommitted(slotId as SaveSlotId),
    async create(rawSlotId, playerAuthoredName) {
      const slotId = rawSlotId as SaveSlotId;
      const identity = creationActions.get(slotId) ?? {
        commandId: crypto.randomUUID() as CommandId,
        idempotencyKey: crypto.randomUUID() as IdempotencyKey,
      };
      creationActions.set(slotId, identity);
      updateSafety.beginCommand(slotId);
      const prepared = await creationService.prepare({
        type: 'create_adventurer',
        module: 'adventurer',
        slotId,
        playerAuthoredName,
        creationMode: 'canonical_random',
        metadata: identity,
      });
      if (!prepared.ok) {
        updateSafety.failSave(slotId);
        return { ok: false, committed: false, retryable: false, message: prepared.message };
      }
      updateSafety.beginSave(slotId);
      const result = await creationService.commit(prepared.prepared);
      if (result.ok) {
        const slot = await baseSaveSlots.lookup(slotId);
        if (slot.ok) updateSafety.acceptDurableSlot(slot.value);
        else updateSafety.failSave(slotId);
      } else if (result.committed === false) updateSafety.failSave(slotId);
      return result;
    },
  };
  if (import.meta.env.PROD) void pwa.register();

  return {
    services: {
      saveSlots,
      saveSlotOperations: updateSafety,
      updateSafety,
      adventurerCreation,
    },
    route: createBrowserRouteAdapter(initialized.value.catalogue.slotIds),
    pwa,
    updates,
    version: import.meta.env.VITE_APP_VERSION ?? 'development',
    reload: () => window.location.reload(),
    close: () => {
      unsubscribeSafety();
      updates.close();
      pwa.close();
      database.close();
    },
  };
}
