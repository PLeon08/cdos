import { runCommand } from './command.js';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

function dockerCommand() {
  const localBinary = process.env.LOCALAPPDATA
    ? join(process.env.LOCALAPPDATA, 'Programs', 'DockerDesktop', 'resources', 'bin', 'docker.exe')
    : null;
  const command = localBinary && existsSync(localBinary) ? localBinary : 'docker';
  const binaryDir = command === 'docker' ? null : dirname(command);
  return {
    command,
    env: binaryDir ? { ...process.env, PATH: `${binaryDir}${process.platform === 'win32' ? ';' : ':'}${process.env.PATH ?? ''}` } : process.env
  };
}

export async function inspectDocker(workspace) {
  const docker = dockerCommand();
  const version = await runCommand(docker.command, ['--version'], { cwd: workspace, env: docker.env });
  if (!version.available || version.code !== 0) return { integration: 'docker', available: false, detail: version.stderr || 'Docker CLI is not installed or is not on PATH.' };
  const server = await runCommand(docker.command, ['info', '--format', '{{.ServerVersion}}'], { cwd: workspace, env: docker.env });
  return {
    integration: 'docker',
    available: server.code === 0,
    cli_version: version.stdout.trim(),
    server_version: server.code === 0 ? server.stdout.trim() : null,
    detail: server.code === 0 ? null : server.stderr.trim() || 'Docker Desktop is not running.'
  };
}

export async function runDockerTests(workspace) {
  const docker = dockerCommand();
  const result = await runCommand(docker.command, ['compose', 'run', '--rm', 'cdos', 'npm', 'test'], { cwd: workspace, env: docker.env });
  if (!result.available) throw new Error(`Docker is unavailable: ${result.stderr}`);
  if (result.code !== 0) throw new Error(`Docker test run failed: ${result.stderr || result.stdout || `exit ${result.code}`}`);
  return { output: result.stdout.trim(), stderr: result.stderr.trim() };
}

export async function buildDockerImage(workspace, tag) {
  const docker = dockerCommand();
  const result = await runCommand(docker.command, ['build', '--tag', tag, '.'], { cwd: workspace, env: docker.env });
  if (!result.available) throw new Error(`Docker is unavailable: ${result.stderr}`);
  if (result.code !== 0) throw new Error(`Docker image build failed: ${result.stderr || result.stdout || `exit ${result.code}`}`);
  return { tag, output: result.stdout.trim(), stderr: result.stderr.trim() };
}
