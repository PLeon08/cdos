# Messaging and Event specification

Event names use `cdos.<domain>.<verb>`, for example `cdos.task.completed`. Event envelopes carry a unique ID, source, timestamp, correlation ID, optional causation ID, and payload. Commands are directed and may return a result. Events are immutable and consumers are idempotent.

