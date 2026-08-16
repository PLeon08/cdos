# Platform services specification

The following cross-cutting services complete the v0.1 architecture:

- **Sandbox:** isolates filesystem, network, process, environment, timeout, and resource limits per execution.
- **Secrets:** resolves short-lived references after authorization; redacts values from outputs.
- **Artifacts:** versions agent outputs with metadata, lineage, validation, and review state.
- **Observability:** records structured logs, metrics, traces, health, policy denials, and cost attribution.
- **Configuration:** loads validated profiles with environment-specific overrides; production defaults remain deny-by-default.

