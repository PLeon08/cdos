# MessageBus

```text
publish(event) -> DeliveryReceipt
subscribe(topic, handler) -> SubscriptionRef
unsubscribe(subscription_id) -> void
request(command) -> CommandResult
ack(delivery_id) -> void
reject(delivery_id, reason) -> void
```

Events are validated against `event.schema.yaml`; commands against `command.schema.yaml`. Consumers must tolerate duplicate delivery. A message that exhausts retry policy is sent to the dead-letter channel with its failure metadata.

