export type CanonicalJsonPrimitive = string | number | boolean | null;
export type CanonicalJsonValue =
  | CanonicalJsonPrimitive
  | readonly CanonicalJsonValue[]
  | { readonly [key: string]: CanonicalJsonValue };

export class CanonicalJsonError extends TypeError {
  readonly path: string;

  constructor(message: string, path: string) {
    super(`${path}: ${message}`);
    this.name = 'CanonicalJsonError';
    this.path = path;
  }
}

/**
 * Serializes JSON-compatible data with deterministic RFC 8785-style object-key ordering.
 *
 * This adapter is intentionally pure and host-neutral so the same input produces the same
 * bytes in Node tests and browser export/import or hashing code. It accepts only JSON
 * primitives, arrays, and plain objects. Unsupported JavaScript values fail before any
 * serialization output is returned.
 */
export function serializeCanonicalJson(value: unknown): string {
  return serializeCanonicalJsonValue(value, '$', new WeakSet<object>());
}

function serializeCanonicalJsonValue(
  value: unknown,
  path: string,
  ancestors: WeakSet<object>,
): string {
  if (value === null) {
    return 'null';
  }

  switch (typeof value) {
    case 'string':
      return JSON.stringify(value);
    case 'boolean':
      return value ? 'true' : 'false';
    case 'number':
      if (!Number.isFinite(value)) {
        throw new CanonicalJsonError('non-finite numbers are not supported', path);
      }
      return JSON.stringify(value);
    case 'undefined':
      throw new CanonicalJsonError('undefined is not a JSON-compatible value', path);
    case 'function':
      throw new CanonicalJsonError('functions are not JSON-compatible values', path);
    case 'bigint':
      throw new CanonicalJsonError('bigint values are not JSON-compatible values', path);
    case 'symbol':
      throw new CanonicalJsonError('symbols are not JSON-compatible values', path);
    case 'object':
      return serializeCanonicalJsonObject(value, path, ancestors);
    default:
      throw new CanonicalJsonError('unsupported JSON value type', path);
  }
}

function serializeCanonicalJsonObject(
  value: object,
  path: string,
  ancestors: WeakSet<object>,
): string {
  if (ancestors.has(value)) {
    throw new CanonicalJsonError('cyclic data cannot be canonicalized', path);
  }

  ancestors.add(value);

  try {
    if (Array.isArray(value)) {
      assertNoOwnSymbolKeys(value, path);
      assertArrayHasOnlyCanonicalIndexProperties(value, path);

      const items: string[] = [];

      for (let index = 0; index < value.length; index += 1) {
        if (!Object.hasOwn(value, index)) {
          throw new CanonicalJsonError('sparse arrays are not supported', `${path}[${index}]`);
        }

        items.push(serializeCanonicalJsonValue(value[index], `${path}[${index}]`, ancestors));
      }

      return `[${items.join(',')}]`;
    }

    if (!isPlainJsonObject(value)) {
      throw new CanonicalJsonError('only plain objects are supported', path);
    }

    assertNoOwnSymbolKeys(value, path);

    return `{${Object.keys(value)
      .sort()
      .map((key) => {
        const record = value as Record<string, unknown>;
        return `${JSON.stringify(key)}:${serializeCanonicalJsonValue(
          record[key],
          `${path}.${key}`,
          ancestors,
        )}`;
      })
      .join(',')}}`;
  } finally {
    ancestors.delete(value);
  }
}

function isPlainJsonObject(value: object): value is Record<string, unknown> {
  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
}

function assertNoOwnSymbolKeys(value: object, path: string): void {
  const [symbolKey] = Object.getOwnPropertySymbols(value);

  if (symbolKey !== undefined) {
    throw new CanonicalJsonError(
      `symbol-keyed properties are not JSON-compatible values (${String(symbolKey)})`,
      path,
    );
  }
}

function assertArrayHasOnlyCanonicalIndexProperties(value: readonly unknown[], path: string): void {
  for (const key of Object.getOwnPropertyNames(value)) {
    if (key === 'length') {
      continue;
    }

    if (!isCanonicalArrayIndexKey(key, value.length)) {
      throw new CanonicalJsonError(
        `array own property is not a canonical JSON array index: ${key}`,
        `${path}.${key}`,
      );
    }
  }
}

function isCanonicalArrayIndexKey(key: string, length: number): boolean {
  if (key === '0') {
    return length > 0;
  }

  if (!/^[1-9]\d*$/.test(key)) {
    return false;
  }

  const index = Number(key);

  return Number.isSafeInteger(index) && index >= 0 && index < length;
}
