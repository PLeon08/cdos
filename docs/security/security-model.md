# Security model

CDOS is deny-by-default. Policy evaluates subject, action, resource, and context before a tool call, delegation, secret resolution, or sandbox expansion. Authorization outcomes and approvals are auditable events. Secrets are supplied by references and redacted from logs, events, and artifacts.

