import { spawn } from 'node:child_process';

function execute(command, args, { input } = {}) {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let settled = false;
    const child = spawn(command, args, { shell: false, stdio: ['pipe', 'pipe', 'pipe'] });
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
    if (input) child.stdin.end(input);
    else child.stdin.end();
  });
}

export async function inspectClaudeCode(command = 'claude') {
  const result = await execute(command, ['--version']);
  return {
    adapter: 'claude-code',
    available: result.available && result.code === 0,
    version: result.available && result.code === 0 ? result.stdout.trim() : null,
    detail: result.available ? result.stderr.trim() || `Exited with code ${result.code}` : result.stderr
  };
}

export async function promptClaudeCode(prompt, command = 'claude') {
  if (!prompt?.trim()) throw new Error('A model prompt is required.');
  const result = await execute(command, ['-p', prompt]);
  if (!result.available) throw new Error(`Claude Code is unavailable: ${result.stderr}`);
  if (result.code !== 0) throw new Error(`Claude Code failed: ${result.stderr || `exit ${result.code}`}`);
  return result.stdout.trim();
}
