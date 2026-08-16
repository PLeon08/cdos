# Integration System specification

External integrations—including Git, CI/CD, issue trackers, messaging, and deployment providers—are adapters behind tools or plugins. They use scoped credentials from the Secret Manager, undergo permission checks, emit audit events, and never become required dependencies of the local core.

