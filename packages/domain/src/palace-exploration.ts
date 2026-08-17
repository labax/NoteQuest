export const palaceExplorationRulesVersion = 'digital-rules-specification-v0.1' as const;

export type PalaceDoorState = 'unknown' | 'trapped' | 'locked' | 'unlocked' | 'open' | 'broken';
export type PalaceConnectionResolution = 'unresolved' | 'discovered';

export interface PalaceExplorationSegment {
  readonly segmentId: string;
  readonly kind: 'entrance' | 'corridor' | 'room' | 'staircase';
  readonly searched: boolean;
  readonly searchEligible: boolean;
  readonly encounter: {
    readonly kind: 'empty' | 'ordinary';
    readonly livingMonsters: number;
    readonly alert: 'quiet' | 'alerted';
    readonly stealth: 'unavailable' | 'available' | 'hidden' | 'failed';
  };
}

export interface PalaceExplorationConnection {
  readonly connectionId: string;
  readonly sourceSegmentId: string;
  readonly destinationSegmentId: string | null;
  readonly state: PalaceConnectionResolution;
  readonly doorState: PalaceDoorState;
  readonly trapResolved: boolean;
  readonly alertState: 'quiet' | 'alerted';
}

export interface PalaceExplorationState {
  readonly dungeonId: string;
  readonly expeditionId: string;
  readonly adventurerId: string;
  readonly rulesVersion: typeof palaceExplorationRulesVersion;
  readonly contentVersion: string;
  readonly generationVersion: string;
  readonly revision: number;
  readonly status: 'active' | 'miner-exit' | 'dead' | 'complete';
  readonly currentSegmentId: string;
  readonly physicalLight: number;
  readonly virtualLight: number;
  readonly lightCharges: number;
  readonly activeLamp: boolean;
  readonly isMiner: boolean;
  readonly segments: readonly PalaceExplorationSegment[];
  readonly connections: readonly PalaceExplorationConnection[];
}

export type PalaceExplorationCommand =
  | {
      readonly kind: 'open-door';
      readonly connectionId: string;
      readonly doorRoll?: number;
      readonly trapSurvived?: boolean;
      readonly destinationSegment?: PalaceExplorationSegment;
    }
  | { readonly kind: 'unlock-door'; readonly connectionId: string }
  | {
      readonly kind: 'break-door';
      readonly connectionId: string;
      readonly destinationSegment?: PalaceExplorationSegment;
    }
  | { readonly kind: 'move'; readonly connectionId: string }
  | { readonly kind: 'search'; readonly searchRoll: number }
  | { readonly kind: 'stealth'; readonly rolls: readonly number[] }
  | { readonly kind: 'cast-light' };

export type PalaceActionCode = PalaceExplorationCommand['kind'];
export interface PalaceAvailableAction {
  readonly action: PalaceActionCode;
  readonly connectionId?: string;
  readonly enabled: boolean;
  readonly explanation?: string;
}

export type PalaceExplorationResult =
  | {
      readonly ok: false;
      readonly code: 'stale' | 'terminal' | 'foreign-target' | 'unavailable' | 'invalid-state';
      readonly explanation: string;
    }
  | {
      readonly ok: true;
      readonly state: PalaceExplorationState;
      readonly summary: string;
      readonly ruleIds: readonly string[];
      readonly randomEvidence: readonly {
        readonly stream: 'dungeon' | 'exploration';
        readonly purpose: string;
        readonly rolls: readonly number[];
      }[];
    };

const spendable = (state: PalaceExplorationState) => state.physicalLight + state.virtualLight;
const terminalReason = 'This expedition can no longer accept exploration actions.';

