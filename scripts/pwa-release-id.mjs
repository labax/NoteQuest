export const DEVELOPMENT_RELEASE_ID = 'development';

const releaseVariables = ['NOTEQUEST_RELEASE_ID', 'WORKERS_CI_COMMIT_SHA', 'GITHUB_SHA'];

export function resolvePwaReleaseId(environment, { allowDevelopment = false } = {}) {
  const source = releaseVariables.find((name) => environment[name] !== undefined);
  if (source === undefined) {
    if (allowDevelopment) return DEVELOPMENT_RELEASE_ID;
    throw new Error(
      `A production PWA release ID is required. Set one of: ${releaseVariables.join(', ')}.`,
    );
  }

  const releaseId = environment[source].trim();
  if (releaseId === '') throw new Error(`${source} must not be blank.`);
  if (releaseId === DEVELOPMENT_RELEASE_ID && !allowDevelopment) {
    throw new Error(`${source} must not use the development identity in a production build.`);
  }
  if (!/^[A-Za-z0-9._-]{1,128}$/.test(releaseId)) {
    throw new Error(
      `${source} must contain 1–128 cache-safe letters, digits, dots, underscores, or hyphens.`,
    );
  }
  return releaseId;
}
