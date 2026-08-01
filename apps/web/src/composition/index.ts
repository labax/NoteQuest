import {
  AdventurerCreationService,
  createPerSlotActionCommitQueue,
  createUpdateSafetyState,
  type AdventurerCreationContent,
  type SaveSlotOperationStatusPort,
  type SaveSlotService,
  type UpdateSafetyStatePort,
} from '@notequest/application';
import type { ContentVersion, DefinitionId, RulesVersion, SaveSlotId } from '@notequest/domain';
import type { AdventurerCreationUiPort, RouteAdapter } from '@notequest/ui';
import {
  authorizedNoteQuestAdventurerCreationContentVersion,
  authorizedNoteQuestAdventurerCreationManifest,
  authorizedNoteQuestAdventurerCreationRulesVersion,
  authorizedNoteQuestClasses,
  authorizedNoteQuestRaces,
  authorizedNoteQuestSpells,
  authorizedNoteQuestWeapons,
  validatePalaceContentManifest,
  validatePalaceManifestIntegrity,
} from '@notequest/content';
import {
  createDexieActionTransactionCoordinator,
  createDexiePersistenceRepositories,
  createDexieSaveSlotService,
  createSha256Hasher,
  serializeCanonicalJson,
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
  const manifestValidation = validatePalaceContentManifest(
    authorizedNoteQuestAdventurerCreationManifest,
  );
  const integrityValidation = await validatePalaceManifestIntegrity(
    authorizedNoteQuestAdventurerCreationManifest,
    {
      canonicalJson: { serializeCanonicalJson },
      sha256: createSha256Hasher(),
    },
  );
  if (!manifestValidation.valid || !integrityValidation.valid) {
    database.close();
    throw new Error('Selected adventurer creation content failed governance validation.');
  }
  const repositories = createDexiePersistenceRepositories(database);
  const weapons = new Map(authorizedNoteQuestWeapons.map((weapon) => [weapon.id, weapon]));
  const creationContent: AdventurerCreationContent = {
    raceTableId: 'creation.notequest.races' as DefinitionId,
    classTableId: 'creation.notequest.classes' as DefinitionId,
    spellTableId: 'creation.notequest.basic-spells' as DefinitionId,
    races: authorizedNoteQuestRaces.map((race) => ({
      ...race,
      id: race.id as DefinitionId,
      startingSpellCharges: race.randomSpellDraws,
      fixedSpellGrants: race.fixedSpellGrants.map((grant) => ({
        ...grant,
        spellId: grant.spellId as DefinitionId,
      })),
      effectIds: race.effectIds as readonly DefinitionId[],
    })),
    classes: authorizedNoteQuestClasses.map((entry) => {
      const weapon = weapons.get(entry.weaponId)!;
      return {
        ...entry,
        id: entry.id as DefinitionId,
        startingSpellCharges: entry.randomSpellDraws,
        fixedSpellGrants: (
          entry.fixedSpellGrants as readonly { spellId: string; charges: number }[]
        ).map((grant) => ({
          ...grant,
          spellId: grant.spellId as DefinitionId,
        })),
        effectIds: entry.effectIds as readonly DefinitionId[],
        weapon: {
          definitionId: weapon.id as DefinitionId,
          label: weapon.label,
          hands: weapon.hands,
          damage: weapon.damage,
        },
      };
    }),
    spells: Object.fromEntries(
      authorizedNoteQuestSpells.map((spell) => [
        spell.total,
        { id: spell.id as DefinitionId, label: spell.label },
      ]),
    ),
  };
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
    events: repositories.events,
    snapshots: repositories.snapshots,
    coordinator: createPerSlotActionCommitQueue(createDexieActionTransactionCoordinator(database)),
    content: creationContent,
    rulesVersion: authorizedNoteQuestAdventurerCreationRulesVersion as RulesVersion,
    contentVersion: authorizedNoteQuestAdventurerCreationContentVersion as ContentVersion,
    masterSeedForSlot: (slotId) => `0x${slotId.replaceAll('-', '').slice(-16)}`,
    newId: () => crypto.randomUUID(),
    now: () => new Date().toISOString(),
  });
  const creationIdentities = new Map<string, { commandId: string; idempotencyKey: string }>();
  const adventurerCreation: AdventurerCreationUiPort = {
    loadCommitted: (slotId) => creationService.loadCommitted(slotId as SaveSlotId),
    async create(rawSlotId, playerAuthoredName) {
      const slotId = rawSlotId as SaveSlotId;
      const identity = creationIdentities.get(slotId) ?? {
        commandId: crypto.randomUUID(),
        idempotencyKey: crypto.randomUUID(),
      };
      creationIdentities.set(slotId, identity);
      updateSafety.beginCommand(slotId);
      try {
        const prepared = await creationService.prepare({
          type: 'create_adventurer',
          module: 'adventurer',
          slotId,
          playerAuthoredName,
          creationMode: 'canonical_random',
          metadata: identity as never,
        });
        if (!prepared.ok) {
          updateSafety.failSave(slotId);
          return { ok: false, committed: false, retryable: false, message: prepared.message };
        }
        updateSafety.beginSave(slotId);
        const result = await creationService.commit(prepared.prepared);
        if (result.ok) {
          const durable = await baseSaveSlots.lookup(slotId);
          if (!durable.ok) {
            updateSafety.failSave(slotId);
            return {
              ok: false,
              committed: 'unknown',
              retryable: true,
              message: 'Durable save could not be verified.',
            };
          }
          updateSafety.acceptDurableSlot(durable.value);
        } else if (result.committed === false) updateSafety.failSave(slotId);
        return result;
      } catch {
        updateSafety.failSave(slotId);
        return {
          ok: false,
          committed: 'unknown',
          retryable: true,
          message: 'Save status could not be confirmed.',
        };
      }
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