export function projectPalaceAvailableActions(
  state: PalaceExplorationState,
): readonly PalaceAvailableAction[] {
  if (state.status !== 'active')
    return [{ action: 'move', enabled: false, explanation: terminalReason }];
  const current = state.segments.find(({ segmentId }) => segmentId === state.currentSegmentId);
  if (!current)
    return [{ action: 'move', enabled: false, explanation: 'The committed position is invalid.' }];
  const blocked = current.encounter.livingMonsters > 0 && current.encounter.stealth !== 'hidden';
  const actions: PalaceAvailableAction[] = [];
  for (const connection of state.connections.filter(
    (connection) =>
      connection.sourceSegmentId === current.segmentId ||
      connection.destinationSegmentId === current.segmentId,
  )) {
    if (connection.state === 'discovered' && connection.destinationSegmentId !== null)
      actions.push({
        action: 'move',
        connectionId: connection.connectionId,
        enabled: !blocked,
        ...(blocked
          ? { explanation: 'Living monsters block movement until they are bypassed.' }
          : {}),
      });
    else {
      const reason = blocked ? 'Living monsters block door actions.' : undefined;
      if (connection.doorState === 'locked')
        actions.push(
          {
            action: 'unlock-door' as const,
            connectionId: connection.connectionId,
            enabled: !blocked && spendable(state) > 0,
            ...(!blocked && spendable(state) === 0
              ? { explanation: 'Opening this lock requires one spendable light unit.' }
              : reason
                ? { explanation: reason }
                : {}),
          },
          {
            action: 'break-door' as const,
            connectionId: connection.connectionId,
            enabled: !blocked,
            ...(reason ? { explanation: reason } : {}),
          },
        );
      else
        actions.push({
          action: 'open-door',
          connectionId: connection.connectionId,
          enabled: !blocked,
          ...(reason ? { explanation: reason } : {}),
        });
    }
  }
  actions.push({
    action: 'search',
    enabled: !blocked && current.searchEligible && !current.searched && spendable(state) > 0,
    ...(!current.searchEligible
      ? { explanation: 'This segment has no authorized search action.' }
      : current.searched
        ? { explanation: 'This segment has already been searched.' }
        : spendable(state) === 0
          ? { explanation: 'Searching requires one spendable light unit.' }
          : blocked
            ? { explanation: 'Living monsters block searching.' }
            : {}),
  });
  actions.push({
    action: 'stealth',
    enabled:
      current.encounter.kind === 'ordinary' &&
      current.encounter.livingMonsters > 0 &&
      current.encounter.alert === 'quiet' &&
      current.encounter.stealth === 'available' &&
      spendable(state) > 0,
    ...(current.encounter.kind !== 'ordinary'
      ? { explanation: 'There is no occupied room to bypass.' }
      : {}),
  });
  actions.push({
    action: 'cast-light',
    enabled: state.lightCharges > 0,
    ...(state.lightCharges === 0 ? { explanation: 'No Light charge remains.' } : {}),
  });
  return actions;
}

function consumeLight(state: PalaceExplorationState): PalaceExplorationState | null {
  if (state.virtualLight > 0) return { ...state, virtualLight: state.virtualLight - 1 };
  if (state.physicalLight > 0) return { ...state, physicalLight: state.physicalLight - 1 };
  return null;
}

function finishLightTiming(state: PalaceExplorationState): PalaceExplorationState {
  if (spendable(state) > 0 || state.lightCharges > 0 || state.activeLamp) return state;
  return { ...state, status: state.isMiner ? 'miner-exit' : 'dead' };
}

