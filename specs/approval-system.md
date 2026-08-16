# Approval System specification

Approvals are explicit, narrowly scoped, time-bounded decisions for actions policy cannot automatically allow. A request captures requester, resource, action, context, rationale, expiration, and evidence. Resolution is immutable: revocation or expiration creates a new state event. An approval does not survive a material context change.

