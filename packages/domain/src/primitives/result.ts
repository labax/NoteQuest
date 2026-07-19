export type DomainIssueCode =
  'required' | 'invalid_format' | 'out_of_range' | 'not_integer' | 'not_unique';

export interface DomainIssue {
  readonly code: DomainIssueCode;
  readonly path: string;
  readonly message: string;
}

export type DomainResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly issues: readonly DomainIssue[] };

export function valid<T>(value: T): DomainResult<T> {
  return { ok: true, value };
}

export function invalid(issue: DomainIssue): DomainResult<never> {
  return { ok: false, issues: [issue] };
}
