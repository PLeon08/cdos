export function evaluate({ action, resource, workspace }) {
  const protectedPaths = ['.cdos', '.git'];
  const normalized = resource.replaceAll('\\', '/');
  const isProtected = protectedPaths.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`));
  if (!workspace || !resource || isProtected) return { decision: 'deny', reason: 'Resource is outside the permitted workspace boundary.' };
  if (action === 'filesystem.read') return { decision: 'allow', reason: 'Read access inside the workspace is allowed by the MVP policy.' };
  if (action === 'git.inspect') return { decision: 'allow', reason: 'Git inspection is read-only.' };
  if (action === 'docker.inspect') return { decision: 'allow', reason: 'Docker inspection is read-only.' };
  if (action === 'git.write' || action === 'docker.run' || action === 'docker.build') return { decision: 'require_approval', reason: 'This integration action changes local or remote state and requires approval.' };
  if (action === 'filesystem.write') return { decision: 'require_approval', reason: 'Workspace writes require an explicit human approval.' };
  if (action === 'model.invoke' && resource === 'claude-code') return { decision: 'require_approval', reason: 'Model invocations require an explicit human approval because they may consume account usage.' };
  if (action === 'deployment.execute') return { decision: 'require_approval', reason: 'Deployments require an explicit human approval.' };
  return { decision: 'deny', reason: 'No policy grants this action.' };
}

export function hasApproval(state, { approvalId, action, resource }) {
  const approval = state.approvals.find((item) => item.id === approvalId);
  if (!approval) return false;
  return approval.status === 'granted'
    && approval.action === action
    && approval.resource?.id === resource
    && new Date(approval.expires_at) > new Date();
}
