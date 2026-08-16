# ADR-004: Model adapters are replaceable

**Decision:** Claude and other model providers are adapters behind `ModelAdapter`.

**Rationale:** CDOS must retain governance and runtime semantics independently of a provider.
