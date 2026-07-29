import { useEffect, useRef, useState } from 'react';
import {
  validateAdventurerName,
  type AdventurerCreationCommitResult,
} from '@notequest/application';

import { focusTarget, focusValidationError } from './accessibility';

export interface AdventurerCreationUiPort {
  loadCommitted(slotId: string): Promise<AdventurerCreationCommitResult | null>;
  create(slotId: string, playerAuthoredName: string): Promise<AdventurerCreationCommitResult>;
}

export interface AdventurerCreationProps {
  readonly slotId: string;
  readonly port: AdventurerCreationUiPort;
  readonly onCancel: () => void;
  readonly onContinue: () => void;
}

type CreationViewState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'entry' }
  | { readonly kind: 'validation'; readonly message: string }
  | { readonly kind: 'committing' }
  | { readonly kind: 'failure'; readonly message: string }
  | {
      readonly kind: 'committed';
      readonly result: Extract<AdventurerCreationCommitResult, { ok: true }>;
    };

export function AdventurerCreation({
  slotId,
  port,
  onCancel,
  onContinue,
}: AdventurerCreationProps) {
  const [name, setName] = useState('');
  const [view, setView] = useState<CreationViewState>({ kind: 'loading' });
  const nameInput = useRef<HTMLInputElement>(null);
  const validationSummary = useRef<HTMLDivElement>(null);
  const stateHeading = useRef<HTMLHeadingElement>(null);
  const submissionPending = useRef(false);

  useEffect(() => {
    let active = true;
    void port
      .loadCommitted(slotId)
      .then((result) => {
        if (!active) return;
        if (result?.ok) {
          setName(result.playerAuthoredName);
          setView({ kind: 'committed', result });
        } else {
          setView({ kind: 'entry' });
        }
      })
      .catch(() => {
        if (active)
          setView({ kind: 'failure', message: 'The local creation state could not be checked.' });
      });
    return () => {
      active = false;
    };
  }, [port, slotId]);

  useEffect(() => {
    if (view.kind === 'entry') focusTarget(nameInput.current);
    else if (view.kind === 'validation') focusValidationError(document, validationSummary.current);
    else if (view.kind === 'failure' || view.kind === 'committed')
      focusTarget(stateHeading.current);
  }, [view.kind]);

  const create = async () => {
    if (submissionPending.current) return;
    const nameValidation = validateAdventurerName(name);
    if (!nameValidation.ok) {
      setView({ kind: 'validation', message: nameValidation.message });
      return;
    }
    submissionPending.current = true;
    setView({ kind: 'committing' });
    const result = await port.create(slotId, nameValidation.normalized).catch(() => null);
    submissionPending.current = false;
    if (result === null) {
      setView({
        kind: 'failure',
        message: 'Creation could not be saved. The previous slot state is unchanged.',
      });
    } else if (!result.ok) {
      setView({ kind: 'failure', message: result.message });
    } else {
      setView({ kind: 'committed', result });
    }
  };

  if (view.kind === 'loading') {
    return (
      <section className="creation-state-card" aria-busy="true" role="status">
        Checking this slot for a committed adventurer…
      </section>
    );
  }

  if (view.kind === 'committing') {
    return (
      <section
        className="creation-state-card"
        aria-busy="true"
        aria-labelledby="creation-saving-title"
      >
        <h3 id="creation-saving-title">Saving adventurer</h3>
        <p role="status">Committing the complete adventurer and creation evidence. Please wait.</p>
      </section>
    );
  }

  if (view.kind === 'committed') {
    const { state, evidence, playerAuthoredName } = view.result;
    return (
      <section className="creation-result" aria-labelledby="creation-complete-title">
        <div className="creation-result-header">
          <div>
            <p className="eyebrow">Committed local adventurer</p>
            <h3 id="creation-complete-title" ref={stateHeading} tabIndex={-1}>
              {playerAuthoredName}
            </h3>
          </div>
          <span className="state-badge">Saved</span>
        </div>
        <p role="status">
          Creation is saved. These results are committed and cannot be rerolled here.
        </p>
        <dl className="creation-summary">
          <div>
            <dt>Maximum HP</dt>
            <dd>{state.maxHp}</dd>
          </div>
          <div>
            <dt>Current HP</dt>
            <dd>{state.currentHp}</dd>
          </div>
          <div>
            <dt>Usable arms</dt>
            <dd>{state.usableArms}</dd>
          </div>
          <div>
            <dt>Usable hands</dt>
            <dd>{state.usableHands}</dd>
          </div>
          <div>
            <dt>Torches</dt>
            <dd>{state.torches}</dd>
          </div>
          <div>
            <dt>Coins</dt>
            <dd>{state.coins}</dd>
          </div>
        </dl>
        <div className="creation-columns">
          <section aria-labelledby="creation-identity-title">
            <h4 id="creation-identity-title">Generated adventurer</h4>
            <dl className="creation-details">
              <div>
                <dt>Race</dt>
                <dd>{evidence.race.resultLabel}</dd>
              </div>
              <div>
                <dt>Class</dt>
                <dd>{evidence.adventurerClass.resultLabel}</dd>
              </div>
              <div>
                <dt>Starting equipment</dt>
                <dd>{state.equipment.map((item) => item.label).join(', ')}</dd>
              </div>
              <div>
                <dt>Rules version</dt>
                <dd>{state.rulesVersion}</dd>
              </div>
              <div>
                <dt>Content version</dt>
                <dd>{state.contentVersion}</dd>
              </div>
            </dl>
          </section>
          <section aria-labelledby="creation-evidence-title">
            <h4 id="creation-evidence-title">Creation evidence</h4>
            <RollEvidence label="Race roll" roll={evidence.race} />
            <RollEvidence label="Class roll" roll={evidence.adventurerClass} />
            {evidence.spells.map((roll, index) => (
              <RollEvidence
                key={roll.rollResultId}
                label={`Starting spell roll ${index + 1}`}
                roll={roll}
              />
            ))}
          </section>
        </div>
        <div className="creation-actions">
          <button type="button" onClick={onContinue}>
            Continue to Palace entry
          </button>
        </div>
      </section>
    );
  }

  const failure = view.kind === 'failure';
  const validation = view.kind === 'validation';
  return (
    <section className="creation-entry" aria-labelledby="creation-entry-title">
      <div className="creation-entry-copy">
        <p className="eyebrow">Canonical mode</p>
        <h3
          id="creation-entry-title"
          ref={failure ? stateHeading : undefined}
          tabIndex={failure ? -1 : undefined}
        >
          Name your adventurer
        </h3>
        <p>
          Your name is private to this local save. Mechanical results are generated and saved as one
          action.
        </p>
        <p>There is no free reroll after a successful save.</p>
      </div>
      {failure ? (
        <div className="inline-error" role="alert">
          <h4 tabIndex={-1}>Creation was not saved</h4>
          <p>{view.message}</p>
          <p>The prior slot remains available. Retry uses the same canonical creation process.</p>
        </div>
      ) : null}
      {validation ? (
        <div ref={validationSummary} className="inline-error" role="alert" tabIndex={-1}>
          <strong>Check the adventurer name.</strong> {view.message}
        </div>
      ) : null}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void create();
        }}
        noValidate
      >
        <label htmlFor="adventurer-name">Adventurer name</label>
        <input
          id="adventurer-name"
          ref={nameInput}
          value={name}
          aria-invalid={validation || undefined}
          aria-describedby="adventurer-name-help"
          onChange={(event) => {
            setName(event.target.value);
            if (validation) setView({ kind: 'entry' });
          }}
        />
        <p id="adventurer-name-help">Stored only in this browser’s local save slot.</p>
        <div className="creation-actions">
          <button type="button" onClick={onCancel}>
            Back to save slots
          </button>
          <button type="submit">Create and save adventurer</button>
        </div>
      </form>
    </section>
  );
}

function RollEvidence({
  label,
  roll,
}: {
  readonly label: string;
  readonly roll: {
    readonly naturalDice: readonly number[];
    readonly finalValue: number;
    readonly resultLabel: string;
  };
}) {
  return (
    <dl className="roll-evidence">
      <div>
        <dt>{label}</dt>
        <dd>
          {roll.naturalDice.join(' + ')} = {roll.finalValue}
        </dd>
      </div>
      <div>
        <dt>Result</dt>
        <dd>{roll.resultLabel}</dd>
      </div>
    </dl>
  );
}
