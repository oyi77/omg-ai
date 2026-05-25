# OMG-AI Architecture

> Deep technical architecture for developers who want to understand what's under the hood.

---

## Overview

OMG-AI is a **consolidated agent harness** that merges the best innovations from 4 open-source projects:

1. **ECC** (182K+ stars) - Cross-harness maturity, skills, operators
2. **oh-my-openagent** - Hash-anchored edits, LSP/AST, Team Mode
3. **oh-my-claudecode** - Orchestration, Ultrawork, Deep Interview
4. **1ai-skills** (220 skills) - Self-evolving meta-skills

This document explains how these systems integrate without duplication.

---

## Core Innovation: Hash-Anchored Edit Tool

### The Problem

Traditional agent harnesses use line-based edits:

```
Prompt: "Edit line 45 in file.js"
Agent:  edit_file(file.js, line=45, content="...")
```

**Issue:** If the file changed since the agent read it, line 45 is now wrong.

**TerminalBench success rate: 6.7%**

### The Solution

OMG-AI uses hash-anchored edits (from oh-my-openagent):

```typescript
interface EditOperation {
  type: 'edit';
  anchor: {
    lineId: string;        // LINE#abc123
    contentHash: string;   // SHA-256 of expected content
  };
  newContent: string;
}

// Before editing:
// 1. Compute content hash at line
// 2. Verify hash matches expectation
// 3. If mismatch: REFUSE to edit
// 4. If match: apply edit
```

**Result: Zero stale-line errors. 68.3% success rate. 10x improvement.**

### Why It Works

1. **LINE#ID**: Unique identifier for each line
2. **Content hash**: SHA-256 of the line content
3. **Validation**: Before every edit, verify hash
4. **Refusal**: If hash mismatch, refuse to edit (safe failure)

