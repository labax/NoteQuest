import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

export const BROWSER_SMOKE_RELEASE_ID = 'b805e5f00d79a36d68f5f73bf32d94aca1f749a1';
const releaseVariables = ['NOTEQUEST_RELEASE_ID', 'WORKERS_CI_COMMIT_SHA', 'GITHUB_SHA'];

export function browserTestEnvironment(source) {
  const environment = { ...source };
  if (!releaseVariables.some((name) => environment[name] !== undefined)) {
    environment.NOTEQUEST_RELEASE_ID = BROWSER_SMOKE_RELEASE_ID;
  }
  return environment;
}

export function runNpmScript(script, environment) {
  const npmCli = environment.npm_execpath;
  if (!npmCli) throw new Error('npm_execpath is required to run browser tests through npm.');
  const result = spawnSync(process.execPath, [npmCli, 'run', script], {
    cwd: process.cwd(),
    env: environment,
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  return result.status ?? 1;
}

export function runBrowserTests({ environment = process.env, run = runNpmScript } = {}) {
  const resolved = browserTestEnvironment(environment);
  for (const script of ['build', 'test:browser:all']) {
    const status = run(script, resolved);
    if (status !== 0) return status;
  }
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exitCode = runBrowserTests();
}
