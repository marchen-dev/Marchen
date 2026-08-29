[中文](./README.md)

# Marchen

Workflow harness for AI coding agents — an engineering shell for your agent.

[![npm version](https://img.shields.io/npm/v/marchen)](https://www.npmjs.com/package/marchen)

## Why

AI coding tools (Claude Code, Codex, Cursor, etc.) have largely solved "how AI writes code." But there's still a gap in real engineering work:

**How AI thinks, leaves a trail, and remembers what it has done.**

Without this layer, AI tends to jump straight into implementation, loses context the moment a session ends, and leaves no trace of past decisions. This gap is called **harness engineering** — building an engineering shell around AI coding agents.

That's what Marchen does, organized as two pillars:

- **Workflow harness**: every step from idea to implementation has a matching skill — explore, propose, apply, acceptance, archive
- **Long-term memory**: every change is archived and located through the changelog, so AI can restore relevant context in the next session

## Quick Start

```bash
npm install -g marchen

# Initialize in your project root, pick your AI coding tools
marchen init
```

`marchen init` lets you choose which AI coding tools to integrate, then generates the corresponding skill files. After initialization, invoke the harness directly from your tool:

```bash
marchen:explore I want to add dark mode   # Clarify the idea first
marchen:capture                           # Park the exploration for later
marchen:lite                              # Lightweight end-to-end: create → implement → archive
marchen:propose                           # Complex features: generate full planning docs
marchen:apply                             # Implement step by step
marchen:archive                           # Archive when done
```

## Two Pillars

| Pillar | Role | Core capabilities |
|---|---|---|
| **Workflow harness** | Give every AI step structure | explore / capture / propose / preview / lite / apply / update / acceptance / archive |
| **Long-term memory** | Survive cross-session amnesia | archive auto-trail · changelog index · artifact rereading |

The two pillars work together: the workflow harness produces structured artifacts, archiving moves them into long-term memory, and on the next change skills like explore / apply locate candidate records in the changelog before rereading the relevant artifacts.

## Workflow Harness

Each skill addresses one step in the workflow. After `marchen init`, invoke them directly from your AI tool:

- **`marchen:explore`** — Exploration mode. Clarify ideas, investigate problems, compare approaches before writing any code. Thinks, doesn't implement.
- **`marchen:capture`** — Distill a discussion that is not ready for implementation into an Idea state snapshot. Resume it later without storing the raw conversation.
- **`marchen:propose`** — Propose a new change. Guides AI to produce a structured document set: motivation (proposal), requirements (specs), technical approach (design), task list (tasks). For complex features and architecture changes.
- **`marchen:propose-preview`** — Condense the 4–7 artifacts produced by propose into a single terminal card, so a human can review quickly and decide whether to apply or go back and revise the proposal.
- **`marchen:lite`** — Lightweight end-to-end. Create a lite change → implement tasks → ask to archive, all in one command. For bug fixes, small changes, quick iterations.
- **`marchen:apply`** — Implement the generated task list one by one, checking off each as you go.
- **`marchen:update`** — Revise a change's existing planning artifacts (proposal / specs / design / tasks) and reconcile them in any direction to stay coherent. Plans only, never code.
- **`marchen:acceptance`** — After apply, publish a local acceptance page with evidence for a human to sign off before archive.
- **`marchen:archive`** — Archive completed changes and automatically append to the changelog index.

When a discussion is not ready for implementation, park it in `marchen/ideas/<name>.md`:

```text
explore → capture → explore idea:<name> → lite/propose idea:<name>
```

Ideas are regular Git-trackable project files, but Marchen never stages or commits them automatically. Capture removes obvious credentials, account data, and absolute local paths, but it cannot decide whether arbitrary business text is confidential; review Ideas before committing. After promotion, the Idea moves into the change's `exploration/` directory, while proposal/specs/design/tasks remain the source of truth.

## Long-term Memory

Every archived change becomes part of the project's long-term memory — all artifact files are preserved and summarized in `changelog.md`.

```bash
cat marchen/changelog.md
# Use a summary to open a relevant file such as marchen/archive/<date>-<change>/design.md
```

Long-term memory now follows a deterministic archive → changelog → artifact rereading loop:

1. `marchen:archive` moves a change into `marchen/archive/` and appends an index line to `changelog.md`
2. `marchen:explore` and `marchen:apply` scan changelog summaries to identify a small set of candidate archives
3. The AI reads the relevant proposal, design, or spec files to restore decision context

The built-in `marchen search` command, QMD integration, and model download path have been retired. After upgrading, run `marchen update`; it removes the obsolete `search` and `models` configuration and regenerates managed Skill/Command files.

Migration does not delete existing data automatically:

- `marchen/.search/` remains ignored by Git and may be removed manually after confirming it is no longer needed.
- `~/.cache/qmd/models/` may be shared by standalone QMD or other tools; remove it manually only after confirming there are no other consumers.

## Supported AI Tools

* Claude Code
* Codex
* Cursor
* Windsurf
* GitHub Copilot
* Gemini CLI
* Kiro
* OpenCode
* Kilo Code
* Antigravity

You can select multiple tools during `marchen init`. All tools share the same SKILL.md content.

## CLI Commands

```bash
marchen init                              # Initialize workspace, choose AI tool integrations
marchen new <name> [--schema full|lite]   # Create a change
marchen list [--json]                     # List all open changes
marchen status <name> [--json]            # View artifact status and workflow suggestions
marchen instructions <name> <artifact>    # Get artifact creation instructions (JSON)
marchen archive <name> [--summary <text>] # Archive change and write to changelog
marchen update                            # Update skill/command files to latest version
marchen idea list [--json]                # List unpromoted Ideas
marchen idea show <name> [--json]         # Read a full Idea and revision
marchen idea create <name> --stdin         # Create an Idea from stdin
marchen idea update <name> --if-revision <revision> --stdin
marchen idea promote <names...> --change <change> # Promote into a change
marchen idea remove <name> [--yes]         # Remove an unpromoted Idea
```

## Workspace Layout

```
marchen/
├── ideas/            # Unpromoted Ideas that can be resumed
├── changes/          # Active changes
│   └── add-user-auth/
│       ├── .metadata.yaml
│       ├── proposal.md
│       ├── specs/
│       ├── design.md
│       ├── tasks.md
│       └── exploration/ # Exploration context after promotion
├── archive/          # Archived changes
├── changelog.md      # Change history index
└── config.yaml       # Configuration (includes provider selection)
```

Archiving a change automatically appends an entry to `changelog.md`, providing a structured change history for the project.

## Updating

After upgrading marchen, run update to sync skill files and migrate workspace configuration:

> Upgrading from a release that still includes `marchen search` is a breaking change; the retired command is treated as unknown after upgrading.

```bash
npm install -g marchen@latest
marchen update
```

## Development

pnpm monorepo with Turborepo orchestration:

```
apps/cli          CLI entry (commander + @clack/prompts)
packages/core     Business logic (Workspace + ChangeManager + IdeaManager)
packages/config   Schema definitions, templates, provider registry
packages/fs       File system operations
packages/shared   Shared types, constants
```

```bash
pnpm install      # Install dependencies
pnpm build        # Build all packages
pnpm dev          # Watch mode
pnpm test         # Run tests
pnpm check        # lint + typecheck + test
```

## Acknowledgments

The workflow design is inspired by [OpenSpec](https://github.com/Fission-AI/OpenSpec).

## License

MIT
