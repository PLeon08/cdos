import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const statePath = (cwd) => join(cwd, '.cdos', 'state.json');
const claudeGuidePath = (cwd) => join(cwd, '.cdos', 'claude.md');
const projectClaudePath = (cwd) => join(cwd, 'CLAUDE.md');

const claudeGuide = `# CDOS workflow\n\nCDOS is installed in this project to coordinate work safely. When the user asks to implement, prepare, release, or deploy something:\n\n1. Inspect the repository and explain the proposed outcome briefly.\n2. Create a workflow with \`npx cdos workflow plan \"<user goal>\"\`.\n3. Run it with \`npx cdos workflow run --latest\` and report its tasks/status to the user.\n4. Use CDOS approvals before sensitive operations. Never invent an approval ID: request it, show it to the user, and only continue after it is granted.\n5. For implementation work, use your normal Claude Code tools; use CDOS to record the plan, progress, approvals, and verification.\n\nWhen updating an individual task, use CDOS states: \`created\`, \`planned\`, \`assigned\`, \`ready\`, \`running\`, \`waiting\`, \`blocked\`, \`review\`, \`completed\`, \`failed\`, or \`cancelled\`. In particular, use \`running\`, not \`in_progress\`.\n\nUseful inspection commands: \`npx cdos workflow list\`, \`npx cdos task list\`, \`npx cdos events\`, \`npx cdos doctor\`.\n\nCDOS does not itself deploy infrastructure. Perform the actual deployment only after explaining the target and receiving the user\'s approval through Claude Code.\n`;
const claudeImport = '@.cdos/claude.md';

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
  const claude = await provisionClaudeInstructions(cwd);
  try {
    await readFile(path, 'utf8');
    return { created: false, state: await load(cwd), claude };
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const state = createInitialState();
    await save(cwd, state);
    return { created: true, state, claude };
  }
}

async function provisionClaudeInstructions(cwd) {
  await writeFile(claudeGuidePath(cwd), claudeGuide, 'utf8');
  try {
    const content = await readFile(projectClaudePath(cwd), 'utf8');
    if (content.includes(claudeImport)) return { configured: true, created_project_file: false };
    const prefix = content.endsWith('\n') ? '\n' : '\n\n';
    await appendFile(projectClaudePath(cwd), `${prefix}${claudeImport}\n`, 'utf8');
    return { configured: true, created_project_file: false };
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await writeFile(projectClaudePath(cwd), `${claudeImport}\n`, 'utf8');
    return { configured: true, created_project_file: true };
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
