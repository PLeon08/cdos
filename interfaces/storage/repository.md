# Repository

```text
create(entity) -> Entity
get(id) -> Entity | null
update(id, version, patch) -> Entity
list(query) -> Page<Entity>
append_event(event) -> EventOffset
transaction(work) -> Result
```

Storage adapters use optimistic versioning for mutable entities and an append-only journal for events. SQLite is the initial local adapter; storage is not exposed directly to agents.

