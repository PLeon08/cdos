# Delegation System specification

Delegation moves responsibility for a bounded task to an eligible agent while preserving accountability and auditability. The engine prevents cycles, validates maximum depth, and ensures that a child cannot delegate beyond the authority supplied by its parent. A delegation may be declined, revoked, or expire without mutating the source task history.

