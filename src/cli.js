import { cwd } from 'node:process';
import { appendEvent, initialize, load, nextId, save } from './store.js';
import { startDashboard } from './dashboard.js';
import { evaluate, hasApproval } from './policy.js';
import { readWorkspaceFile, writeWorkspaceFile } from './workspace-tool.js';
import { inspectClaudeCode, promptClaudeCode } from './adapters/claude-code.js';
import { createWorkflowPlan } from './planner.js';
import { runWorkflow } from './scheduler.js';
import { inspectGit } from './integrations/git.js';
import { buildDockerImage, inspectDocker, runDockerTests } from './integrations/docker.js';

const taskStates = new Set(['created', 'planned', 'assigned', 'ready', 'running', 'waiting', 'blocked', 'review', 'completed', 'failed', 'cancelled']);
const taskStateAliases = new Map([
  ['pending', 'created'],
  ['queued', 'ready'],
  ['in_progress', 'running'],
  ['in-progress', 'running'],
  ['needs_review', 'review'],
  ['done', 'completed']
]);

const help = `CDOS v0.1 — local MVP

Usage:
  cdos init                    Initialize CDOS and configure Claude Code instructions
  cdos doctor
  cdos validate
  cdos agent list
  cdos task create <title> [--priority low|medium|high|critical]
  cdos task list
  cdos task run [task-id|--latest]
  cdos task status <task-id> <status>  (for example: running, review, completed)
  cdos workflow plan <goal>
  cdos workflow list
  cdos workflow run <workflow-id|--latest>
  cdos events [--limit number]
  cdos permission check <action> <workspace-relative-path>
  cdos approval request <action> <workspace-relative-path>
  cdos approval list
  cdos approval grant <approval-id>
  cdos tool read <workspace-relative-path>
  cdos tool write <workspace-relative-path> <content> --approval <approval-id>
  cdos model doctor
  cdos model prompt <prompt> --approval <approval-id>
  cdos integration doctor
  cdos tool git status
  cdos tool docker status
  cdos tool docker test --approval <approval-id>
  cdos tool docker build [--tag image:tag] --approval <approval-id>
  cdos dashboard [--port number] [--host address]`;

function option(args, name, fallback) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1] ?? fallback;
}

function printJson(value, out) {
  out(JSON.stringify(value, null, 2));
}

