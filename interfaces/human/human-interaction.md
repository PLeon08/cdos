# HumanInteraction

```text
ask(question) -> QuestionRef
answer(question_id, responder, answer) -> Answer
notify(notification) -> DeliveryRef
intervene(execution_id, instruction) -> InterventionRef
```

Human input is structured, attributed, and correlated to its task or workflow. An intervention may pause, amend, or cancel an execution subject to authority policy.

