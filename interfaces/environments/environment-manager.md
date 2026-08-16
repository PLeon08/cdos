# EnvironmentManager

```text
discover(workspace) -> Environment[]
activate(environment_id) -> Environment
resolve_project(project_id) -> Environment
validate(environment_id) -> ValidationResult
```

An environment binds CDOS configuration, workspace, storage, and execution provider. Development, testing, staging, and production must never share mutable state implicitly.

