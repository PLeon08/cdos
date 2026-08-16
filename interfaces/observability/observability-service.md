# ObservabilityService

```text
log(record) -> void
metric(name, value, attributes) -> void
start_span(name, context) -> SpanRef
end_span(span_id, outcome) -> void
health(component) -> HealthReport
query_trace(correlation_id) -> Trace
```

All telemetry is structured and correlated through the event correlation ID. The service redacts secrets and supports per-project attribution for cost, resource use, policy denials, retries, and execution outcomes.

