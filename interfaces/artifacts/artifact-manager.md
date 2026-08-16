# ArtifactManager

```text
create(descriptor, content) -> ArtifactRef
get(artifact_id, version) -> Artifact
validate(artifact_id, validator) -> ValidationResult
submit_for_review(artifact_id) -> Artifact
approve(artifact_id, reviewer) -> Artifact
archive(artifact_id, authorization) -> Artifact
```

Artifacts are immutable per version. A new version preserves lineage, producing task/execution references, integrity data, validation status, and review decisions.

