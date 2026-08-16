# PermissionEngine

```text
evaluate(subject, action, resource, context) -> Decision
request_approval(request) -> ApprovalRef
resolve_approval(approval_id, outcome) -> Decision
explain(decision_id) -> DecisionTrace
```

The engine defaults to `deny`. `allow` must be explicit; `require_approval` pauses the requesting operation without granting access.

