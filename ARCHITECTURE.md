# CDOS Architecture v0.1

CDOS is organized as a control plane around independently replaceable execution providers.

```text
Human → Project / Workflow → Task & Delegation → Agent Runtime → Model Adapter
                                         │                 │
                                         ├── Permission Engine ── Tool / MCP
                                         └── Message Bus ──────── Audit, Memory, Observability
```

The control plane owns identities, lifecycle, policy decisions, state transitions, audit records, and contracts. Adapters own provider-specific protocol details. No model provider is the CDOS kernel.

## Boundary rules

1. A tool invocation is authorized before execution.
2. Cross-component state changes emit immutable events.
3. Agents communicate through controlled delegation or messaging paths.
4. Secrets are referenced, never embedded in agent manifests or events.
5. Sandboxes constrain filesystem, process, network, and resource access.

See [architecture overview](docs/architecture/overview.md) and the ADRs in `decisions/`.

