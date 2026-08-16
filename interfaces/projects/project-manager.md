# ProjectManager

```text
create(manifest) -> Project
get(project_id) -> Project
update(project_id, version, patch) -> Project
archive(project_id, authorization) -> Project
bind_workspace(project_id, workspace) -> Project
```

Projects are the primary isolation boundary for task state, artifacts, memory, policies, budgets, workspace bindings, and access control.

