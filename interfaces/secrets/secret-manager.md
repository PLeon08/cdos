# SecretManager

```text
resolve(reference, authorization, context) -> SecretLease
revoke(lease_id) -> void
rotate(reference) -> RotationResult
redact(value) -> RedactedValue
audit(reference, actor, action) -> AuditRef
```

Secret values remain inside the provider or execution boundary whenever possible. Callers receive a scoped, expiring lease—not persistent values—and all values are redacted from telemetry.

