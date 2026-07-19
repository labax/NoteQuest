import { describe, expect, it } from 'vitest';
import type { AdventurerId, EventId, SaveSlotId } from '../primitives/index.ts';
import {
  blockedResult,
  isCommandBlocked,
  successResult,
  validationErrorResult,
  type AdventurerCreatedEvent,
  type CommandId,
  type ContentVersion,
  type CreateAdventurerCommand,
  type EventSequence,
  type EventStateSnapshot,
  type IsoDateTimeString,
  type RulesVersion,
  type ValidationIssue,
} from './models.ts';

const commandId = 'command-001' as CommandId;
const slotId = 'slot-a' as SaveSlotId;
const issuedAt = '2026-07-19T00:00:00.000Z' as IsoDateTimeString;

function createCommand(): CreateAdventurerCommand {
  return {
    type: 'create_adventurer',
    module: 'adventurer',
    slotId,
    playerAuthoredName: 'Project original name',
    creationMode: 'canonical_random',
    metadata: {
      commandId,
      idempotencyKey: 'create-slot-a-adventurer' as never,
      correlationId: 'flow-001' as never,
      issuedAt,
      expectedStateRevision: 0,
    },
  };
}

describe('mechanical command/result/event models', () => {
  it('represents validation outcomes without committing events', () => {
    const command = createCommand();
    const issue: ValidationIssue = {
      code: 'required',
      path: 'slotId',
      message: 'slotId is required',
      severity: 'error',
    };

    const result = validationErrorResult(command, [issue]);

    expect(result).toMatchObject({
      status: 'validation_error',
      committed: false,
      commandId,
      issues: [issue],
    });
  });

  it('distinguishes warning guards from blocking guards at result boundaries', () => {
    const guard = {
      commandId,
      legal: true,
      checks: [
        {
          code: 'low_torches_warning',
          message: 'The adventurer is low on torches.',
          satisfied: false,
          severity: 'warning' as const,
        },
      ],
    };

    expect(isCommandBlocked(guard)).toBe(false);
  });

  it('omits optional correlation IDs from result boundaries when absent', () => {
    const command = {
      ...createCommand(),
      metadata: { commandId },
    };

    expect(validationErrorResult(command, [])).not.toHaveProperty('correlationId');
    expect(successResult(command, 2, [])).not.toHaveProperty('correlationId');
  });

  it('represents blocked guard outcomes for illegal mechanical actions', () => {
    const command = createCommand();
    const guard = {
      commandId,
      legal: false,
      checks: [
        {
          code: 'slot_already_has_living_adventurer',
          message: 'A new adventurer cannot be created while the slot has an active adventurer.',
          satisfied: false,
          severity: 'blocker' as const,
          requirementIds: ['FA-003'],
        },
      ],
    };

    expect(isCommandBlocked(guard)).toBe(true);
    expect(blockedResult(command, guard)).toMatchObject({
      status: 'blocked',
      committed: false,
      guard,
    });
  });

  it('represents a successful committed event with metadata for history and persistence', () => {
    const command = createCommand();
    const beforeSnapshot = {
      slotState: 'empty',
      resources: { coins: 0, torches: 10 },
      activeEffects: ['none'],
      latestRoll: null,
      flags: { canonicalCreation: true },
    } satisfies EventStateSnapshot;
    const afterSnapshot = {
      slotState: 'active_adventurer',
      resources: { coins: 0, torches: 10 },
      activeEffects: [],
      createdEventSequence: 1,
      flags: { canonicalCreation: true },
    } satisfies EventStateSnapshot;

    const event: AdventurerCreatedEvent = {
      type: 'adventurer_created',
      module: 'adventurer',
      adventurerId: '00000000-0000-4000-8000-000000000001' as AdventurerId,
      summary: 'Adventurer record created from a canonical mechanical request.',
      requirementIds: ['DRS-ADV-001', 'DRS-HIST-001'],
      entities: {
        slotId,
        adventurerId: '00000000-0000-4000-8000-000000000001' as AdventurerId,
      },
      metadata: {
        eventId: '00000000-0000-4000-8000-000000000101' as EventId,
        sequence: 1 as EventSequence,
        commandId,
        ...(command.metadata.correlationId === undefined
          ? {}
          : { correlationId: command.metadata.correlationId }),
        occurredAt: issuedAt,
        rulesVersion: 'rules.notequest-core@0.1' as RulesVersion,
        contentVersion: 'content.notequest-core@0.1' as ContentVersion,
        stateRevision: 1,
        schemaVersion: 1,
      },
      rollRefs: [],
      before: beforeSnapshot,
      after: afterSnapshot,
    };

    const result = successResult(command, 1, [event]);

    expect(result.status).toBe('success');
    expect(result.committed).toBe(true);
    expect(result.events[0]?.metadata).toMatchObject({
      commandId,
      sequence: 1,
      stateRevision: 1,
      schemaVersion: 1,
    });
    expect(result.events[0]?.before).toEqual(beforeSnapshot);
    expect(result.events[0]?.after).toEqual(afterSnapshot);
  });
});
