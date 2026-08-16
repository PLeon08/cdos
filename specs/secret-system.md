# Secret System specification

CDOS stores only secret references and metadata. Resolution requires authorization, a matching project/execution scope, and creates an expiring lease. Providers must support rotation where available. Values are never written to manifests, events, artifacts, or standard logs; redaction is mandatory at all output boundaries.

