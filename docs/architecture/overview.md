# Architecture overview

CDOS separates intent from execution. A project or workflow expresses work; the task system coordinates it; an agent runtime executes it through a model adapter; and every consequential action passes through policy, sandbox, event, and audit boundaries.

The initial implementation target is local-first and single-node. Interfaces must nevertheless permit later adapters for queues, databases, model providers, sandboxes, and remote workers.

