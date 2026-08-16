import { appendEvent, nextId } from './store.js';

function dependenciesComplete(state, task) {
  return task.dependencies.every((id) => state.tasks.find((candidate) => candidate.id === id)?.status === 'completed');
}

function requestDeploymentApproval(state, task) {
  if (task.approval_id) return state.approvals.find((approval) => approval.id === task.approval_id);
  const approval = {
    schema: 'cdos.approval/v1',
    id: nextId('approval', state.approvals),
    requested_by: { type: 'agent', id: 'project-manager' },
    action: 'deployment.execute',
    resource: { type: 'project', id: 'local-project' },
    status: 'pending',
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    reason: `Workflow task requires explicit deployment approval: ${task.title}`
  };
  state.approvals.push(approval);
  task.approval_id = approval.id;
  appendEvent(state, 'cdos.approval.requested', { approval_id: approval.id, task_id: task.id, action: approval.action, resource: approval.resource.id }, 'scheduler');
  return approval;
}

function approvalGranted(state, task) {
  return Boolean(task.approval_id && state.approvals.find((approval) => approval.id === task.approval_id)?.status === 'granted');
}

function completeSimulatedTask(state, task) {
  task.status = 'running';
  task.assigned_agent = 'project-manager';
  appendEvent(state, 'cdos.task.started', { task_id: task.id, agent_id: task.assigned_agent, mode: 'simulated' }, 'scheduler');
  task.status = 'completed';
  task.completed_at = new Date().toISOString();
  appendEvent(state, 'cdos.task.completed', { task_id: task.id, agent_id: task.assigned_agent, mode: 'simulated' }, 'scheduler');
}

export function runWorkflow(state, workflowId) {
  const workflow = state.workflows.find((item) => item.id === workflowId);
  if (!workflow) throw new Error(`Workflow not found: ${workflowId}`);
  if (['completed', 'cancelled', 'failed'].includes(workflow.status)) throw new Error(`Workflow ${workflow.id} cannot run from ${workflow.status}.`);
  workflow.status = 'running';
  appendEvent(state, 'cdos.workflow.started', { workflow_id: workflow.id }, 'scheduler');
  const completed = [];
  for (const taskId of workflow.tasks) {
    const task = state.tasks.find((item) => item.id === taskId);
    if (!task || task.status === 'completed') continue;
    if (!dependenciesComplete(state, task)) break;
    task.status = 'ready';
    // Migration path for workflows created before deployment planning used a
    // separate approval-gate task. Preserve its approval and attach it to the
    // actual deployment action, so the workflow still needs only one approval.
    if (task.title === 'Request deployment approval' && task.requires_approval) {
      const deploymentTask = state.tasks.find((item) => item.id === workflow.tasks[workflow.tasks.indexOf(task.id) + 1]);
      const existingApproval = requestDeploymentApproval(state, task);
      task.requires_approval = false;
      if (deploymentTask) {
        deploymentTask.requires_approval = true;
        deploymentTask.approval_id = existingApproval.id;
      }
    }
    if (task.requires_approval && !approvalGranted(state, task)) {
      task.status = 'waiting';
      const approval = requestDeploymentApproval(state, task);
      workflow.status = 'blocked';
      appendEvent(state, 'cdos.workflow.blocked', { workflow_id: workflow.id, task_id: task.id, approval_id: approval.id }, 'scheduler');
      return { workflow, completed, blocked_by: approval };
    }
    completeSimulatedTask(state, task);
    completed.push(task);
  }
  if (workflow.tasks.every((taskId) => state.tasks.find((task) => task.id === taskId)?.status === 'completed')) {
    workflow.status = 'completed';
    workflow.completed_at = new Date().toISOString();
    appendEvent(state, 'cdos.workflow.completed', { workflow_id: workflow.id, mode: 'simulated' }, 'scheduler');
  }
  return { workflow, completed, blocked_by: null };
}
