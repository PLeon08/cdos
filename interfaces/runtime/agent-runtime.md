# AgentRuntime

The runtime owns lifecycle transitions and task execution, not provider-specific model protocols.

```text
register(agent) -> AgentRef
start(agent_id) -> State
pause(agent_id) -> State
resume(agent_id) -> State
stop(agent_id) -> State
execute(agent_id, task_id) -> ExecutionRef
interrupt(execution_id) -> State
get_state(agent_id) -> State
```

Every transition validates the agent manifest and emits a corresponding `cdos.agent.*` or `cdos.execution.*` event.

