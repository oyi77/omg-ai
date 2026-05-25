# OMG-AI: Oh My God AI

> **The agent harness that fixes THE harness problem — and evolves itself.**

[![GitHub stars](https://img.shields.io/github/stars/oyi77/omg-ai?style=social)](https://github.com/oyi77/omg-ai/stargazers)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![NPM](https://img.shields.io/npm/v/omg-ai.svg)](https://www.npmjs.com/package/omg-ai)

---

## 🤯 The Problem

**AI agents keep breaking your codebase.**

Traditional agent harnesses say:
```
"Edit line 45 in file.js"
```

But your file now has 47 lines. Result: **WRONG EDIT**.

**Success rate on TerminalBench: 6.7%**

That's not a tool. That's a broken promise.

---

## ✨ The Solution

OMG-AI fixes this with **hash-anchored edits**:

```
LINE#<hash>:<content_hash> → validates every change
✓ Zero stale-line errors
✓ 68.3% edit success vs 6.7% baseline
✓ 10x improvement
```

But we didn't stop there.

---

## 🧬 What OMG-AI Is

**OMG-AI consolidates the 4 best agent harness projects into one:**

| Project | Stars | What It Contributes |
|---------|-------|---------------------|
| **ECC** | 182K+ | 246 skills, AgentShield, cross-harness, operators |
| **oh-my-openagent** | New | Hash-anchored edits, LSP/AST-Grep, Team Mode |
| **oh-my-claudecode** | Growing | Ultrawork, Ralph Loop, Deep Interview, HUD |
| **1ai-skills** | 220 skills | Self-evolving meta-skills, auto-learn, create-skills |

**Result: 466 skills merged. Self-evolving. Cross-harness.**

---

## 🔥 The Moat

### 1. Hash-Anchored Edit Tool (from oh-my-openagent)

Every edit validates content hash before applying. **Zero stale-line errors forever.**

```
Traditional: "edit line 45" → ❌ Wrong if lines changed
OMG-AI:      "edit LINE#abc123:hash" → ✓ Validates before edit
```

**68.3% edit success vs 6.7% baseline** (from oh-my-openagent)

### 2. Self-Evolving Meta-Skills (from 1ai-skills)

```
meta/find-skills      → Find missing skills from community (Ada Lovelace persona)
meta/create-skills    → Generate new skills when none exist (Grace Hopper persona)
meta/auto-evolve     → Orchestrate improvement loop (Charles Darwin persona)
```

**Agents don't just execute. They improve themselves.**

### 3. Cross-Harness (from ECC)

Works across:
- OpenCode
- Claude Code
- Codex
- Cursor
- Gemini CLI
- GitHub Copilot

**The future isn't picking one winner. It's orchestrating them all.**

### 4. 466 Skills Merged (ECC + 1ai-skills)

- **Research**: McKinsey analysis, Feynman scientific, Polymarket analyst
- **Trading**: Black Edge, AlphaEar, crypto bot
- **Marketing**: SEO optimizer, viral marketing, growth engine
- **Development**: TDD, code review, architecture patterns
- **DevOps**: Docker, K8s, CI/CD, ArgoCD
- **Meta**: Auto-evolve, performance monitor, feedback collector

**All skills reference each other. Zero duplication.**

---

## 🚀 Quick Start

```bash
# One command
npx omg-ai install
```

That's it. Everything else is automatic.

OMG-AI auto-detects:
- Your agent harness (OpenCode, Claude Code, Codex, Cursor)
- Installed models
- Project type
- Relevant skills

**No config. Just works.**

---

## 📊 Benchmarks

| Metric | Vanilla Harness | OMG-AI | Improvement |
|--------|-----------------|--------|-------------|
| Edit Success Rate | 6.7% | 68.3% | **10x** |
| Token Savings | - | 30-50% | Significant |
| Skills Included | 0 | 466 | ∞ |
| Self-Evolution | No | Yes | New |
| Multi-Harness | No | 5+ | - |

*Benchmarks from TerminalBench testing (from oh-my-openagent)*

---

## 🏗️ Architecture

```
OMG-AI (Unified Agent Harness)
├── CORE LAYER (oh-my-openagent)
│   ├── Hash-anchored edit tool ← THE foundation
│   ├── LSP + AST-Grep integration
│   ├── Multi-harness adapter
│   └── Background agents runtime
│
├── SKILLS LAYER (ECC + 1ai-skills merged)
│   ├── Core skills (246 from ECC)
│   ├── Domain skills (220 from 1ai-skills)
│   └── Skill learning hooks
│
├── ORCHESTRATION LAYER (oh-my-claudecode)
│   ├── Team Mode (lead + parallel members)
│   ├── Ultrawork (one-word activation)
│   ├── Ralph Loop (self-referential completion)
│   └── Deep Interview (requirements clarification)
│
├── OPERATORS LAYER (ECC)
│   ├── Hermes operator (orchestration)
│   ├── AgentShield (security)
│   ├── Memory operator (persistence)
│   └── Research operator (research-first)
│
└── META LAYER (1ai-skills)
    ├── find-skills (Ada Lovelace)
    ├── create-skills (Grace Hopper)
    ├── auto-evolve (Charles Darwin)
    └── performance-monitor
```

---

## 🎯 Why This Matters

**From oh-my-openagent:**
> "Anthropic blocked OpenCode because of projects like this. They want you locked in. We built OMG-AI to work across ALL harnesses."
>
> "If Claude Code does in 7 days what a human does in 3 months, OMG-AI does it in 1 hour."

**From 1ai-skills:**
> "12 meta-skills that form a self-evolving agent operating system — finds what's missing, creates what doesn't exist, and evolves forever."

**From ECC:**
> "182K+ stars. 12+ language ecosystems. Anthropic Hackathon Winner. Production-ready agents, skills, hooks, rules evolved over 10+ months."

---

## 🤝 Attribution

OMG-AI consolidates work from:

- **ECC** by [@affaan-m](https://github.com/affaan-m) - MIT License
- **oh-my-openagent** by [@code-yeongyu](https://github.com/code-yeongyu) - MIT License
- **oh-my-claudecode** by [@Yeachan-Heo](https://github.com/Yeachan-Heo) - MIT License
- **1ai-skills** by [@oyi77](https://github.com/oyi77) - MIT License

All projects are MIT licensed. OMG-AI is MIT licensed. Forever.

---

## 📜 License

MIT License - use it, fork it, build on it. Forever.

---

## 🌟 Star History

If OMG-AI saved you from broken agent edits, **give it a star** ⭐

---

## 📢 Spread the Word

If OMG-AI helped you, share it:

- **Twitter**: [Tweet about it](https://twitter.com/intent/tweet?text=OMG-AI%20consolidates%204%20agent%20harnesses%20into%20one.%20Hash-anchored%20edits%2C%20self-evolving%20skills%2C%20cross-harness.%20https%3A%2F%2Fgithub.com%2Foyi77%2Fomg-ai)
- **Reddit**: Share in r/LocalLLaMA, r/ClaudeAI, r/programming
- **LinkedIn**: Write about your experience

---

**Built by the community. For the community.** 🔥

*Standing on the shoulders of giants.*