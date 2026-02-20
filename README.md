# 🍄 Code Mycelium

[![GitHub](https://img.shields.io/github/license/ArchitectVS7/code-mycelium)](https://github.com/ArchitectVS7/code-mycelium/blob/master/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/ArchitectVS7/code-mycelium)](https://github.com/ArchitectVS7/code-mycelium)

**Reveal hidden connections in your codebase like mycelial networks in a forest.**

## Concept

Traditional code analysis shows you:
- File structure (trees in rows)
- Explicit imports (visible paths)
- Call graphs (who calls whom)

**Code Mycelium reveals:**
- **Semantic similarity** (functions solving similar problems, potential DRY violations)
- **Coupling risk** (what breaks when you change X?)
- **Emergent architecture** (how code actually organized vs docs)
- **Hub nodes** (over-centralized code)
- **Orphaned code** (unused/unreachable functions)
- **Clusters** (organically formed modules)

## Installation

```bash
cd code-mycelium
npm install
chmod +x src/cli.js
```

## Usage

### Analyze a codebase

```bash
node src/cli.js analyze /path/to/codebase
```

### Save graph data

```bash
node src/cli.js analyze /path/to/codebase --output graph.json
```

### Run demo

```bash
npm run demo
```

## Example Output

```
═══════════════════════════════════════
   🍄 CODE MYCELIUM NETWORK
═══════════════════════════════════════

📊 Network Stats:
   Nodes: 19
   Connections: 23

🔥 Hub Nodes (highly connected):
   └─ formatDate (examples/sample-codebase/utils/helpers.js)
      3 connections

   └─ authenticateUser (examples/sample-codebase/auth/login.js)
      3 connections

🔗 Semantic Clusters (similar code):
   ┌─ examples/sample-codebase/api/posts.js ↔ examples/sample-codebase/api/users.js
   │  fetchPostsFromDatabase ↔ fetchFromDatabase
   │  Similarity: 85.3%
   │
   
   ⚠️  Potential DRY violation detected!

👻 Orphaned Code (no connections):
   └─ legacyLogin (examples/sample-codebase/legacy/oldAuth.js:6)

   ⚠️  These may be unused or entry points

═══════════════════════════════════════
```

## How It Works

### 1. AST Parsing
Uses Babel parser to extract:
- Functions
- Classes
- Methods
- Imports

### 2. Connection Building

**Explicit connections:**
- Same-file relationships
- Import/export chains (future)
- Function calls (future)

**Semantic connections:**
- Word-frequency vector embeddings
- Cosine similarity matching (threshold: 0.7)
- Detects conceptually similar code

### 3. Pattern Detection

**Hub nodes:** Highly connected code (potential over-centralization)

**Clusters:** Groups of semantically similar code across different files

**Orphans:** Code with no connections (unused or entry points)

## Roadmap

### Phase 1: ✅ Proof of Concept (Complete)
- [x] AST parsing (JavaScript/TypeScript)
- [x] Explicit connections (same-file)
- [x] Semantic similarity (simple embeddings)
- [x] Terminal visualization
- [x] Hub/cluster/orphan detection

### Phase 2: Semantic Layer (Next)
- [ ] LLM embeddings (OpenAI/Anthropic)
- [ ] Call graph analysis
- [ ] Import chain tracking
- [ ] Advanced clustering algorithms

### Phase 3: Coupling Analysis
- [ ] Git history analysis (what changes together?)
- [ ] Change impact prediction
- [ ] Risk scoring

### Phase 4: Visualization
- [ ] Web-based interactive graph (D3.js)
- [ ] Cyberscape hex-grid renderer
- [ ] Export to SVG/PNG

### Phase 5: Intelligence
- [ ] Automated refactor suggestions
- [ ] Architecture drift detection
- [ ] Code review insights

## Tech Stack

- **Parser:** Babel (@babel/parser, @babel/traverse)
- **Graph:** Custom Map/Set structures
- **Embeddings:** Simple word-frequency vectors (Phase 1)
- **CLI:** Commander.js + Chalk
- **Future:** OpenAI embeddings, D3.js visualization

## Use Cases

### 1. Refactor Risk Assessment
"If I change this function, what else breaks?"

### 2. DRY Violation Detection
"Is this code duplicated somewhere?" → 85% semantic match found

### 3. Architecture Audit
"What's the *actual* architecture?" → Emergent clusters reveal organic structure

### 4. Dead Code Identification
"Can we safely delete this?" → Orphaned nodes are candidates for removal

### 5. Onboarding
Show new devs the invisible structure of the codebase

## Philosophy

**Traditional tools:** Code is static text, we analyze structure

**Code Mycelium:** Code is a living network, we reveal connections

**The best insights aren't written—they're discovered** in the latent structure of your existing codebase.

## Example: Detected Patterns

### DRY Violation
```javascript
// api/posts.js
async function fetchPostsFromDatabase(query) {
  return { id: query.id || 1, title: 'Sample', ... };
}

// api/users.js
async function fetchFromDatabase(table, query) {
  return { id: query.id || 1, username: 'test', ... };
}
```

**Mycelium detects:** 85.3% similarity → Suggests extracting to shared helper

### Hub Node (Over-centralization)
```
utils/api.js::fetchData (23 connections)
```
**Warning:** This function is called from 23 places. Consider splitting responsibilities.

### Orphaned Code
```javascript
// legacy/oldAuth.js
function legacyLogin(username, password) {
  // No connections detected
}
```
**Suggestion:** This appears unused. Verify and consider removal.

## License

MIT

---

Built by LG2 / VS7 as part of the Code Mycelium research project.

**Status:** Phase 1 Prototype Complete ✅
