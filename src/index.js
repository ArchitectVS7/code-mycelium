#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { parse as babelParse } from '@babel/parser';
import traverse from '@babel/traverse';
import { glob } from 'glob';
import cosineSimilarity from 'cosine-similarity';

/**
 * Code Mycelium - Phase 1 Prototype
 * Reveals hidden connections in JavaScript/TypeScript codebases
 */

export class CodeMycelium {
  constructor() {
    this.nodes = new Map();        // Code entities (functions, classes)
    this.connections = new Map();  // Edges between nodes
    this.embeddings = new Map();   // Simple vector embeddings (word frequency)
  }

  /**
   * Build the mycelial network from a codebase
   */
  async buildNetwork(baseDir) {
    console.log('🍄 Building mycelial network...\n');
    
    // 1. Find all JS/TS files
    const files = await glob(`${baseDir}/**/*.{js,ts,jsx,tsx}`, {
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
    });
    
    console.log(`Found ${files.length} files to analyze\n`);
    
    // 2. Parse each file into AST
    for (const filePath of files) {
      await this.parseFile(filePath);
    }
    
    // 3. Build explicit connections (imports, calls)
    this.buildExplicitConnections();
    
    // 4. Build semantic connections (similarity)
    this.buildSemanticConnections();
    
    // 5. Detect patterns
    const patterns = this.detectPatterns();
    
    return {
      nodes: this.nodes.size,
      connections: this.connections.size,
      patterns
    };
  }

  /**
   * Parse a single file and extract code entities
   */
  async parseFile(filePath) {
    try {
      const code = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      
      // Parse AST with Babel (supports all modern JS/TS)
      const ast = babelParse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript']
      });
      
