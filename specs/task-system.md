# Task and Workflow specification

A task is the smallest accountable unit of work. A workflow is a directed graph of tasks and transitions. State changes are legal only through declared transitions; blocked, failed, cancelled, and review states preserve the reason and responsible actor. Dependencies gate readiness.

