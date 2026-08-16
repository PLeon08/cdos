# ModelAdapter

```text
initialize(configuration) -> AdapterHealth
create_session(request) -> SessionRef
send(session_id, message) -> ModelResponse
stream(session_id, message, sink) -> StreamRef
submit_tool_result(session_id, result) -> ModelResponse
interrupt(session_id) -> void
close(session_id) -> void
```

Model adapters normalize provider protocols. They receive already-built context and return proposed tool calls; the runtime still evaluates policy before executing those calls.

