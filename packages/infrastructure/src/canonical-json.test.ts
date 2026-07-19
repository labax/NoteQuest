import { describe, expect, it } from 'vitest';

import { CanonicalJsonError, serializeCanonicalJson } from './canonical-json.ts';

describe('canonical JSON serialization adapter', () => {
  it('serializes primitive JSON values deterministically', () => {
    expect(serializeCanonicalJson(null)).toBe('null');
    expect(serializeCanonicalJson(true)).toBe('true');
    expect(serializeCanonicalJson(false)).toBe('false');
    expect(serializeCanonicalJson('NoteQuest\\nfixture')).toBe('"NoteQuest\\\\nfixture"');
    expect(serializeCanonicalJson(0)).toBe('0');
    expect(serializeCanonicalJson(-0)).toBe('0');
    expect(serializeCanonicalJson(12.5)).toBe('12.5');
  });

  it('orders object keys consistently for manifest-like values', () => {
    const manifest = {
      version: 1,
      id: 'manifest.synthetic',
      content: { z: 'last', a: 'first', nested: { beta: 2, alpha: 1 } },
    };

    expect(serializeCanonicalJson(manifest)).toBe(
      '{"content":{"a":"first","nested":{"alpha":1,"beta":2},"z":"last"},"id":"manifest.synthetic","version":1}',
    );
  });

  it('preserves array order while canonicalizing nested objects', () => {
    const snapshotFixture = [{ b: 2, a: 1 }, ['x', { d: null, c: [3, 2, 1] }]];

    expect(serializeCanonicalJson(snapshotFixture)).toBe(
      '[{"a":1,"b":2},["x",{"c":[3,2,1],"d":null}]]',
    );
  });

  it('produces the same output for equivalent objects inserted in different orders', () => {
    const first = { beta: [{ y: false, x: true }], alpha: 'stable' };
    const second = { alpha: 'stable', beta: [{ x: true, y: false }] };

    expect(serializeCanonicalJson(first)).toBe(serializeCanonicalJson(second));
  });

  it('rejects unsupported values safely and predictably', () => {
    expect(() => serializeCanonicalJson({ field: undefined })).toThrow(CanonicalJsonError);
    expect(() => serializeCanonicalJson([undefined])).toThrow(
      'undefined is not a JSON-compatible value',
    );
    expect(() => serializeCanonicalJson({ fn: () => 'nope' })).toThrow(
      'functions are not JSON-compatible values',
    );
    expect(() => serializeCanonicalJson(Number.NaN)).toThrow(
      'non-finite numbers are not supported',
    );
    expect(() => serializeCanonicalJson(Number.POSITIVE_INFINITY)).toThrow(
      'non-finite numbers are not supported',
    );
    expect(() => serializeCanonicalJson(1n)).toThrow(
      'bigint values are not JSON-compatible values',
    );
    expect(() => serializeCanonicalJson(new Date('2026-01-01T00:00:00.000Z'))).toThrow(
      'only plain objects are supported',
    );
  });

  it('rejects sparse arrays with the missing element path', () => {
    const sparse = new Array<unknown>(2);
    sparse[1] = 'x';

    expect(() => serializeCanonicalJson(sparse)).toThrow(CanonicalJsonError);
    expect(() => serializeCanonicalJson(sparse)).toThrow('$[0]: sparse arrays are not supported');
  });

  it('rejects own symbol-keyed object properties instead of silently dropping them', () => {
    const symbolKey = Symbol('hidden');
    const value = { visible: true, [symbolKey]: 'unsupported' };

    expect(() => serializeCanonicalJson(value)).toThrow(CanonicalJsonError);
    expect(() => serializeCanonicalJson(value)).toThrow(
      '$: symbol-keyed properties are not JSON-compatible values (Symbol(hidden))',
    );
  });

  it('rejects own symbol-keyed array properties instead of silently dropping them', () => {
    const symbolKey = Symbol('arrayHidden');
    const value = ['visible'] as unknown[] & { [symbolKey]?: string };
    value[symbolKey] = 'unsupported';

    expect(() => serializeCanonicalJson(value)).toThrow(CanonicalJsonError);
    expect(() => serializeCanonicalJson(value)).toThrow(
      '$: symbol-keyed properties are not JSON-compatible values (Symbol(arrayHidden))',
    );
  });

  it('rejects extra own array string properties that are not canonical array indexes', () => {
    const value = ['visible'] as unknown[] & { extra?: string };
    value.extra = 'unsupported';

    expect(() => serializeCanonicalJson(value)).toThrow(CanonicalJsonError);
    expect(() => serializeCanonicalJson(value)).toThrow(
      '$.extra: array own property is not a canonical JSON array index: extra',
    );
  });

  it('rejects cyclic object and array graphs', () => {
    const cyclicObject: Record<string, unknown> = { id: 'cycle' };
    cyclicObject.self = cyclicObject;
    const cyclicArray: unknown[] = [];
    cyclicArray.push(cyclicArray);

    expect(() => serializeCanonicalJson(cyclicObject)).toThrow(
      'cyclic data cannot be canonicalized',
    );
    expect(() => serializeCanonicalJson(cyclicArray)).toThrow(
      'cyclic data cannot be canonicalized',
    );
  });
});
