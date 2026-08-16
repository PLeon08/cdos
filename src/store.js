import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const statePath = (cwd) => join(cwd, '.cdos', 'state.json');

export function createInitialState() {
  const now = new Date().toISOString();
  return {
    schema: 'cdos.state/v1',
    version: 1,
    created_at: now,
    updated_at: now,
    agents: [
      {
        id: 'project-manager',
        name: 'Project Manager',
        role: 'project_manager',
        status: 'ready',
        capabilities: ['planning', 'delegation'],
        permissions: ['task.create', 'task.assign', 'workflow.manage']
      }
    ],
    tasks: [],
    workflows: [],
    events: [],
    approvals: [],
    policies: [{ id: 'mvp-workspace-policy', default_decision: 'deny' }]
  };
}

export async function initialize(cwd) {
  const path = statePath(cwd);
  await mkdir(dirname(path), { recursive: true });
  try {
    await readFile(path, 'utf8');
    return { created: false, state: await load(cwd) };
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const state = createInitialState();
    await save(cwd, state);
    return { created: true, state };
  }
}

export async function load(cwd) {
  try {
    const state = JSON.parse(await readFile(statePath(cwd), 'utf8'));
    state.workflows ??= [];
    state.approvals ??= [];
    state.policies ??= [{ id: 'mvp-workspace-policy', default_decision: 'deny' }];
    return state;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error('CDOS is not initialized. Run `cdos init` first.');
    }
    throw new Error(`Unable to read CDOS state: ${error.message}`);
  }
}

export async function save(cwd, state) {
  state.updated_at = new Date().toISOString();
  await writeFile(statePath(cwd), `${JSON.stringify(state, null, 2)}\n`, 'utf8');
}

export function nextId(prefix, records) {
  const used = new Set(records.map((record) => record.id));
  let sequence = records.length + 1;
  let id = `${prefix}-${String(sequence).padStart(4, '0')}`;
  while (used.has(id)) {
    sequence += 1;
    id = `${prefix}-${String(sequence).padStart(4, '0')}`;
  }
  return id;
}

export function appendEvent(state, eventType, payload, source = 'cli') {
  const event = {
    schema: 'cdos.event/v1',
    event_id: nextId('evt', state.events),
    event_type: eventType,
    timestamp: new Date().toISOString(),
    source: { component: source },
    correlation_id: payload.task_id ?? payload.agent_id ?? 'system',
    payload
  };
  state.events.push(event);
  return event;
}
