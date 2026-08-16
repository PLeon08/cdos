# ToolProvider

```text
register(tool) -> ToolRef
discover(query) -> Tool[]
describe(tool_id) -> ToolManifest
validate(request) -> ValidationResult
execute(request, authorization) -> ToolResult
```

`execute` requires a valid authorization decision. Tool providers must not bypass the sandbox, secret manager, or event/audit publication path.

