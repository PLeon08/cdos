# Artifact System specification

An artifact is a produced, reviewable, versioned output. Its identity is stable while each version is immutable and records producer, task, execution, URI, checksum, validation, review status, and lineage. Deletion follows retention policy and produces an auditable tombstone rather than breaking references silently.

