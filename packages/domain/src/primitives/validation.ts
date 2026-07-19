import { invalid, valid, type DomainResult } from './result.ts';

export type PositiveInteger = number & { readonly __brand: 'PositiveInteger' };
export type NonNegativeInteger = number & { readonly __brand: 'NonNegativeInteger' };

export function createNonEmptyText(value: string, path: string): DomainResult<string> {
  const normalized = value.trim();

  if (normalized.length === 0) {
    return invalid({ code: 'required', path, message: `${path} is required` });
  }

  return valid(normalized);
}

export function createIntegerInRange(
  value: number,
  path: string,
  minimum: number,
  maximum: number,
): DomainResult<number> {
  if (!Number.isInteger(value)) {
    return invalid({ code: 'not_integer', path, message: `${path} must be an integer` });
  }

  if (value < minimum || value > maximum) {
    return invalid({
      code: 'out_of_range',
      path,
      message: `${path} must be between ${minimum} and ${maximum}`,
    });
  }

  return valid(value);
}

export function createPositiveInteger(value: number, path: string): DomainResult<PositiveInteger> {
  const result = createIntegerInRange(value, path, 1, Number.MAX_SAFE_INTEGER);

  return result.ok ? valid(result.value as PositiveInteger) : result;
}

export function createNonNegativeInteger(
  value: number,
  path: string,
): DomainResult<NonNegativeInteger> {
  const result = createIntegerInRange(value, path, 0, Number.MAX_SAFE_INTEGER);

  return result.ok ? valid(result.value as NonNegativeInteger) : result;
}
