# Testing strategy

Run schema/contract validation before implementation tests. Each adapter needs a reusable contract suite. Integration tests must use isolated workspaces and disposable credentials; security tests may never target uncontrolled systems. A release requires passing policy, sandbox, secret-redaction, event-idempotency, and recovery scenarios.
