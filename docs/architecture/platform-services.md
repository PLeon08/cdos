# Platform services

Sandbox, secrets, storage, artifacts, observability, configuration, cost, resources, and approvals are control-plane services. They are not optional conveniences around an agent loop: together they provide isolation, reproducibility, auditability, and bounded operation. Their provider-specific implementations are replaceable behind the interfaces in `interfaces/`.
