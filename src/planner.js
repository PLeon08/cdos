import { nextId } from './store.js';

const deploymentPlan = [
  ['Inspect project and deployment target', 'high'],
  ['Run validation and tests', 'high'],
  ['Prepare release configuration and artifact', 'high'],
  ['Request deployment approval', 'critical'],
  ['Deploy and verify health', 'critical']
];

const deliveryPlan = [
  ['Analyze the request and affected components', 'high'],
  ['Implement the requested change', 'high'],
  ['Run validation and tests', 'high'],
  ['Request review and report results', 'medium']
];

function planFor(goal) {
  return /\b(deploy|deployment|despliega|desplegar|publica|publicar)\b/i.test(goal) ? deploymentPlan : deliveryPlan;
}

export function createWorkflowPlan(state, goal) {
  const workflow = {
    schema: 'cdos.workflow/v1',
    id: nextId('workflow', state.workflows),
    name: goal,
    project_id: 'local-project',
    status: 'created',
    created_at: new Date().toISOString(),
    planner: 'deterministic-mvp',
    tasks: []
  };
  const templates = planFor(goal);
  const tasks = templates.map(([title, priority], index) => {
    const task = {
      schema: 'cdos.task/v1',
      id: nextId('task', [...state.tasks, ...workflow.tasks.map((id) => ({ id }))]),
      title,
      description: `Workflow goal: ${goal}`,
      status: index === 0 ? 'ready' : 'created',
      priority,
      project_id: 'local-project',
      workflow_id: workflow.id,
      assigned_agent: null,
      dependencies: index === 0 ? [] : [workflow.tasks[index - 1]],
      requires_approval: title === 'Deploy and verify health',
      created_at: new Date().toISOString()
    };
    workflow.tasks.push(task.id);
    return task;
  });
  state.workflows.push(workflow);
  state.tasks.push(...tasks);
  return { workflow, tasks };
}
