# Code Mycelium — Project Evaluation

**Date:** 2026-02-20
**Version evaluated:** 0.1.0 (Phase 1 Prototype)
**Evaluator:** Claude Code

---

## Summary Scorecard

| Metric | Score | Grade |
|---|---|---|
| Build Quality | 7/10 | B |
| Code Quality | 7/10 | B |
| Documentation | 9/10 | A |
| Technical Innovation | 8/10 | A- |
| Marketing Potential | 9/10 | A |
| Roadmap & Vision | 8/10 | A- |
| Phase 1 Completeness | 6/10 | C+ |
| Scalability | 5/10 | C |
| Ecosystem Fit | 7/10 | B |
| **Overall** | **7.3/10** | **B+** |

Strong oneshot. The concept and marketing story carry it well above average. Technical gaps are expected for a Phase 1 prototype but should be tracked.

---

## 1. Build Quality — 7/10

**What works:**
- `npm install` is clean; all 8 dependencies resolve without conflicts
- `npm run demo` runs successfully and produces readable output
- The CLI shebang (`#!/usr/bin/env node`) is correct
- ES module format (`"type": "module"`) is properly applied throughout

**Issues:**
- `npm test` will fail — `package.json` points to `tests/run.js` but no `tests/` directory exists. Running it throws a module-not-found error immediately.
- `acorn` and `acorn-walk` are listed as dependencies and installed but are **never imported or used** anywhere in the source. Dead weight (~80KB extra in `node_modules`). These appear to be a planned fallback parser that was never wired in.
- No linter or formatter is configured. `CONTRIBUTING.md` mentions Prettier, but it's not in `devDependencies` and there's no `.prettierrc`.
- No `.nvmrc` or `engines` field specifying which Node.js version is required (ES modules with top-level `import.meta.url` need Node 14.6+).

**For a oneshot:** Acceptable. Fix the `npm test` script before publicizing.

---

## 2. Code Quality — 7/10

**Strengths:**
- Core engine is 393 lines — impressively scoped for what it does
- Clean class structure, good use of `Map`/`Set`
- Consistent naming conventions throughout
- Error handling in `parseFile` prevents one bad file from crashing the run

**Issues:**

**Vocabulary ordering bug (medium severity):**
In `simpleEmbed()`, the vocabulary `Set` is built incrementally as each node is embedded. Because `Set` insertion order is preserved in JavaScript, nodes processed earlier produce vectors over a smaller vocabulary subset than nodes processed later. Two nodes with identical code but processed in different orders will produce different vector lengths — cosine similarity results are therefore non-deterministic and depend on parse order.

Fix: build the full vocabulary in a separate first pass, then generate all embeddings.

**`this.imports` is collected but never used:**
The `ImportDeclaration` visitor (line 137–148) populates `this.imports`, but `buildExplicitConnections()` never reads it. Import chains are listed as a future feature in the README, which is honest, but collecting the data and then ignoring it is misleading.

**`this.imports` initialization is fragile:**
`if (!this.imports) this.imports = []` inside a traverse callback means this property isn't initialized in the constructor. It also gets set on every file rather than being pre-declared.

**`detectPatterns()` is called twice:**
Once in `buildNetwork()` (return value used for stats) and once in `visualize()` (return value used for display). This is a minor inefficiency — store the result once.

**`buildExplicitConnections()` is mislabeled:**
It only creates same-file connections (trivial) and has a comment saying call graphs are future work. The README implies explicit connections are implemented. The code comment is honest; the README framing is not.

**Silent parse failures:**
`catch (err)` in `parseFile` swallows all errors. The commented-out `console.warn` should at minimum be a `--verbose` flag option.

---

## 3. Documentation — 9/10

The README is the strongest part of this project.

**What's excellent:**
- Opens with the core problem-solution contrast immediately ("Traditional tools show X, Code Mycelium reveals Y")
- Example output in the README matches actual output — no bait-and-switch
- Use cases are concrete and phrased as real developer questions ("What breaks if I change X?")
- Roadmap is honest about what's done vs. planned, with a realistic 5-phase arc
- `CONTRIBUTING.md` is philosophy-aligned and directs contributors to high-value areas
- Inline comments explain *why* decisions were made, not just *what* the code does
- The philosophy section ("reveal, not generate") is a coherent and defensible position

