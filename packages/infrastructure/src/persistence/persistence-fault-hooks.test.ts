import { describe, expect, it } from 'vitest';

import { injectedFaultMessage, injectedFaultPoint } from './persistence-fault-hooks';

describe('persistence fault classification', () => {
  it('does not classify unrelated errors with a point property as injected faults', () => {
    const unrelated = Object.assign(new Error('ordinary storage failure'), {
      point: 'transaction.after-completion-before-receipt',
    });
    expect(injectedFaultPoint(unrelated)).toBeNull();
    expect(injectedFaultMessage(unrelated)).toBeNull();
  });

  it('requires both the recognised identity and a registered point', () => {
    const recognised = Object.assign(new Error('injected'), {
      name: ['Injected', 'Persistence', 'Fault'].join(''),
      point: 'transaction.after-completion-before-receipt',
    });
    expect(injectedFaultPoint(recognised)).toBe('transaction.after-completion-before-receipt');
    expect(injectedFaultMessage(recognised)).toBe('injected');

    const unknownPoint = Object.assign(new Error('not registered'), {
      name: ['Injected', 'Persistence', 'Fault'].join(''),
      point: 'transaction.not-a-real-point',
    });
    expect(injectedFaultPoint(unknownPoint)).toBeNull();
  });
});
