# Messaging

Commands have an intended handler and request a change. Events are immutable records of completed facts and may have many subscribers. Delivery is at least once by default; consumers must be idempotent, and failed messages go through retries to a dead-letter path.

