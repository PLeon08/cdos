# SandboxManager

```text
create(execution, policy) -> SandboxRef
run(sandbox_id, request) -> ExecutionResult
inspect(sandbox_id) -> SandboxState
terminate(sandbox_id, reason) -> void
cleanup(sandbox_id) -> void
```

The manager enforces the resolved policy at the execution boundary. It records resource use and policy violations, and destroys ephemeral state on cleanup unless artifact policy explicitly preserves an output.

