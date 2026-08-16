import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runCli } from '../src/cli.js';

async function invoke(args, directory) {
  const output = [];
  await runCli(args, { workingDirectory: directory, out: (line) => output.push(line) });
  return output.join('\n');
}

test('requires and records approval before a workspace write', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'cdos-policy-'));
  await invoke(['init'], directory);
  await assert.rejects(() => invoke(['tool', 'write', 'note.txt', 'hello', '--approval', 'approval-0001'], directory), /matching granted approval/);
  const approval = JSON.parse(await invoke(['approval', 'request', 'filesystem.write', 'note.txt'], directory));
  await invoke(['approval', 'grant', approval.id], directory);
  await invoke(['tool', 'write', 'note.txt', 'hello', '--approval', approval.id], directory);
  assert.equal(await readFile(join(directory, 'note.txt'), 'utf8'), 'hello');
});

test('marks model use as an approval-required action', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'cdos-policy-'));
  await invoke(['init'], directory);
  const output = JSON.parse(await invoke(['permission', 'check', 'model.invoke', 'claude-code'], directory));
  assert.equal(output.decision, 'require_approval');
});

test('allows read-only integration inspection and gates state changes', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'cdos-policy-'));
  await invoke(['init'], directory);
  const inspect = JSON.parse(await invoke(['permission', 'check', 'git.inspect', 'repository'], directory));
  const change = JSON.parse(await invoke(['permission', 'check', 'docker.run', 'docker'], directory));
  const build = JSON.parse(await invoke(['permission', 'check', 'docker.build', 'image:cdos:local'], directory));
  assert.equal(inspect.decision, 'allow');
  assert.equal(change.decision, 'require_approval');
  assert.equal(build.decision, 'require_approval');
});
