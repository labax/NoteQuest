export type CanonicalJsonPrimitive = string | number | boolean | null;
export type CanonicalJsonValue =
  | CanonicalJsonPrimitive
  | readonly CanonicalJsonValue[]
  | { readonly [key: string]: CanonicalJsonValue };

export class CanonicalJsonError extends TypeError {
  constructor(
    message: string,
    readonly path: string,
  ) {
    super(`${path}: ${message}`);
    this.name = 'CanonicalJsonError';
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
      return `[${value
        .map((item, index) => serializeCanonicalJsonValue(item, `${path}[${index}]`, ancestors))
        .join(',')}]`;
    }

    if (!isPlainJsonObject(value)) {
      throw new CanonicalJsonError('only plain objects are supported', path);
    }

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
