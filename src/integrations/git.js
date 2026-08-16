import { runCommand } from './command.js';

export async function inspectGit(workspace) {
  const version = await runCommand('git', ['--version'], { cwd: workspace });
  if (!version.available || version.code !== 0) return { integration: 'git', available: false, detail: version.stderr };
  const status = await runCommand('git', ['status', '--short', '--branch'], { cwd: workspace });
  return {
    integration: 'git',
    available: true,
    version: version.stdout.trim(),
    repository: status.code === 0,
    status: status.code === 0 ? status.stdout.trim().split('\n').filter(Boolean) : [],
    detail: status.code === 0 ? null : status.stderr.trim()
  };
}
