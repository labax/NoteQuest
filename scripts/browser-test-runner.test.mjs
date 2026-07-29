import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BROWSER_SMOKE_RELEASE_ID,
  browserTestEnvironment,
  runBrowserTests,
} from './browser-test-runner.mjs';

test('supplies the synthetic browser release only when no release identity exists', () => {
  assert.equal(browserTestEnvironment({}).NOTEQUEST_RELEASE_ID, BROWSER_SMOKE_RELEASE_ID);
});

test('preserves every explicit release identity source', () => {
  assert.deepEqual(browserTestEnvironment({ NOTEQUEST_RELEASE_ID: 'explicit-release' }), {
    NOTEQUEST_RELEASE_ID: 'explicit-release',
  });
  assert.deepEqual(browserTestEnvironment({ GITHUB_SHA: 'immutable-ci-sha' }), {
    GITHUB_SHA: 'immutable-ci-sha',
  });
  assert.deepEqual(browserTestEnvironment({ NOTEQUEST_RELEASE_ID: '' }), {
    NOTEQUEST_RELEASE_ID: '',
  });
});

test('stops at and propagates a non-zero child status', () => {
  const calls = [];
  const status = runBrowserTests({
    environment: {},
    run(script, environment) {
      calls.push({ script, release: environment.NOTEQUEST_RELEASE_ID });
      return 23;
    },
  });
  assert.equal(status, 23);
  assert.deepEqual(calls, [{ script: 'build', release: BROWSER_SMOKE_RELEASE_ID }]);
});