export async function runCli(args, { workingDirectory = cwd(), out = console.log } = {}) {
  const [area, action, ...rest] = args;
  if (!area || area === '--help' || area === 'help') return out(help);
  if (area === 'init') {
    const result = await initialize(workingDirectory);
    const stateMessage = result.created ? 'CDOS initialized in .cdos/.' : 'CDOS is already initialized.';
    return out(`${stateMessage} Claude Code instructions are available through CLAUDE.md.`);
  }
  if (area === 'dashboard') {
    const port = Number(option([action, ...rest], '--port', '4173'));
    const host = option([action, ...rest], '--host', '127.0.0.1');
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Dashboard port must be an integer between 1 and 65535.');
    await load(workingDirectory);
    return startDashboard({ cwd: workingDirectory, host, port, log: out });
  }
  const state = await load(workingDirectory);
  if (area === 'doctor') {
    return printJson({ status: 'ready', storage: 'json-local', agents: state.agents.length, workflows: state.workflows.length, tasks: state.tasks.length, events: state.events.length, policy_default: 'deny' }, out);
  }
  if (area === 'validate') {
    const valid = state.schema === 'cdos.state/v1' && Array.isArray(state.agents) && Array.isArray(state.workflows) && Array.isArray(state.tasks) && Array.isArray(state.events);
    if (!valid) throw new Error('State does not conform to the CDOS MVP storage contract.');
    return out('State contract: valid');
  }
  if (area === 'agent' && action === 'list') return printJson(state.agents, out);
  if (area === 'workflow' && action === 'list') return printJson(state.workflows, out);
  if (area === 'workflow' && action === 'plan') {
    const goal = rest.join(' ').trim();
    if (!goal) throw new Error('A workflow goal is required.');
    const { workflow, tasks } = createWorkflowPlan(state, goal);
    appendEvent(state, 'cdos.workflow.created', { workflow_id: workflow.id, goal, planner: workflow.planner });
    for (const task of tasks) appendEvent(state, 'cdos.task.created', { task_id: task.id, workflow_id: workflow.id, title: task.title });
    await save(workingDirectory, state);
    return printJson({ workflow, tasks }, out);
  }
  if (area === 'workflow' && action === 'run') {
    const requestedId = rest[0];
    const workflow = !requestedId || requestedId === '--latest'
      ? [...state.workflows].reverse().find((item) => !['completed', 'cancelled', 'failed'].includes(item.status))
      : state.workflows.find((item) => item.id === requestedId);
    if (!workflow) throw new Error(`Workflow not found: ${requestedId ?? 'a pending workflow'}`);
    const result = runWorkflow(state, workflow.id);
    await save(workingDirectory, state);
    return printJson(result, out);
  }
  if (area === 'task' && action === 'list') return printJson(state.tasks, out);
  if (area === 'task' && action === 'create') {
    const titleParts = rest.filter((value, index) => value !== '--priority' && rest[index - 1] !== '--priority');
    const title = titleParts.join(' ').trim();
    const priority = option(rest, '--priority', 'medium');
    if (!title) throw new Error('A task title is required.');
    if (!['low', 'medium', 'high', 'critical'].includes(priority)) throw new Error('Invalid priority.');
    const task = { schema: 'cdos.task/v1', id: nextId('task', state.tasks), title, status: 'created', priority, project_id: 'local-project', assigned_agent: null, created_at: new Date().toISOString() };
    state.tasks.push(task);
    appendEvent(state, 'cdos.task.created', { task_id: task.id, title: task.title, priority: task.priority });
    await save(workingDirectory, state);
    return printJson(task, out);
  }
  if (area === 'task' && action === 'status') {
    const [taskId, requestedStatus] = rest;
    const status = taskStateAliases.get(requestedStatus) ?? requestedStatus;
    if (!taskStates.has(status)) throw new Error('Invalid task status.');
    const task = state.tasks.find((item) => item.id === taskId);
    if (!task) throw new Error(`Task not found: ${taskId}`);
    task.status = status;
    appendEvent(state, `cdos.task.${status}`, { task_id: task.id, status });
    await save(workingDirectory, state);
    return printJson(task, out);
  }
  if (area === 'task' && action === 'run') {
    const requestedId = rest[0];
    const task = !requestedId || requestedId === '--latest'
      ? [...state.tasks].reverse().find((item) => !['completed', 'cancelled'].includes(item.status))
      : state.tasks.find((item) => item.id === requestedId);
    if (!task) {
      const description = requestedId && requestedId !== '--latest' ? requestedId : 'a pending task';
      throw new Error(`Task not found: ${description}`);
    }
    if (['completed', 'cancelled'].includes(task.status)) throw new Error(`Task ${task.id} cannot be run from ${task.status}.`);
    task.status = 'running';
    task.assigned_agent = 'project-manager';
    appendEvent(state, 'cdos.task.started', { task_id: task.id, agent_id: task.assigned_agent });
    task.status = 'completed';
    task.completed_at = new Date().toISOString();
    appendEvent(state, 'cdos.task.completed', { task_id: task.id, agent_id: task.assigned_agent, mode: 'simulated' });
    await save(workingDirectory, state);
    return printJson(task, out);
  }
  if (area === 'events') {
    const limit = Number(option([action, ...rest], '--limit', '20'));
    return printJson(state.events.slice(-limit).reverse(), out);
  }
  if (area === 'permission' && action === 'check') {
    const [permissionAction, resource] = rest;
    if (!permissionAction || !resource) throw new Error('Usage: cdos permission check <action> <workspace-relative-path>');
    return printJson(evaluate({ action: permissionAction, resource, workspace: workingDirectory }), out);
  }
  if (area === 'approval' && action === 'list') return printJson(state.approvals, out);
  if (area === 'approval' && action === 'request') {
    const [permissionAction, resource] = rest;
    if (!permissionAction || !resource) throw new Error('Usage: cdos approval request <action> <workspace-relative-path>');
    const policy = evaluate({ action: permissionAction, resource, workspace: workingDirectory });
    if (policy.decision !== 'require_approval') throw new Error(`This action does not require approval: ${policy.reason}`);
    const approval = { schema: 'cdos.approval/v1', id: nextId('approval', state.approvals), requested_by: { type: 'human', id: 'local-operator' }, action: permissionAction, resource: { type: 'workspace_file', id: resource }, status: 'pending', created_at: new Date().toISOString(), expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), reason: policy.reason };
    state.approvals.push(approval);
    appendEvent(state, 'cdos.approval.requested', { approval_id: approval.id, action: permissionAction, resource });
    await save(workingDirectory, state);
    return printJson(approval, out);
  }
  if (area === 'approval' && action === 'grant') {
    const approval = state.approvals.find((item) => item.id === rest[0]);
    if (!approval) throw new Error(`Approval not found: ${rest[0] ?? '(missing id)'}`);
    if (approval.status !== 'pending') throw new Error(`Approval ${approval.id} cannot be granted from ${approval.status}.`);
    approval.status = 'granted';
    approval.resolved_by = { type: 'human', id: 'local-operator' };
    approval.resolved_at = new Date().toISOString();
    appendEvent(state, 'cdos.approval.granted', { approval_id: approval.id, action: approval.action, resource: approval.resource.id });
    await save(workingDirectory, state);
    return printJson(approval, out);
  }
  if (area === 'tool' && action === 'read') {
    const resource = rest[0];
    const policy = evaluate({ action: 'filesystem.read', resource, workspace: workingDirectory });
    if (policy.decision !== 'allow') throw new Error(`Tool denied: ${policy.reason}`);
    const content = await readWorkspaceFile(workingDirectory, resource);
    appendEvent(state, 'cdos.tool.execution_completed', { action: 'filesystem.read', resource });
    await save(workingDirectory, state);
    return out(content);
  }
  if (area === 'tool' && action === 'write') {
    const resource = rest[0];
    const approvalId = option(rest, '--approval');
    const content = rest.slice(1, rest.indexOf('--approval') === -1 ? undefined : rest.indexOf('--approval')).join(' ');
    if (!resource || !content || !approvalId) throw new Error('Usage: cdos tool write <workspace-relative-path> <content> --approval <approval-id>');
    const policy = evaluate({ action: 'filesystem.write', resource, workspace: workingDirectory });
    if (policy.decision === 'deny') throw new Error(`Tool denied: ${policy.reason}`);
    if (!hasApproval(state, { approvalId, action: 'filesystem.write', resource })) throw new Error('Tool denied: a matching granted approval is required.');
    const result = await writeWorkspaceFile(workingDirectory, resource, content);
    appendEvent(state, 'cdos.tool.execution_completed', { action: 'filesystem.write', resource, approval_id: approvalId, bytes: result.bytes });
    await save(workingDirectory, state);
    return printJson(result, out);
  }
  if (area === 'integration' && action === 'doctor') {
    return printJson({ git: await inspectGit(workingDirectory), docker: await inspectDocker(workingDirectory) }, out);
  }
  if (area === 'tool' && action === 'git' && rest[0] === 'status') {
    const policy = evaluate({ action: 'git.inspect', resource: 'repository', workspace: workingDirectory });
    if (policy.decision !== 'allow') throw new Error(`Tool denied: ${policy.reason}`);
    const result = await inspectGit(workingDirectory);
    appendEvent(state, 'cdos.tool.execution_completed', { action: 'git.inspect', integration: 'git' }, 'cli');
    await save(workingDirectory, state);
    return printJson(result, out);
  }
  if (area === 'tool' && action === 'docker' && rest[0] === 'status') {
    const policy = evaluate({ action: 'docker.inspect', resource: 'docker', workspace: workingDirectory });
    if (policy.decision !== 'allow') throw new Error(`Tool denied: ${policy.reason}`);
    const result = await inspectDocker(workingDirectory);
    appendEvent(state, 'cdos.tool.execution_completed', { action: 'docker.inspect', integration: 'docker' }, 'cli');
    await save(workingDirectory, state);
    return printJson(result, out);
  }
  if (area === 'tool' && action === 'docker' && rest[0] === 'test') {
    const approvalId = option(rest, '--approval');
    if (!approvalId) throw new Error('Usage: cdos tool docker test --approval <approval-id>');
    if (!hasApproval(state, { approvalId, action: 'docker.run', resource: 'cdos-test' })) {
      throw new Error('Docker test denied: a matching granted approval is required.');
    }
    appendEvent(state, 'cdos.tool.execution_started', { action: 'docker.run', integration: 'docker', operation: 'test', approval_id: approvalId }, 'cli');
    try {
      const result = await runDockerTests(workingDirectory);
      appendEvent(state, 'cdos.tool.execution_completed', { action: 'docker.run', integration: 'docker', operation: 'test', approval_id: approvalId }, 'cli');
      await save(workingDirectory, state);
      return printJson(result, out);
    } catch (error) {
      appendEvent(state, 'cdos.tool.execution_failed', { action: 'docker.run', integration: 'docker', operation: 'test', approval_id: approvalId, error: error.message }, 'cli');
      await save(workingDirectory, state);
      throw error;
    }
  }
  if (area === 'tool' && action === 'docker' && rest[0] === 'build') {
    const approvalId = option(rest, '--approval');
    const tag = option(rest, '--tag', 'cdos:local');
    if (!/^[a-z0-9][a-z0-9._/-]*(?::[a-z0-9][a-z0-9._-]*)?$/i.test(tag)) throw new Error('Invalid Docker image tag.');
    if (!approvalId) throw new Error('Usage: cdos tool docker build [--tag image:tag] --approval <approval-id>');
    const resource = `image:${tag}`;
    if (!hasApproval(state, { approvalId, action: 'docker.build', resource })) {
      throw new Error('Docker build denied: a matching granted approval is required.');
    }
    appendEvent(state, 'cdos.tool.execution_started', { action: 'docker.build', integration: 'docker', tag, approval_id: approvalId }, 'cli');
    try {
      const result = await buildDockerImage(workingDirectory, tag);
      appendEvent(state, 'cdos.tool.execution_completed', { action: 'docker.build', integration: 'docker', tag, approval_id: approvalId }, 'cli');
      await save(workingDirectory, state);
      return printJson(result, out);
    } catch (error) {
      appendEvent(state, 'cdos.tool.execution_failed', { action: 'docker.build', integration: 'docker', tag, approval_id: approvalId, error: error.message }, 'cli');
      await save(workingDirectory, state);
      throw error;
    }
  }
  if (area === 'model' && action === 'doctor') return printJson(await inspectClaudeCode(), out);
  if (area === 'model' && action === 'prompt') {
    const approvalId = option(rest, '--approval');
    const prompt = rest.slice(0, rest.indexOf('--approval') === -1 ? undefined : rest.indexOf('--approval')).join(' ').trim();
    if (!prompt || !approvalId) throw new Error('Usage: cdos model prompt <prompt> --approval <approval-id>');
    const policy = evaluate({ action: 'model.invoke', resource: 'claude-code', workspace: workingDirectory });
    if (!hasApproval(state, { approvalId, action: 'model.invoke', resource: 'claude-code' })) {
      throw new Error(`Model denied: ${policy.reason}`);
    }
    appendEvent(state, 'cdos.model.invocation_started', { adapter: 'claude-code', approval_id: approvalId });
    try {
      const response = await promptClaudeCode(prompt);
      appendEvent(state, 'cdos.model.invocation_completed', { adapter: 'claude-code', approval_id: approvalId });
      await save(workingDirectory, state);
      return out(response);
    } catch (error) {
      appendEvent(state, 'cdos.model.invocation_failed', { adapter: 'claude-code', approval_id: approvalId, error: error.message });
      await save(workingDirectory, state);
      throw error;
    }
  }
  throw new Error(`Unknown command.\n\n${help}`);
}
