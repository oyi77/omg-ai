# Changelog

All notable changes to the OMG-AI project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- GitHub Actions CI workflow for tests and npm publish
- Benchmark script for hash-anchored vs line-based edits
- Harness-specific quirks documentation
- Interactive `setup` command to install harness + OMG-AI hooks

## [1.0.0] - 2026-05-30

### Added
- Hash-anchored edit tool with SHA-256 validation
- Skill merger for SKILL.md files with deduplication
- Multi-harness adapter supporting:
  - Claude Code
  - OpenCode
  - Codex
  - Cursor
  - Gemini CLI
  - Pi.dev
  - OMP
- CLI with commands: edit, verify, skills, install, uninstall, status
- Skill catalog generation (1,286 skills from 1ai-skills)
- Test suite with 42 tests covering all components

### Changed
- Consolidated work from ECC, oh-my-openagent, oh-my-claudecode, and 1ai-skills

### Fixed
- None (initial release)

## [0.1.0] - 2026-05-30

### Added
- Initial project structure
- Basic hash-anchored edit implementation
- Skill merging prototype
- Harness detection for Claude Code and OpenCode

---

## Release Notes

### 1.0.0 - Multi-Harness Support

This release marks the first stable version of OMG-AI with full multi-harness support. Key highlights:

1. **Hash-Anchored Edits**: Zero stale-line errors with SHA-256 validation
2. **Skill Merging**: 1,286 skills from 1ai-skills with deduplication
3. **Multi-Harness**: One-command install for 7 different AI coding agent harnesses
4. **Zero Dependencies**: Uses only Node.js >= 18 built-ins

### Installation

```bash
npx omg-ai install
```

Or for a specific harness:

```bash
npx omg-ai install claude-code
npx omg-ai install opencode
npx omg-ai install cursor
npx omg-ai install pi-dev
npx omg-ai install omp
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## License

MIT