[中文](./README.md)

# MarchenSpec

Workflow harness for AI coding agents — an engineering shell for your agent.

[![npm version](https://img.shields.io/npm/v/marchen-spec)](https://www.npmjs.com/package/marchen-spec)

## Why

AI coding tools (Claude Code, Codex, Cursor, etc.) have largely solved "how AI writes code." But there's still a gap in real engineering work:

**How AI thinks, leaves a trail, and remembers what it has done.**

Without this layer, AI tends to jump straight into implementation, loses context the moment a session ends, and leaves no trace of past decisions. This gap is called **harness engineering** — building an engineering shell around AI coding agents.

That's what MarchenSpec does, organized as two pillars:

- **Workflow harness**: every step from idea to implementation has a matching skill — explore, propose, apply, review, archive
- **Long-term memory**: every change is automatically archived and made semantically searchable, so AI can pull relevant context into the next session

## Quick Start

```bash
npm install -g marchen-spec

# Initialize in your project root, pick your AI coding tools
marchen init
```

`marchen init` lets you choose which AI coding tools to integrate, then generates the corresponding skill files. After initialization, invoke the harness directly from your tool:

```bash
marchen:explore I want to add dark mode   # Clarify the idea first
marchen:lite                              # Lightweight end-to-end: create → implement → archive
marchen:propose                           # Complex features: generate full planning docs
marchen:apply                             # Implement step by step
marchen:archive                           # Archive when done
```

## Two Pillars

| Pillar | Role | Core capabilities |
|---|---|---|
| **Workflow harness** | Give every AI step structure | explore / propose / lite / apply / review / archive |
| **Long-term memory** | Survive cross-session amnesia | archive auto-trail · changelog index · search retrieval |

The two pillars work together: the workflow harness produces structured artifacts, archiving moves them into long-term memory, and on the next change skills like explore / apply automatically pull relevant history back in as context.

## Workflow Harness

Each skill addresses one step in the workflow. After `marchen init`, invoke them directly from your AI tool:

- **`marchen:explore`** — Exploration mode. Clarify ideas, investigate problems, compare approaches before writing any code. Thinks, doesn't implement.
- **`marchen:propose`** — Propose a new change. Guides AI to produce a structured document set: motivation (proposal), requirements (specs), technical approach (design), task list (tasks). For complex features and architecture changes.
- **`marchen:lite`** — Lightweight end-to-end. Create a lite change → implement tasks → ask to archive, all in one command. For bug fixes, small changes, quick iterations.
- **`marchen:apply`** — Implement the generated task list one by one, checking off each as you go.
- **`marchen:review`** — Check that the implementation matches the change's intent for completeness and consistency, with chrome-devtools MCP support for UI scenarios.
- **`marchen:archive`** — Archive completed changes and automatically append to the changelog index.

## Long-term Memory

Every archived change becomes part of the project's long-term memory — all artifact files are fully preserved and indexed for retrieval.

```bash
marchen search "user auth"                # Semantic search across archives
marchen search "refactor" -n 10           # Specify result count
marchen search "auth" --min-score 0.5     # Set minimum score threshold
marchen search "auth" --rebuild           # Rebuild index before searching
```

Built-in Hybrid Search (BM25 + vector retrieval + reranking) retrieves relevant design decisions and change records from your archive history. archive → changelog → search forms a complete loop:

1. `marchen:archive` moves a change into `marchen/archive/` and appends an index line to `changelog.md`
2. `marchen search` performs semantic retrieval over the archived content
3. `marchen:explore` and `marchen:apply` automatically call search during workflows, feeding relevant history into the AI as context

You can enable search during `marchen init`, which downloads the required models (~2GB). When search is not enabled, skills automatically fall back to reading `changelog.md` for historical context.

Models are downloaded from the `https://hf-mirror.com` mirror by default and cached in `~/.cache/qmd/models/`. To switch sources:

- Temporary: `HF_ENDPOINT=https://huggingface.co marchen update`
- Persistent: edit `marchen/config.yaml` and change the `models.endpoint` field

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
marchen search <query> [--rebuild]        # Search archived change history
```

## Workspace Layout

```
marchen/
├── changes/          # Active changes
│   └── add-user-auth/
│       ├── .metadata.yaml
│       ├── proposal.md
│       ├── specs/
│       ├── design.md
│       └── tasks.md
├── archive/          # Archived changes
├── changelog.md      # Change history index
└── config.yaml       # Configuration (includes provider selection)
```

Archiving a change automatically appends an entry to `changelog.md`, providing a structured change history for the project.

## Updating

After upgrading marchen-spec, run update to sync skill files:

```bash
npm install -g marchen-spec@latest
marchen update
```

## Development

pnpm monorepo with Turborepo orchestration:

```
apps/cli          CLI entry (commander + @clack/prompts)
packages/core     Business logic (Workspace + ChangeManager)
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
