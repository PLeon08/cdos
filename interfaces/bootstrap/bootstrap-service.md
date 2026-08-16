# BootstrapService

```text
inspect_environment() -> EnvironmentReport
initialize(options) -> BootstrapResult
check_dependencies() -> DependencyReport
migrate(target_version) -> MigrationResult
doctor() -> HealthReport
```

Bootstrap initializes only a selected workspace and must be idempotent. It generates safe local configuration, verifies dependencies, initializes storage, and reports missing optional integrations without exposing credentials.

