# Sandbox System specification

Each execution receives a resolved sandbox policy. Filesystem access is workspace-scoped; network access is none, allowlist, or explicitly approved unrestricted; process launch is allowlisted; and CPU, memory, disk, and time limits are enforced. Violations terminate or constrain work according to policy and always emit an audit event.