      // Extract code entities with traverse
      traverse.default(ast, {
        FunctionDeclaration: (path) => {
          const node = path.node;
          if (node.id) {
            this.addNode({
              id: `${relativePath}::${node.id.name}`,
              type: 'function',
              name: node.id.name,
              location: relativePath,
              line: node.loc?.start.line,
              code: code.substring(node.start, node.end),
              imports: [],
              calls: []
            });
          }
        },
        
        FunctionExpression: (path) => {
          const node = path.node;
          if (node.id) {
            this.addNode({
              id: `${relativePath}::${node.id.name}`,
              type: 'function',
              name: node.id.name,
              location: relativePath,
              line: node.loc?.start.line,
              code: code.substring(node.start, node.end),
              imports: [],
              calls: []
            });
          }
        },
        
        ClassDeclaration: (path) => {
          const node = path.node;
          if (node.id) {
            this.addNode({
              id: `${relativePath}::${node.id.name}`,
              type: 'class',
              name: node.id.name,
              location: relativePath,
              line: node.loc?.start.line,
              code: code.substring(node.start, node.end),
              imports: [],
              calls: []
            });
          }
        },
        
        ClassMethod: (path) => {
          const node = path.node;
          if (node.key?.name || node.key?.value) {
            const name = node.key.name || node.key.value;
            this.addNode({
              id: `${relativePath}::${name}`,
              type: 'method',
              name: name,
              location: relativePath,
              line: node.loc?.start.line,
              code: code.substring(node.start, node.end),
              imports: [],
              calls: []
            });
          }
        },
        
        ImportDeclaration: (path) => {
          const node = path.node;
          const source = node.source.value;
          for (const specifier of node.specifiers) {
            const importName = specifier.local.name;
            if (!this.imports) this.imports = [];
            this.imports.push({
              file: relativePath,
              name: importName,
              source
            });
          }
        }
      });
      
    } catch (err) {
      // Silently skip unparseable files
      // console.warn(`Skipping ${filePath}: ${err.message}`);
    }
  }

  /**
   * Add a node to the network
   */
  addNode(node) {
    this.nodes.set(node.id, node);
  }

  /**
   * Build explicit connections (imports, function calls)
   */
  buildExplicitConnections() {
    // For Phase 1, we'll skip detailed call graph analysis
    // Just note: this would walk the AST to find CallExpression nodes
    // and match them to declared functions
    
    // Placeholder: detect obvious patterns like same file connections
    for (const [id, node] of this.nodes) {
      const sameFileNodes = Array.from(this.nodes.values())
        .filter(n => n.location === node.location && n.id !== id);
      
      for (const related of sameFileNodes) {
        this.addConnection(node.id, related.id, 'same-file', 0.5);
      }
    }
  }

  /**
   * Build semantic connections using simple embeddings
   */
  buildSemanticConnections() {
    console.log('🔗 Computing semantic similarity...\n');
    
    // Generate simple word-frequency embeddings
    const allNodes = Array.from(this.nodes.values());
    
    for (const node of allNodes) {
      this.embeddings.set(node.id, this.simpleEmbed(node.code));
    }
    
    // Compare all pairs (O(n²) - acceptable for small codebases)
    for (let i = 0; i < allNodes.length; i++) {
      for (let j = i + 1; j < allNodes.length; j++) {
        const nodeA = allNodes[i];
        const nodeB = allNodes[j];
        
        const embA = this.embeddings.get(nodeA.id);
        const embB = this.embeddings.get(nodeB.id);
        
        const similarity = cosineSimilarity(embA, embB);
        
        // Only connect if highly similar
        if (similarity > 0.7 && nodeA.location !== nodeB.location) {
          this.addConnection(nodeA.id, nodeB.id, 'semantic', similarity);
        }
      }
    }
  }

  /**
   * Simple embedding: word frequency vector
   * (In production, would use OpenAI/Anthropic embeddings)
   */
  simpleEmbed(code) {
    // Tokenize: split on non-word characters
    const tokens = code.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2); // Skip short tokens
    
    // Build vocabulary from all unique tokens
    if (!this.vocabulary) {
      this.vocabulary = new Set();
    }
    tokens.forEach(t => this.vocabulary.add(t));
    
    // Count frequency
    const freq = new Map();
    for (const token of tokens) {
      freq.set(token, (freq.get(token) || 0) + 1);
    }
    
    // Convert to fixed-size vector (top 100 most common words in vocabulary)
    const vocabArray = Array.from(this.vocabulary).slice(0, 100);
    const vector = vocabArray.map(word => freq.get(word) || 0);
    
    // Normalize
    const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v*v, 0));
    return magnitude > 0 ? vector.map(v => v / magnitude) : vector;
  }

  /**
   * Add a connection between two nodes
   */
  addConnection(nodeA, nodeB, type, weight) {
    const key = JSON.stringify([nodeA, nodeB].sort());
    
    if (!this.connections.has(key)) {
      this.connections.set(key, []);
    }
    
    this.connections.get(key).push({ type, weight });
  }

  /**
   * Detect patterns in the network
   */
  detectPatterns() {
    const hubs = this.findHubs();
    const clusters = this.findClusters();
    const orphans = this.findOrphans();
    
    return { hubs, clusters, orphans };
  }

  /**
   * Find hub nodes (highly connected)
   */
  findHubs() {
    const connectionCounts = new Map();
    
    for (const [key, connections] of this.connections) {
      const [nodeA, nodeB] = JSON.parse(key);
      connectionCounts.set(nodeA, (connectionCounts.get(nodeA) || 0) + 1);
      connectionCounts.set(nodeB, (connectionCounts.get(nodeB) || 0) + 1);
    }
    
    // Return top 5 most connected (filter out any undefined nodes)
    return Array.from(connectionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nodeId, count]) => ({
        node: this.nodes.get(nodeId),
        connections: count
      }))
      .filter(item => item.node !== undefined);
  }

  /**
   * Find semantic clusters (groups of similar code)
   */
  findClusters() {
    // Simple clustering: find all semantic connections and group by file
    const semanticConnections = Array.from(this.connections.entries())
      .filter(([_, conns]) => conns.some(c => c.type === 'semantic'));
    
    const fileGroups = new Map();
    
    for (const [key, conns] of semanticConnections) {
      const [nodeA, nodeB] = JSON.parse(key);
      const locationA = this.nodes.get(nodeA)?.location;
      const locationB = this.nodes.get(nodeB)?.location;
      
      if (locationA && locationB && locationA !== locationB) {
        const group = `${locationA} ↔ ${locationB}`;
        if (!fileGroups.has(group)) {
          fileGroups.set(group, []);
        }
        fileGroups.get(group).push({
          nodeA: this.nodes.get(nodeA),
          nodeB: this.nodes.get(nodeB),
          similarity: conns.find(c => c.type === 'semantic')?.weight
        });
      }
    }
    
    return Array.from(fileGroups.entries())
      .map(([group, items]) => ({ group, items }))
      .slice(0, 5); // Top 5 clusters
  }

  /**
   * Find orphaned code (no connections)
   */
  findOrphans() {
    const connectedNodes = new Set();
    
    for (const key of this.connections.keys()) {
      const [nodeA, nodeB] = JSON.parse(key);
      connectedNodes.add(nodeA);
      connectedNodes.add(nodeB);
    }
    
    return Array.from(this.nodes.values())
      .filter(node => !connectedNodes.has(node.id))
      .slice(0, 10); // Show up to 10 orphans
  }

  /**
   * Generate ASCII visualization
   */
  visualize() {
    console.log('\n═══════════════════════════════════════');
    console.log('   🍄 CODE MYCELIUM NETWORK');
    console.log('═══════════════════════════════════════\n');
    
    console.log(`📊 Network Stats:`);
    console.log(`   Nodes: ${this.nodes.size}`);
    console.log(`   Connections: ${this.connections.size}\n`);
    
    const patterns = this.detectPatterns();
    
    // Hub nodes
    if (patterns.hubs.length > 0) {
      console.log('🔥 Hub Nodes (highly connected):');
      for (const { node, connections } of patterns.hubs) {
        console.log(`   └─ ${node.name} (${node.location})`);
        console.log(`      ${connections} connections\n`);
      }
    }
    
    // Semantic clusters
    if (patterns.clusters.length > 0) {
      console.log('🔗 Semantic Clusters (similar code):');
      for (const { group, items } of patterns.clusters) {
        console.log(`   ┌─ ${group}`);
        for (const { nodeA, nodeB, similarity } of items.slice(0, 3)) {
          console.log(`   │  ${nodeA.name} ↔ ${nodeB.name}`);
          console.log(`   │  Similarity: ${(similarity * 100).toFixed(1)}%`);
        }
        console.log('   │');
      }
      console.log('');
    }
    
    // Orphans
    if (patterns.orphans.length > 0) {
      console.log('👻 Orphaned Code (no connections):');
      for (const node of patterns.orphans.slice(0, 5)) {
        console.log(`   └─ ${node.name} (${node.location}:${node.line})`);
      }
      console.log('\n   ⚠️  These may be unused or entry points\n');
    }
    
    console.log('═══════════════════════════════════════\n');
  }
}