This is inspired by [oh-my-pi](https://github.com/can1357/oh-my-pi) and formalized in [The Harness Problem](https://blog.can.ac/2026/02/12/the-harness-problem/).

---

## Architecture Layers

```
OMG-AI (Unified Agent Harness)
│
├── CORE LAYER (oh-my-openagent foundation)
│   │
│   ├── hash-anchored-edit-tool.ts
│   │   └── Content hash validation for every edit
│   │
│   ├── lsp-adapter.ts
│   │   └── Refactoring, rename, diagnostics (IDE precision)
│   │
│   ├── ast-grep-integration.ts
│   │   └── AST-aware code search and rewrite
│   │
│   ├── multi-harness-adapter.ts
│   │   └── Unified interface for:
│   │       - OpenCode
│   │       - Claude Code
│   │       - Codex
│   │       - Cursor
│   │       - Gemini CLI
│   │
│   └── background-agents-runtime.ts
│       └── Fire 5+ specialists in parallel
│       └── Context stays lean, results when ready
│
├── SKILLS LAYER (ECC + 1ai-skills merged)
│   │
│   ├── core/
│   │   ├── self-improvement/
│   │   ├── memory-systems/
│   │   └── AI-orchestration/
│   │
│   ├── research/
│   │   ├── mckinsey-analysis/
│   │   ├── deep-research-pro/
│   │   └── continuous-learning/
│   │
│   ├── trading/
│   │   ├── black-edge/
│   │   ├── alpha-ear/
│   │   └── crypto-trading-bot/
│   │
│   ├── marketing/
│   │   ├── seo-optimizer/
│   │   ├── viral-marketing/
│   │   └── growth-engine/
│   │
│   ├── development/
│   │   ├── TDD/
│   │   ├── systematic-debugging/
│   │   └── code-reviewer/
│   │
│   ├── automation/
│   │   ├── n8n-workflows/
│   │   ├── browser-automation/
│   │   └── social-media/
│   │
│   └── content/
│       ├── remotion-video/
│       ├── ai-podcast/
│       └── seedance/
│
├── ORCHESTRATION LAYER (oh-my-claudecode)
│   │
│   ├── team-mode.ts
│   │   └── Lead agent + N parallel members
│   │   └── Real-time coordination
│   │
│   ├── ultrawork.ts
│   │   └── One-word activation
│   │   └── All agents activate immediately
│   │
│   ├── ralph-loop.ts
│   │   └── Self-referential completion
│   │   └── Doesn't stop until 100% done
│   │
│   ├── deep-interview.ts
│   │   └── Socratic questioning for requirements
│   │   └── Clarifies thinking before execution
│   │
│   ├── auto-resume.ts
│   │   └── Recovery from rate limits
│   │   └── Session persistence
│   │
│   └── cost-optimization.ts
│       └── Smart model routing
│       └── 30-50% token savings
│
├── OPERATORS LAYER (ECC)
│   │
│   ├── hermes-operator/
│   │   └── Task orchestration
│   │   └── Workflow management
│   │
│   ├── agent-shield/
│   │   └── Security scanning
│   │   └── Injection prevention
│   │
│   ├── memory-operator/
│   │   └── Session persistence
│   │   └── Context injection
│   │
│   └── research-operator/
│       └── Research-first development
│       └── Auto-context retrieval
│
└── META LAYER (1ai-skills)
    │
    ├── find-skills/
    │   └── Ada Lovelace persona
    │   └── Discover community skills
    │
    ├── create-skills/
    │   └── Grace Hopper persona
    │   └── Generate new skills
    │
    ├── auto-evolve/
    │   └── Charles Darwin persona
    │   └── Orchestrate improvement loop
    │
    ├── performance-monitor/
    │   └── Track latency, success, cost
    │
    ├── feedback-collector/
    │   └── Aggregate from all sources
    │
    ├── self-assessment/
    │   └── Skills evaluate their accuracy
    │
    ├── improvement-generator/
    │   └── Create prioritized improvement plans
    │
    ├── skill-evolution/
    │   └── Version control with rollback
    │
    ├── auto-learner/
    │   └── Autonomous learning from execution
    │
    ├── pattern-recognition/
    │   └── Identify success/failure patterns
    │
    ├── meta-orchestrator/
    │   └── Coordinate self-improvement loop
    │
    └── data/
        └── SQLite storage for metrics
        └── Feedback and versions
```

---

## Unified Install Flow

```bash
npx omg-ai install
```

### What Happens:

1. **Detect Harness**
   ```javascript
   const harness = detectHarves(); // OpenCode, Claude Code, Codex, Cursor, etc.
   ```

2. **Inject Hash-Anchored Edit Tool**
   ```javascript
   // Core layer - ALWAYS installed
   injectHashAnchoredEditTool(harness);
   ```

3. **Merge Skills**
   ```javascript
   // Skills layer - 466 skills
   mergeSkillSets(['ECC', '1ai-skills']);
   // De-duplicate by skill ID
   // Resolve references
   ```

4. **Wire Meta-Skills**
   ```javascript
   // Meta layer - self-evolution
   setupMetaSkills({
     find_skills: true,
     create_skills: true,
     auto_evolve: true
   });
   ```

5. **Configure Orchestration**
   ```javascript
   // Orchestration layer - if harness supports
   if (harness.supportsTeamMode) {
     setupTeamMode(harness);
   }
   ```

6. **Register Hooks**
   ```javascript
   // Hooks for session lifecycle
   registerHooks({
     session_start: [autoDetectProject],
     post_task: [logPerformance],
     session_stop: [generateSummary]
   });
   ```

---

## Benchmarks Methodology

### Edit Success Rate

**From oh-my-openagent:**

> Tested on TerminalBench (Grok Code Fast 1):
> - Vanilla harness: 6.7% edit success
> - oh-my-openagent: 68.3% edit success
> - **10x improvement**

**How measured:**
- 100+ edit operations per test
- Multiple file types (TypeScript, Python, Go)
- Real-world scenarios (refactoring, bug fixes, features)

**Why hash-anchored wins:**
- Zero stale-line errors
- Validation before every edit
- Safe failure (refuse to edit if mismatch)

---

## Differentiation

### OMG-AI vs ECC

| Aspect | ECC | OMG-AI |
|--------|-----|--------|
| Skills | 246 | 466 (ECC + 1ai) |
| Self-evolution | No | Yes (meta-skills) |
| Hash-anchored edits | No | Yes |
| Team Mode | No | Yes |

**OMG-AI = ECC + more skills + self-evolution + hash edits**

### OMG-AI vs oh-my-openagent

| Aspect | oh-my-openagent | OMG-AI |
|--------|-----------------|--------|
| Skills | Few | 466 |
| Self-evolution | No | Yes (meta-skills) |
| Cross-harness | OpenCode only | 5+ harnesses |
| Operators | No | Yes (Hermes, AgentShield) |

**OMG-AI = oh-my-openagent + skills + evolution + operators**

### OMG-AI vs oh-my-claudecode

| Aspect | oh-my-claudecode | OMG-AI |
|--------|------------------|--------|
| Harness | Claude Code only | 5+ harnesses |
| Hash-anchored edits | No | Yes |
| Self-evolution | Learning hooks | Full meta-skills |
| Skills | Some | 466 |

**OMG-AI = oh-my-claudecode + cross-harness + hash edits + more skills**

### OMG-AI vs 1ai-skills

| Aspect | 1ai-skills | OMG-AI |
|--------|-----------|--------|
| Skills | 220 | 466 (merged) |
| Harness runtime | No | Yes |
| Hash-anchored edits | No | Yes |
| Operators | No | Yes |

**OMG-AI = 1ai-skills + harness runtime + hash edits + operators**

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- How to add skills
- How to contribute operators
- How to improve meta-skills

---

## License

MIT License. All merged projects are MIT licensed.

---

*Architecture designed for developers who want to understand. For users, just run `npx omg-ai install`.*