export function resolvePalaceExplorationAction(
  state: PalaceExplorationState,
  command: PalaceExplorationCommand,
  expectedRevision: number,
): PalaceExplorationResult {
  if (expectedRevision !== state.revision)
    return {
      ok: false,
      code: 'stale',
      explanation: 'The expedition changed; reload before trying again.',
    };
  if (state.status !== 'active')
    return { ok: false, code: 'terminal', explanation: terminalReason };
  if (
    state.rulesVersion !== palaceExplorationRulesVersion ||
    new Set(state.segments.map(({ segmentId }) => segmentId)).size !== state.segments.length ||
    new Set(state.connections.map(({ connectionId }) => connectionId)).size !==
      state.connections.length
  )
    return {
      ok: false,
      code: 'invalid-state',
      explanation: 'The committed Palace state is not canonical.',
    };
  const available = projectPalaceAvailableActions(state).find(
    (candidate) =>
      candidate.action === command.kind &&
      candidate.connectionId === ('connectionId' in command ? command.connectionId : undefined),
  );
  if (!available?.enabled)
    return {
      ok: false,
      code: available ? 'unavailable' : 'foreign-target',
      explanation:
        available?.explanation ?? 'The selected target is not legal from the current segment.',
    };
  let next = state;
  const evidence: Extract<PalaceExplorationResult, { ok: true }>['randomEvidence'][number][] = [];
  const replaceConnection = (
    connectionId: string,
    change: (value: PalaceExplorationConnection) => PalaceExplorationConnection,
  ) => {
    next = {
      ...next,
      connections: next.connections.map((value) =>
        value.connectionId === connectionId ? change(value) : value,
      ),
    };
  };
  const addDestination = (
    connectionId: string,
    destination?: PalaceExplorationSegment,
    doorState: PalaceDoorState = 'open',
  ) => {
    if (!destination) return false;
    next = { ...next, segments: [...next.segments, destination] };
    replaceConnection(connectionId, (connection) => ({
      ...connection,
      destinationSegmentId: destination.segmentId,
      state: 'discovered',
      doorState,
    }));
    return true;
  };
  if (command.kind === 'cast-light')
    next = { ...next, lightCharges: next.lightCharges - 1, virtualLight: next.virtualLight + 1 };
  else if (
    command.kind === 'search' ||
    command.kind === 'stealth' ||
    command.kind === 'unlock-door'
  ) {
    const paid = consumeLight(next)!;
    next = paid;
    if (command.kind === 'search') {
      next = {
        ...next,
        segments: next.segments.map((segment) =>
          segment.segmentId === next.currentSegmentId ? { ...segment, searched: true } : segment,
        ),
      };
      evidence.push({
        stream: 'exploration',
        purpose: 'secret-passage',
        rolls: [command.searchRoll],
      });
    } else if (command.kind === 'stealth') {
      if (
        command.rolls.length !==
          next.segments.find(({ segmentId }) => segmentId === next.currentSegmentId)!.encounter
            .livingMonsters ||
        command.rolls.some((roll) => roll < 1 || roll > 6)
      )
        return {
          ok: false,
          code: 'invalid-state',
          explanation: 'Stealth evidence does not match the committed encounter.',
        };
      const success = !command.rolls.includes(1);
      next = {
        ...next,
        segments: next.segments.map((segment) =>
          segment.segmentId === next.currentSegmentId
            ? {
                ...segment,
                encounter: {
                  ...segment.encounter,
                  stealth: success ? 'hidden' : 'failed',
                  alert: success ? 'quiet' : 'alerted',
                },
              }
            : segment,
        ),
      };
      evidence.push({ stream: 'exploration', purpose: 'move-silently', rolls: command.rolls });
    } else if (!addDestination(command.connectionId, undefined))
      replaceConnection(command.connectionId, (connection) => ({
        ...connection,
        doorState: 'unlocked',
      }));
    next = finishLightTiming(next);
  } else if (command.kind === 'open-door') {
    const connection = next.connections.find(
      ({ connectionId }) => connectionId === command.connectionId,
    )!;
    if (connection.doorState === 'unknown') {
      if (!command.doorRoll || command.doorRoll < 1 || command.doorRoll > 6)
        return {
          ok: false,
          code: 'invalid-state',
          explanation: 'A canonical door result is required.',
        };
      evidence.push({ stream: 'exploration', purpose: 'door-state', rolls: [command.doorRoll] });
      if (command.doorRoll <= 1)
        replaceConnection(command.connectionId, (value) => ({
          ...value,
          doorState: command.trapSurvived ? 'open' : 'unlocked',
          trapResolved: true,
        }));
      else if (command.doorRoll <= 3)
        replaceConnection(command.connectionId, (value) => ({ ...value, doorState: 'locked' }));
      else addDestination(command.connectionId, command.destinationSegment);
    } else addDestination(command.connectionId, command.destinationSegment);
  } else if (command.kind === 'break-door')
    addDestination(command.connectionId, command.destinationSegment, 'broken');
  else if (command.kind === 'move') {
    const connection = next.connections.find(
      ({ connectionId }) => connectionId === command.connectionId,
    )!;
    const destination =
      connection.sourceSegmentId === next.currentSegmentId
        ? connection.destinationSegmentId
        : connection.sourceSegmentId;
    if (!destination)
      return {
        ok: false,
        code: 'invalid-state',
        explanation: 'The connection has no committed destination.',
      };
    next = {
      ...next,
      currentSegmentId: destination,
      segments: next.segments.map((segment) =>
        segment.segmentId === state.currentSegmentId && segment.encounter.stealth === 'hidden'
          ? { ...segment, encounter: { ...segment.encounter, stealth: 'available' } }
          : segment,
      ),
    };
  }
  next = { ...next, revision: state.revision + 1 };
  return {
    ok: true,
    state: next,
    summary: `${command.kind} committed.`,
    ruleIds:
      command.kind === 'move'
        ? ['DRS-EXP-001']
        : command.kind === 'search'
          ? ['DRS-DOOR-014', 'DRS-EXP-013']
          : command.kind === 'stealth'
            ? ['DRS-EXP-003', 'DRS-EXP-004', 'DRS-EXP-005']
            : ['DRS-DOOR-001'],
    randomEvidence: evidence,
  };
}
