# Lifecycle

Agent states are `created`, `starting`, `ready`, `running`, `waiting`, `paused`, `stopping`, `stopped`, `failed`, and `recovering`. State transitions must be validated and emitted as events. A failed agent cannot resume work until recovery policy permits it.