**Minor gaps:**
- No JSDoc types on public methods — fine for Phase 1, but `buildNetwork(baseDir)` should document its return shape
- No `CHANGELOG.md` yet (not critical at v0.1.0)
- The README mentions `acorn` in... actually it doesn't. That dependency is silently unused, which is consistent with not documenting it.

---

## 4. Technical Innovation — 8/10

**Novel in practice (if not in academia):**
- Most developer-facing code analysis tools focus on explicit structural relationships (imports, calls, cycles). Semantic similarity as a first-class signal is largely absent from OSS tooling.
- The "emergent architecture" framing — actual structure vs. documented structure — is a genuine insight developers feel but lack tools to see.
- Treating a codebase as a *network* rather than a tree is the right mental model for coupling analysis.

**Phase 2 is where it gets genuinely new:**
Word-frequency embeddings are a reasonable Phase 1 shortcut, but LLM embeddings (Phase 2) would let the tool detect conceptual similarity across different naming conventions, languages, and paradigms — something no current OSS tool does. That's a meaningful gap in the market.

**Academic precedent:**
Semantic code clone detection exists in research (e.g., SourcererCC, LICCA), and coupling analysis goes back to the 1990s. The novelty is in the *accessible, developer-native packaging* and the LLM-embeddings angle, not the underlying theory.

---

## 5. Marketing Potential — 9/10

This is the strongest metric. The project has a rare combination of a memorable name, a compelling metaphor, and clear pain points.

**Name & concept:**
"Code Mycelium" is unusual enough to stick in memory and evocative enough to communicate the value proposition without explanation. Developers who know mycelium (and many do, post-Fantastic Fungi) immediately get the "hidden network beneath the surface" idea.

**Taglines that work:**
- "Reveal hidden connections in your codebase like mycelial networks in a forest."
- "The best insights aren't written — they're discovered in the latent structure of your existing codebase."
- "We reveal, not generate." (strong anti-AI-slop positioning)

**Target audience:**
- Senior engineers facing large legacy codebases ✓
- Engineering managers doing architecture audits ✓
- New engineers onboarding to unfamiliar repos ✓
- DevRel/conference speakers looking for interesting demos ✓

**Distribution hooks:**
- `npx mycelium analyze .` — zero-install demo on any JS codebase is a viral vector
- ASCII output is tweetable/postable without screenshots
- The DRY violation detection gives an immediate "aha moment" on real codebases

**Gaps to close before public launch:**
- npm keywords are too generic: `["code-analysis", "graph", "visualization", "refactoring"]`. Better: `["semantic-analysis", "code-graph", "dependency-analysis", "codebase-visualization", "dead-code", "refactoring-tool", "mycelium"]`
- No social presence established yet
- The mushroom emoji (🍄) is memorable but test whether it lands in professional contexts (Slack/GitHub). It's a calculated risk.
- No demo GIF or screen recording yet — this is the #1 missing marketing asset

---

## 6. Roadmap & Vision — 8/10

The 5-phase roadmap is well-sequenced and credible.

**Phase sequencing is correct:**
1. AST parsing + basic detection (done) — establish the foundation
2. LLM embeddings + call graphs — this is the right next step and the biggest quality jump
3. Git history coupling — high-value, differentiating, and underexplored
4. Interactive D3 visualization — the "wow demo" feature that will drive sharing
5. Intelligence layer — automated suggestions, architecture drift

**Strengths:**
- Phase 2 (LLM embeddings) is realistic — OpenAI/Anthropic embedding APIs are straightforward to integrate
- Phase 3 (git coupling) is a genuinely interesting signal: files that change together are coupled even without explicit imports
- Phase 4 "Cyberscape hex-grid renderer" is ambitious and would be a viral demo

**Missing from roadmap:**
- Performance plan: O(n²) comparison needs to be addressed before targeting large codebases (10k+ functions)
- Language expansion: Python, Java, Go, Ruby are the next logical targets after JS/TS
- Plugin system: an extension point for custom pattern detectors would enable community contributions
- npm publish / package registry strategy

---

## 7. Phase 1 Completeness — 6/10

What Phase 1 claimed vs. what shipped:

