# ADR-002: Commands and immutable events

**Decision:** CDOS uses commands for directed requests and immutable events for facts.

**Rationale:** this avoids direct coupling between producers and observers and preserves a traceable audit history.

