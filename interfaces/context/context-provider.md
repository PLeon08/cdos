# ContextProvider

```text
get_task_context(task_id) -> ContextFragment
get_project_context(project_id) -> ContextFragment
get_agent_context(agent_id) -> ContextFragment
get_skill_context(skill_ids) -> ContextFragment
get_memory_context(query, scope) -> ContextFragment
build_context(request) -> ContextPackage
```

Context packages are least-privilege views: they exclude secrets and respect project, agent, and memory scopes. A package records provenance and token/size budget.

