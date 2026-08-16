const byId = (id) => document.getElementById(id);
const escape = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));

function rows(items, renderer, empty) {
  return items.length ? items.map(renderer).join('') : `<p class="empty">${empty}</p>`;
}

function render(state) {
  byId('agent-count').textContent = state.agents.length;
  byId('workflow-count').textContent = state.workflows?.length ?? 0;
  byId('task-count').textContent = state.tasks.length;
  byId('event-count').textContent = state.events.length;
  byId('updated').textContent = `Updated ${new Date(state.updated_at).toLocaleString()}`;
  byId('agents').innerHTML = rows(state.agents, (agent) => `<div class="row"><div><strong>${escape(agent.name)}</strong><small>${escape(agent.role)}</small></div><span class="badge ${escape(agent.status)}">${escape(agent.status)}</span></div>`, 'No agents registered.');
  byId('workflows').innerHTML = rows([...(state.workflows ?? [])].reverse(), (workflow) => `<div class="row"><div><strong>${escape(workflow.name)}</strong><small>${escape(workflow.id)} · ${workflow.tasks.length} tasks</small></div><span class="badge ${escape(workflow.status)}">${escape(workflow.status)}</span></div>`, 'No workflows planned.');
  byId('tasks').innerHTML = rows([...state.tasks].reverse(), (task) => `<div class="row"><div><strong>${escape(task.title)}</strong><small>${escape(task.id)} · ${escape(task.priority)}</small></div><span class="badge ${escape(task.status)}">${escape(task.status)}</span></div>`, 'No tasks yet. Create one with the CLI.');
  byId('events').innerHTML = rows([...state.events].reverse().slice(0, 12), (event) => `<div class="row event"><div><strong>${escape(event.event_type)}</strong><small>${new Date(event.timestamp).toLocaleString()} · ${escape(event.event_id)}</small></div></div>`, 'No events recorded.');
}

async function refresh() {
  const response = await fetch('/api/state');
  if (!response.ok) throw new Error((await response.json()).error);
  render(await response.json());
}

refresh().catch((error) => { byId('updated').textContent = error.message; });
setInterval(() => refresh().catch(() => {}), 3000);
