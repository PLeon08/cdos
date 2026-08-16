# Implementation roadmap

1. Create a typed local CLI and schema validation command.
2. Implement local configuration, manifest registry, and SQLite event journal.
3. Implement task state machine and in-memory message bus.
4. Implement policy evaluation, approvals, and a constrained local shell tool.
5. Add one model adapter and a minimal agent execution loop.
6. Add sandbox, artifact, memory, observability, and additional adapters incrementally.

The first executable MVP should optimize for inspectability and safety, not autonomous breadth.
