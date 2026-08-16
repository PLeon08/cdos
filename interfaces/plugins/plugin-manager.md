# PluginManager

```text
discover(source) -> PluginManifest[]
install(manifest, authorization) -> PluginRef
enable(plugin_id, project_id) -> PluginState
disable(plugin_id, project_id) -> PluginState
inspect(plugin_id) -> PluginManifest
```

Plugins declare supplied tools, skills, adapters, dependencies, and permissions. Installation never grants declared permissions automatically; each project explicitly enables and authorizes a plugin.

