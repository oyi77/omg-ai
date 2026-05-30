# OMG-AI

Hash-anchored edits, skill merging, and multi-harness support for AI coding agents.

## What It Does

**Hash-Anchored Edits** -- Validates file content via SHA-256 before applying edits. If the file changed since the agent read it, the edit is refused instead of corrupting the file. Zero stale-line edits.

**Skill Merging** -- Scans skill definitions (SKILL.md files) from multiple source directories, deduplicates by normalized name, and produces a unified catalog.

**Multi-Harness Adapter** -- Detects and installs into Claude Code, OpenCode, Codex, Cursor, Gemini CLI, Pi.dev, and OMP. One command to set up, one to remove.

## Installation

```bash
npx omg-ai install
```

Or install for a specific harness:

```bash
npx omg-ai install claude-code
npx omg-ai install opencode
npx omg-ai install cursor
npx omg-ai install pi-dev
npx omg-ai install omp
```

**Homebrew** (macOS/Linux):

```bash
brew install omg-ai
```

**New to AI coding agents?** Use the interactive setup to install a harness and OMG-AI in one go:

```bash
npx omg-ai setup
```

## Commands

### `omg-ai edit <file> <old> <new>`

Hash-anchored edit. Reads the file, finds `old`, verifies its SHA-256 hash, replaces it with `new`, and verifies the hash changed.

```bash
omg-ai edit src/app.js "const x = 1" "const x = 42"
omg-ai edit --dry-run src/app.js "old code" "new code"
```

If `old` is not found, appears multiple times, or the file has been modified since read, the edit is refused with a clear error.

### `omg-ai verify <file>`

Compute and display the SHA-256 hash of a file.

```bash
omg-ai verify src/app.js
# File: src/app.js
# SHA-256: a1b2c3...
# Size: 1234 bytes
# Lines: 42
```

### `omg-ai skills merge [paths...]`

Scan directories for SKILL.md files, deduplicate, and write a unified catalog to `skill-catalog.json`.

```bash
omg-ai skills merge /path/to/skills-a /path/to/skills-b
```

Default source: `../1ai-skills/` (relative to install location).

### `omg-ai skills list [paths...]`

List all discovered skills grouped by category.

### `omg-ai install [harness]`

Install omg-ai hooks into a harness. Auto-detects if not specified.

### `omg-ai uninstall [harness]`

Remove omg-ai hooks from a harness.

### `omg-ai status`

Show detected harnesses, installed integrations, and available skill count.

## How Hash-Anchored Edits Work

Traditional agent harnesses use line-number-based edits. If the file changes between read and write, the line number is wrong and the edit corrupts the file.

OMG-AI computes SHA-256 of the content to be replaced before applying the edit:

1. Find `oldString` in the file
2. Compute SHA-256 of the matched content
3. Apply the replacement
4. Verify the hash of the replaced region differs from the pre-edit hash

If `oldString` is not found or appears multiple times, the edit is refused. This eliminates stale-line errors.

## Benchmark

Run the benchmark to compare hash-anchored edits vs traditional line-based edits:

```bash
npm run benchmark
```

The benchmark simulates race conditions where files are modified between read and write operations. It measures:

1. **Success rate**: How many edits succeed without corruption
2. **Corruption detection**: How many edits corrupt the file (wrong line edited)
3. **Correctness**: Whether edited content appears in the expected location

### Expected Results

Hash-anchored edits should show:
- **Zero stale-line errors** (edits refused when content changed)
- **Zero corruptions** (never edits the wrong line)
- **Higher success rate** in concurrent scenarios

Line-based edits may show:
- **Corruptions** when files change between read and write
- **Silent failures** (edit succeeds but corrupts the file)

## Harness-Specific Quirks

Each harness has different configuration locations and settings formats:

### Claude Code
- **Config location**: `~/.claude/settings.json`
- **Hooks key**: `hooks`
- **Notes**: Project-level settings override global settings

### OpenCode
- **Config location**: `~/.opencode/config.json`
- **Hooks key**: `hooks`
- **Notes**: Uses JSON configuration format

### Codex
- **Config location**: `~/.codex/config.json`
- **Hooks key**: `hooks`
- **Notes**: Similar to OpenCode configuration

### Cursor
- **Config location**: `.cursor/settings.json` (project-local)
- **Hooks key**: `hooks`
- **Notes**: Settings are per-project, not global

### Gemini CLI
- **Config location**: `~/.gemini/settings.json`
- **Hooks key**: `extensions`
- **Notes**: Uses `extensions` key instead of `hooks`

### Pi.dev
- **Config location**: `~/.pi/agent/settings.json`
- **Hooks key**: `hooks`
- **Notes**: Global config in `~/.pi/agent/` directory

### OMP
- **Config location**: `.omp/settings.json` (project-local)
- **Hooks key**: `hooks`
- **Notes**: Project-level configuration, similar to Cursor

## Architecture

```
omg-ai/
  bin/omg-ai.js          CLI entry point
  src/
    edit-tool.js          Hash-anchored edit engine
    skill-merger.js       Skill scanning, dedup, merge
    harness-adapter.js    Multi-harness detection and install
  tests/
    test-edit-tool.js
    test-skill-merger.js
    test-harness-adapter.js
```

Zero external dependencies. Uses only Node.js >= 18 built-ins.

## Attribution

OMG-AI consolidates work from:

- **ECC** by [@affaan-m](https://github.com/affaan-m) -- MIT License
- **oh-my-openagent** by [@code-yeongyu](https://github.com/code-yeongyu) -- MIT License
- **oh-my-claudecode** by [@Yeachan-Heo](https://github.com/Yeachan-Heo) -- MIT License
- **1ai-skills** by [@oyi77](https://github.com/oyi77) -- MIT License

## License

MIT
