# ConfigManager

```text
load(profile, sources) -> Configuration
validate(configuration) -> ValidationResult
resolve(path, context) -> Value
reload() -> ConfigurationVersion
describe() -> ConfigurationMetadata
```

Configuration is merged in a documented precedence order: safe built-in defaults, profile file, environment-specific override, then approved runtime override. Secret references may appear; secret values may not.

