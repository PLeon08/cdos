# ResourceManager

```text
allocate(execution, request) -> Allocation
measure(execution_id) -> Usage
enforce(allocation_id) -> EnforcementResult
release(allocation_id) -> void
quota(scope) -> QuotaStatus
```

Resource allocation constrains compute, memory, disk, network, time, and concurrency. The sandbox enforces per-execution limits; this service governs aggregate project and system quotas.

