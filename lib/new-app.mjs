import assert from 'node:assert';
import { join } from 'node:path';
import { execa } from 'execa';
import tmp from 'tmp-promise';
import { sync as resolveBinSync } from 'resolve-bin';

function findEmber() {
  return resolveBinSync('ember-cli', { executable: 'ember' });
}

export const emberCli = findEmber();

const blueprintPath = join(import.meta.dirname, '..');

export async function newApp(options) {
  const name = options.name;
  const flags = options.flags ?? [];

  assert(name, `newApp({ name }) is required`);
  assert(Array.isArray(flags), `Option, flags, must be an array`);

  let tmpDir = await tmp.dir({ unsafeCleanup: true });

  let emberCliArgs = ['new', name, '-b', blueprintPath, '--pnpm', ...flags];

  const { stdout } = await execa(emberCli, emberCliArgs, {
    cwd: tmpDir.path,
    preferLocal: true,
  });

  for (const line of stdout.split('\n')) {
    console.log(line);
  }

  const { stdout: stdoutPnpm } = await execa('pnpm', ['list'], {
    cwd: tmpDir.path,
    preferLocal: true,
  });

  for (const line of stdoutPnpm.split('\n')) {
    console.log(line);
  }

  return {
    /**
     * Result from tmp-promise
     * (used for cleanup, later)
     */
    tmp: tmpDir,
    /**
     * The actual tmp path
     */
    tmpDir: tmpDir.path,
    /**
     * The name of the app
     */
    appName: name,
    /**
     * The directory of the app
     */
    dir: join(tmpDir.path, name),
  };
}
