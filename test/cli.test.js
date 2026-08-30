import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runCli } from '../src/cli.js';
import { load } from '../src/store.js';

async function invoke(args, directory) {
  const output = [];
  await runCli(args, { workingDirectory: directory, out: (line) => output.push(line) });
  return output.join('\n');
}

test('initializes, creates and completes a task with events', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'cdos-test-'));
  await invoke(['init'], directory);
  const created = JSON.parse(await invoke(['task', 'create', 'Draft', 'design', '--priority', 'high'], directory));
  assert.equal(created.status, 'created');
  const completed = JSON.parse(await invoke(['task', 'run', created.id], directory));
  assert.equal(completed.status, 'completed');
  const state = await load(directory);
  assert.deepEqual(state.events.map((event) => event.event_type), ['cdos.task.created', 'cdos.task.started', 'cdos.task.completed']);
});

test('initialization provisions Claude Code instructions without overwriting project instructions', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'cdos-test-'));
  await writeFile(join(directory, 'CLAUDE.md'), '# Project conventions\n', 'utf8');
  await invoke(['init'], directory);
  const projectInstructions = await readFile(join(directory, 'CLAUDE.md'), 'utf8');
  const cdosInstructions = await readFile(join(directory, '.cdos', 'claude.md'), 'utf8');
  assert.match(projectInstructions, /# Project conventions/);
  assert.match(projectInstructions, /@\.cdos\/claude\.md/);
  assert.match(cdosInstructions, /npx cdos workflow plan/);
});

test('rejects task statuses outside the contract', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'cdos-test-'));
  await invoke(['init'], directory);
  await assert.rejects(() => invoke(['task', 'status', 'task-0001', 'unknown'], directory), /Invalid task status/);
});

test('runs the latest pending task without relying on a fixed task id', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'cdos-test-'));
  await invoke(['init'], directory);
  const first = JSON.parse(await invoke(['task', 'create', 'First'], directory));
  await invoke(['task', 'run', first.id], directory);
  const second = JSON.parse(await invoke(['task', 'create', 'Second'], directory));
  const completed = JSON.parse(await invoke(['task', 'run', '--latest'], directory));
  assert.equal(completed.id, second.id);
  assert.equal(completed.status, 'completed');
});

test('creates a deployment workflow with approval-gated deployment work', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'cdos-test-'));
  await invoke(['init'], directory);
  const result = JSON.parse(await invoke(['workflow', 'plan', 'Desplegar', 'CDOS'], directory));
  assert.equal(result.workflow.status, 'created');
  assert.equal(result.tasks.length, 5);
  assert.ok(result.tasks.some((task) => task.requires_approval));
});

test('scheduler blocks deployment work until its approval is granted', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'cdos-test-'));
  await invoke(['init'], directory);
  const planned = JSON.parse(await invoke(['workflow', 'plan', 'Desplegar', 'CDOS'], directory));
  const firstRun = JSON.parse(await invoke(['workflow', 'run', planned.workflow.id], directory));
  assert.equal(firstRun.workflow.status, 'blocked');
  assert.equal(firstRun.completed.length, 4);
  await invoke(['approval', 'grant', firstRun.blocked_by.id], directory);
  const finalRun = JSON.parse(await invoke(['workflow', 'run', planned.workflow.id], directory));
  assert.equal(finalRun.workflow.status, 'completed');
});
