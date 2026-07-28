export const DEVELOPMENT_RELEASE_ID: 'development';

export function resolvePwaReleaseId(
  environment: Readonly<Record<string, string | undefined>>,
  options?: { readonly allowDevelopment?: boolean },
): string;
