import assert from 'node:assert/strict';
import test from 'node:test';
import { DEVELOPMENT_RELEASE_ID, resolvePwaReleaseId } from './pwa-release-id.mjs';

test('uses the documented provider priority', () => {
  assert.equal(
    resolvePwaReleaseId({
      NOTEQUEST_RELEASE_ID: 'explicit',
      WORKERS_CI_COMMIT_SHA: 'cloudflare',
      GITHUB_SHA: 'github',
    }),
    'explicit',
  );
  assert.equal(
    resolvePwaReleaseId({ WORKERS_CI_COMMIT_SHA: 'cloudflare', GITHUB_SHA: 'github' }),
    'cloudflare',
  );
  assert.equal(resolvePwaReleaseId({ GITHUB_SHA: 'github' }), 'github');
});

test('different release inputs produce distinct cache suffix identities', () => {
  assert.notEqual(
    resolvePwaReleaseId({ NOTEQUEST_RELEASE_ID: 'release-one' }),
    resolvePwaReleaseId({ NOTEQUEST_RELEASE_ID: 'release-two' }),
  );
});

test('permits the fallback only for development and test contexts', () => {
  assert.equal(resolvePwaReleaseId({}, { allowDevelopment: true }), DEVELOPMENT_RELEASE_ID);
  assert.throws(() => resolvePwaReleaseId({}), /production PWA release ID is required/);
  assert.throws(
    () => resolvePwaReleaseId({ NOTEQUEST_RELEASE_ID: DEVELOPMENT_RELEASE_ID }),
    /must not use the development identity/,
  );
  assert.throws(() => resolvePwaReleaseId({ NOTEQUEST_RELEASE_ID: '  ' }), /must not be blank/);
});
