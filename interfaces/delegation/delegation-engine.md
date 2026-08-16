# DelegationEngine

```text
request(delegation) -> DelegationRef
match(task, constraints) -> AgentCandidate[]
assign(delegation_id, agent_id) -> Delegation
decline(delegation_id, agent_id, reason) -> Delegation
revoke(delegation_id, actor, reason) -> Delegation
```

The engine verifies delegation policy, parent authority, maximum depth, role compatibility, project scope, availability, and approval requirements before assignment. A delegatee receives only the delegated task authority, never all authority of the delegator.

