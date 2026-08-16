import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve, sep } from 'node:path';

function resolveResource(workspace, resource) {
  const root = resolve(workspace);
  const target = resolve(root, resource);
  const pathRelative = relative(root, target);
  if (pathRelative === '' || pathRelative.startsWith(`..${sep}`) || pathRelative === '..') {
    throw new Error('Resource must be a file inside the workspace.');
  }
  return target;
}

export async function readWorkspaceFile(workspace, resource) {
  return readFile(resolveResource(workspace, resource), 'utf8');
}

export async function writeWorkspaceFile(workspace, resource, content) {
  const target = resolveResource(workspace, resource);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, content, 'utf8');
  return { resource, bytes: Buffer.byteLength(content, 'utf8') };
}