| Feature | Claimed | Shipped | Notes |
|---|---|---|---|
| AST parsing (JS/TS) | ✅ | ✅ | Works well |
| Explicit connections (same-file) | ✅ | ⚠️ | Same-file only; import chains listed as "future" in code but not in README |
| Semantic similarity | ✅ | ⚠️ | Works, but vocabulary ordering bug affects reliability |
| Terminal visualization | ✅ | ✅ | Looks good |
| Hub/cluster/orphan detection | ✅ | ✅ | Works |
| Tests | (implied by `npm test`) | ❌ | No test directory exists |
| Import tracking | Collected | ❌ | Data collected but never used |
| Unused dependency (acorn) | — | ❌ | Installed, never imported |

Phase 1 is a successful proof of concept. The gaps are honest for a oneshot but should be documented rather than implied-shipped.

---

## 8. Scalability — 5/10

**The honest constraint:**
The README acknowledges O(n²) is "acceptable for small codebases." This is accurate and fair. But "small" should be quantified — the algorithm will become noticeably slow around 500 functions and prohibitively slow around 5,000.

**Concrete bottlenecks:**

| Issue | Impact |
|---|---|
| O(n²) pairwise comparison | Quadratic growth; 1,000 nodes = ~500k comparisons |
| Shared vocabulary grows unboundedly | Memory pressure on large repos |
| Vocabulary ordering affects embeddings | Inconsistent results depending on file parse order |
| Same-file connections are O(n²) per file | Dense files create huge connection sets |
| No streaming | Entire codebase loaded into memory |

**For the stated goal (Phase 1 POC on small codebases):** 5/10 is appropriate — it's not a failure, it's a deferred concern. Phase 2 should address this before targeting larger repos.

---

## 9. Ecosystem Fit — 7/10

**Existing tools and how Code Mycelium relates:**

| Tool | Focus | Relationship to Code Mycelium |
|---|---|---|
| `madge` | Import cycles | Complementary — structural vs. semantic |
| `dependency-cruiser` | Dependency rules/violations | Complementary — prescriptive vs. exploratory |
| `jscpd` | Literal code duplication | Overlapping but weaker — syntactic vs. semantic |
| `SonarQube` / `CodeClimate` | Comprehensive quality gate | Code Mycelium is lighter and more exploratory |
| `ts-morph` | TypeScript AST manipulation | Complementary — Code Mycelium sits above this layer |

**The semantic gap:**
No mainstream OSS tool does *semantic* code similarity for the purpose of surfacing architectural patterns. This is Code Mycelium's white space. `jscpd` finds literal duplicates; Code Mycelium (with Phase 2 LLM embeddings) would find conceptually similar code even with different names and styles.

**Positioning advice:**
Don't compete with madge/dependency-cruiser on explicit dependency analysis. Position as the tool that reveals what explicit analysis misses. Lean into the "hidden network" angle.

---

## Key Recommendations

**Before publicizing (must-fix):**
1. Fix `npm test` — point it to a real test file or remove the script
2. Remove `acorn`/`acorn-walk` from dependencies (saves ~80KB, removes confusion)
3. Fix the vocabulary ordering bug in `simpleEmbed()` — it affects result reliability
4. Add a demo GIF to the README

**Near-term improvements:**
5. Wire up `this.imports` into the connection graph or remove the collection code
6. Add a `--verbose` flag that surfaces parse errors instead of swallowing them
7. Better npm keywords for discoverability
8. Specify `"engines": { "node": ">=14.6.0" }` in `package.json`

**For Phase 2:**
9. Prioritize LLM embeddings — this is the biggest quality jump
10. Address O(n²) scaling with approximate nearest-neighbor search (e.g., locality-sensitive hashing) before targeting large codebases
11. Implement actual import chain tracking (the data collection is already in place)

---

## Final Verdict

**Code Mycelium is an excellent oneshot.** The concept is fresh, the name is memorable, and the marketing story writes itself. The code is clean and readable for a rapid prototype. The gaps — no tests, unused dependencies, vocabulary bug — are all fixable and expected at Phase 1.

The critical juncture is Phase 2. If LLM embeddings land well, this tool could carve out a real niche in the developer tooling space. The combination of semantic similarity + git coupling analysis (Phase 3) would be genuinely novel in the OSS ecosystem.

The roadmap is credible. The concept is differentiated. Ship Phase 2.
