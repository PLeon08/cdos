# MemoryStore

```text
store(memory) -> MemoryRef
retrieve(memory_id, scope) -> Memory
search(query, scope, limit) -> Memory[]
update(memory_id, patch) -> Memory
delete(memory_id, authorization) -> void
consolidate(scope) -> ConsolidationResult
```

Memory has explicit ownership, retention, sensitivity, provenance, and project scope. Deletion is an auditable event, not silent mutation.

