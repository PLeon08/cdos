import { spawn } from 'node:child_process';

export function runCommand(command, args, { cwd, env } = {}) {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let settled = false;
    const child = spawn(command, args, { cwd, env, shell: false });
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', (error) => {
      if (!settled) {
        settled = true;
        resolve({ available: false, code: null, stdout, stderr: error.message });
      }
    });
    child.on('close', (code) => {
      if (!settled) {
        settled = true;
        resolve({ available: true, code, stdout, stderr });
      }
    });
  });
}
