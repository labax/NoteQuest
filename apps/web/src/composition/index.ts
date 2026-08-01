import {
  AdventurerCreationService,
  createPerSlotActionCommitQueue,
  createUpdateSafetyState,
  type AdventurerCreationContent,
  type AdventurerCreationLoadResult,
  type PreparedAdventurerCreation,
  type SaveSlotOperationStatusPort,
  type SaveSlotService,
  type UpdateSafetyStatePort,
} from '@notequest/application';
import type {
  ContentVersion,
  DefinitionId,
  IdempotencyKey,
  RulesVersion,
  SaveSlotId,
} from '@notequest/domain';
import type { AdventurerCreationUiPort, RouteAdapter } from '@notequest/ui';
import {
  authorizedNoteQuestAdventurerCreationContentVersion,
  authorizedNoteQuestAdventurerCreationManifest,
  authorizedNoteQuestAdventurerCreationRulesVersion,
  authorizedNoteQuestClasses,
  authorizedNoteQuestEffects,
  authorizedNoteQuestRaces,
  authorizedNoteQuestSpells,
  authorizedNoteQuestStartingState,
  authorizedNoteQuestAdventurerCreationTableIds,
  authorizedNoteQuestWeapons,
  validatePalaceContentManifest,
  validatePalaceManifestIntegrity,
} from '@notequest/content';
import {
  actionCommitIdempotencyWorkspaceKey,
  actionCommitDexieStores,
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

export function classifyCreationReconciliationObservation(
  loaded: AdventurerCreationLoadResult,
  marker: unknown,
  expected: { readonly actionId: string; readonly adventurerId: string },
): 'same-action' | 'known-false' | 'unknown' {
  if (marker === undefined) return loaded.kind === 'empty' ? 'known-false' : 'unknown';
  if (typeof marker !== 'object' || marker === null) return 'unknown';
  const actionId = Reflect.get(marker, 'actionId');
  const revision = Reflect.get(marker, 'stateRevision');
  return loaded.kind === 'committed' &&
    actionId === expected.actionId &&
    Number.isSafeInteger(revision) &&
    revision === loaded.result.event?.metadata.stateRevision &&
    loaded.result.event?.metadata.commandId === expected.actionId &&
    loaded.result.state.adventurerId === expected.adventurerId
    ? 'same-action'
    : 'unknown';
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
    raceTableId: authorizedNoteQuestAdventurerCreationTableIds.races as DefinitionId,
    classTableId: authorizedNoteQuestAdventurerCreationTableIds.classes as DefinitionId,
    spellTableId: authorizedNoteQuestAdventurerCreationTableIds.spells as DefinitionId,
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

    effects: Object.fromEntries(
      authorizedNoteQuestEffects.map((effect) => [
        effect.id,
        {
          ...effect,
          id: effect.id as DefinitionId,
          version: authorizedNoteQuestAdventurerCreationContentVersion as ContentVersion,
        },
      ]),
    ),
    startingState: authorizedNoteQuestStartingState,
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
  const reconciliationActions = new Map<string, PreparedAdventurerCreation>();
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
      let reconciliationToken: string | undefined;
      let preparedAction: PreparedAdventurerCreation | undefined;
      let commitStarted = false;
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
        reconciliationToken = crypto.randomUUID();
        preparedAction = prepared.prepared;
        reconciliationActions.set(reconciliationToken, preparedAction);
        updateSafety.beginSave(slotId);
        commitStarted = true;
        const result = await creationService.commit(prepared.prepared);
        if (result.ok) {
          const durable = await baseSaveSlots.lookup(slotId);
          if (!durable.ok) {
            return {
              ok: false,
              committed: 'unknown',
              retryable: true,
              message: 'Durable save could not be verified.',
              reconciliationToken,
            };
          }
          updateSafety.acceptDurableSlot(durable.value);
        } else if (result.committed === false) updateSafety.failSave(slotId);
        if (result.ok || result.committed === false) {
          reconciliationActions.delete(reconciliationToken);
          creationIdentities.delete(slotId);
          return result;
        }
        return { ...result, reconciliationToken };
      } catch {
        if (!commitStarted || reconciliationToken === undefined || preparedAction === undefined) {
          updateSafety.failSave(slotId);
          creationIdentities.delete(slotId);
          return {
            ok: false,
            committed: false,
            retryable: true,
            message: 'Creation could not be started.',
          };
        }
        return {
          ok: false,
          committed: 'unknown',
          retryable: false,
          message: 'Save status could not be confirmed.',
          reconciliationToken,
        };
      }
    },
    async reconcile(reconciliationToken) {
      const prepared = reconciliationActions.get(reconciliationToken);
      if (prepared === undefined)
        return {
          ok: false,
          committed: 'unknown',
          retryable: false,
          message: 'Save status could not be confirmed.',
          reconciliationToken,
        };
      try {
        const idempotencyKey = prepared.command.metadata.idempotencyKey as IdempotencyKey;
        // The marker and creation records must be observed at one IndexedDB snapshot. Reading
        // them separately can false-negative a transaction that commits between both reads.
        const observation = await database.transaction(
          'r',
          ...actionCommitDexieStores(database),
          async () => ({
            loaded: await creationService.loadCommitted(prepared.command.slotId),
            marker: await database.workspace.get(
              actionCommitIdempotencyWorkspaceKey(prepared.command.slotId, idempotencyKey),
            ),
          }),
        );
        const { loaded, marker } = observation;
        const classification = classifyCreationReconciliationObservation(loaded, marker?.value, {
          actionId: prepared.command.metadata.commandId,
          adventurerId: prepared.state.adventurerId,
        });
        if (classification === 'same-action' && loaded.kind === 'committed') {
          const durable = await baseSaveSlots.lookup(prepared.command.slotId);
          if (!durable.ok)
            return {
              ok: false,
              committed: 'unknown',
              retryable: false,
              message: 'Durable save could not be verified.',
              reconciliationToken,
            };
          updateSafety.acceptDurableSlot(durable.value);
          reconciliationActions.delete(reconciliationToken);
          creationIdentities.delete(prepared.command.slotId);
          return loaded.result;
        }
        // Absence is authoritative only when the same coherent observation contains neither
        // the marker nor any creation records. A present or malformed marker stays ambiguous.
        if (classification === 'known-false') {
          updateSafety.failSave(prepared.command.slotId);
          reconciliationActions.delete(reconciliationToken);
          creationIdentities.delete(prepared.command.slotId);
          return {
            ok: false,
            committed: false,
            retryable: true,
            message: 'The original creation action was not committed.',
          };
        }
        return {
          ok: false,
          committed: 'unknown',
          retryable: false,
          message: 'The original creation action could not be confirmed.',
          reconciliationToken,
        };
      } catch {
        return {
          ok: false,
          committed: 'unknown',
          retryable: false,
          message: 'The original creation action could not be confirmed.',
          reconciliationToken,
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
