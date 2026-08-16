# Runtime specification

The runtime is the orchestrator for agents and executions. It validates lifecycle transitions, applies concurrency and resource limits, builds context, invokes model adapters, routes tool proposals through permission checks, and emits events. It never delegates final authority away from the human approval layer.

