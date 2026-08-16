# NotificationService

```text
publish(notification) -> DeliveryRef[]
preview(notification, channel) -> RenderedNotification
set_preferences(subject, preferences) -> Preferences
retry(delivery_id) -> Delivery
```

Channels are adapters (CLI, desktop, email, webhook). Routing honors recipient preferences, severity, project access, quiet periods, and redaction rules.

