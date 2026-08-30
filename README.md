# CDOS

CDOS is a lightweight companion for Claude Code. Install it in a project, initialize it once, open Claude Code, and work in natural language while CDOS records workflow, tasks, approvals, and verification.

## Intended flow

```powershell
cd my-project
npm install -D @pleon/cdos
npx cdos init
claude
```

Then tell Claude Code, for example: **"Prepare and deploy this project."** The initializer creates `.cdos/` and a small `CLAUDE.md` import so Claude has the CDOS workflow in its project context. It never overwrites an existing `CLAUDE.md`.

For development before the package is published to npm, install directly from GitHub:

```powershell
npm install -D github:PLeon08/cdos#main
```

Claude Code still asks for its normal permissions before changing files or running deployments. CDOS adds workflow tracking and its own explicit approval records; it does not bypass Claude Code safeguards.

CDOS (Collaborative Development Operating System) is a model-agnostic control plane for governed multi-agent software work. It defines contracts and architecture before selecting a runtime, model provider, storage engine, or message broker.

## Status

**Architecture freeze / contracts v0.1.** This repository intentionally contains specifications, interfaces, schemas, decisions, and default configuration—not a production runtime yet.

## Design rules

- The human retains final authority.
- Agents are governed identities; models are replaceable adapters.
- Skills describe capability, tools perform actions, and permissions authorize each action in context.
- Commands request work; events record facts that occurred.
- Contracts are versioned and validated at system boundaries.

## Repository map

- `docs/` — architecture, security, and development guidance.
- `specs/` — behavioural requirements by domain.
- `interfaces/` — implementation-neutral module contracts.
- `schemas/` — JSON Schema Draft 2020-12 contracts, expressed as YAML.
- `config/` — safe development defaults and configuration schema.
- `decisions/` — architecture decision records.

## Next implementation milestone

The local MVP is now available. It initializes an isolated `.cdos/` state directory, manages a small task/event journal, exposes a simulated task execution flow, and serves a read-only dashboard.

```powershell
npm run cdos -- init
npm run cdos -- task create "Define the execution adapter" --priority high
npm run cdos -- task run --latest
npm run cdos -- dashboard
```

Open `http://127.0.0.1:4173` while the dashboard command is running. See `cdos help` for the complete MVP command list. The current execution is deliberately simulated; model adapters, policy evaluation, SQLite, and sandbox enforcement are the next implementation increments.

The MVP now includes a first policy gate for workspace tools. Reads inside the workspace are allowed; writes require an explicit recorded approval:

```powershell
npm run cdos -- approval request filesystem.write notes/decision.md
npm run cdos -- approval grant approval-0001
npm run cdos -- tool write notes/decision.md "Approved decision" --approval approval-0001
```

Claude Code is an optional model adapter. `npm run cdos -- model doctor` only checks whether its command-line executable is available; it does not send a prompt. A live prompt requires a separate, recorded approval because it can consume provider usage.

The local Project Manager can already turn a goal into an inspectable workflow without a model account:

```powershell
npm run cdos -- workflow plan "Desplegar CDOS en un servidor"
npm run cdos -- workflow list
```

Run the workflow to execute safe simulated tasks in dependency order. It will stop at deployment approval points; grant the returned approval ID and run it again to resume.

```powershell
npm run cdos -- workflow run --latest
npm run cdos -- approval grant <id-devuelto>
npm run cdos -- workflow run --latest
```

Git and Docker are integration boundaries. Diagnostics and inspection are read-only; future operations such as commits, image builds, and container runs will require explicit approval.

```powershell
npm run cdos -- integration doctor
npm run cdos -- tool git status
npm run cdos -- tool docker status
```

Run the dashboard in Docker after Docker Desktop is started:

```powershell
docker compose up --build
```

The dashboard will be available at `http://localhost:4173`. Its local state is persisted through the `.cdos` folder mounted from the workspace.

CDOS can run its test suite inside an ephemeral Docker container after a human approval:

```powershell
npm run cdos -- approval request docker.run cdos-test
npm run cdos -- approval grant <id-devuelto>
npm run cdos -- tool docker test --approval <id-devuelto>
```

Build a local release image through the same approval gate. This does not publish anything:

```powershell
npm run cdos -- approval request docker.build image:cdos:local
npm run cdos -- approval grant <id-devuelto>
npm run cdos -- tool docker build --tag cdos:local --approval <id-devuelto>
```
