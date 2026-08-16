# CostManager

```text
record(record) -> CostRecord
set_budget(scope, budget) -> Budget
check_budget(scope, estimate) -> BudgetDecision
forecast(scope) -> Forecast
report(scope, period) -> CostReport
```

Budget enforcement occurs before a chargeable action when estimation is available and after it with reconciliation. A limit may deny, require approval, or alert according to policy.

