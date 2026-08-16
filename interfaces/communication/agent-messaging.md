# AgentMessaging

```text
send(request) -> MessageRef
receive(agent_id, cursor) -> Message[]
reply(message_id, response) -> MessageRef
cancel(message_id, reason) -> void
```

Agent-to-agent messages are routed through the Message Bus and Permission Engine. Direct provider-session messaging is forbidden because it bypasses auditing, scope checks, and cancellation.

