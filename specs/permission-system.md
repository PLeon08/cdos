# Permission System specification

Authorization evaluates `subject + action + resource + context`. Roles and tool declarations may inform policy but cannot allow an action alone. Decisions are allow, deny, or require-approval; decisions can be bounded by time, project, environment, task, and resource constraints.

