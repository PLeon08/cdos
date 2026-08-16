# ApprovalService

```text
request(request) -> ApprovalRef
get(approval_id) -> Approval
grant(approval_id, approver, note) -> Approval
reject(approval_id, approver, note) -> Approval
revoke(approval_id, actor, reason) -> Approval
expire_due() -> Count
```

Only an eligible human or explicitly delegated service identity can resolve an approval. Granting authorizes the exact requested action and context until expiration; it does not create a broad standing permission.

