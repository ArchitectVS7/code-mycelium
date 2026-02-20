#!/usr/bin/env node

/**
 * Code Mycelium - Test Suite
 * Lightweight runner using Node's built-in assert module (no external deps).
 */

import assert from 'assert';
import path from 'path';
import { fileURLToPath } from 'url';
import { CodeMycelium } from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SAMPLE_DIR = path.join(__dirname, '../examples/sample-codebase');

// ---------------------------------------------------------------------------
// Minimal async test runner
// ---------------------------------------------------------------------------

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}

async function run() {
  let passed = 0;
  let failed = 0;

  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(`    ${err.message}`);
      failed++;
    }
  }

  console.log(`\n  ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test('CodeMycelium instantiates with correct data structures', () => {
  const cm = new CodeMycelium();
  assert.ok(cm.nodes instanceof Map, 'nodes should be a Map');
  assert.ok(cm.connections instanceof Map, 'connections should be a Map');
  assert.ok(cm.embeddings instanceof Map, 'embeddings should be a Map');
  assert.strictEqual(cm.nodes.size, 0);
  assert.strictEqual(cm.connections.size, 0);
});

test('buildNetwork returns nodes and connections > 0 on sample codebase', async () => {
  const cm = new CodeMycelium();
  const result = await cm.buildNetwork(SAMPLE_DIR);
  assert.ok(result.nodes > 0, `Expected nodes > 0, got ${result.nodes}`);
  assert.ok(result.connections > 0, `Expected connections > 0, got ${result.connections}`);
  assert.ok(result.patterns, 'result.patterns should exist');
});

test('buildNetwork result.patterns has hubs, clusters, and orphans arrays', async () => {
  const cm = new CodeMycelium();
  const result = await cm.buildNetwork(SAMPLE_DIR);
  assert.ok(Array.isArray(result.patterns.hubs), 'patterns.hubs should be an array');
  assert.ok(Array.isArray(result.patterns.clusters), 'patterns.clusters should be an array');
  assert.ok(Array.isArray(result.patterns.orphans), 'patterns.orphans should be an array');
});

test('simpleEmbed produces equal-length vectors for all nodes (vocabulary bug fix)', async () => {
  const cm = new CodeMycelium();
  await cm.buildNetwork(SAMPLE_DIR);

  const lengths = Array.from(cm.embeddings.values()).map(v => v.length);
  assert.ok(lengths.length > 0, 'Should have at least one embedding');

  const firstLen = lengths[0];
  const allSame = lengths.every(len => len === firstLen);
  assert.ok(
    allSame,
    `All embedding vectors must have equal length for cosine similarity to be valid. Got lengths: ${[...new Set(lengths)].join(', ')}`
  );
});

test('detectPatterns on sample codebase detects at least one hub', async () => {
  const cm = new CodeMycelium();
  await cm.buildNetwork(SAMPLE_DIR);
  const patterns = cm.detectPatterns();
  assert.ok(patterns.hubs.length > 0, 'Sample codebase should have at least one hub node');
});

test('findClusters detects semantic connections between similar constructed nodes', () => {
  // Unit test: verify the algorithm works with controlled inputs,
  // independent of sample-data thresholds or vocabulary ordering.
  const cm = new CodeMycelium();

  const nodeA = { id: 'a.js::fetchPosts', type: 'function', name: 'fetchPosts', location: 'a.js', line: 1, code: 'async function fetchPosts(query) {}', imports: [], calls: [] };
  const nodeB = { id: 'b.js::fetchUsers', type: 'function', name: 'fetchUsers', location: 'b.js', line: 1, code: 'async function fetchUsers(query) {}', imports: [], calls: [] };
  cm.addNode(nodeA);
  cm.addNode(nodeB);

  // Wire up a known semantic connection directly (bypassing embedding)
  cm.addConnection(nodeA.id, nodeB.id, 'semantic', 0.85);

  const clusters = cm.findClusters();
  assert.ok(clusters.length > 0, 'findClusters should detect at least one cluster for connected cross-file nodes');
  assert.ok(
    clusters.some(c => c.group.includes('a.js') && c.group.includes('b.js')),
    'Cluster should reference both files'
  );
});

test('findOrphans detects nodes with no connections', () => {
  // Unit test: verify the algorithm works with controlled inputs.
  const cm = new CodeMycelium();

  const connected = { id: 'a.js::active', type: 'function', name: 'active', location: 'a.js', line: 1, code: '', imports: [], calls: [] };
  const partner  = { id: 'b.js::partner', type: 'function', name: 'partner', location: 'b.js', line: 1, code: '', imports: [], calls: [] };
  const orphan   = { id: 'c.js::lonely', type: 'function', name: 'lonely', location: 'c.js', line: 1, code: '', imports: [], calls: [] };

  cm.addNode(connected);
  cm.addNode(partner);
  cm.addNode(orphan);
  cm.addConnection(connected.id, partner.id, 'semantic', 0.9);

  const orphans = cm.findOrphans();
  assert.strictEqual(orphans.length, 1, 'Should detect exactly one orphan');
  assert.strictEqual(orphans[0].name, 'lonely', 'Orphan should be the unconnected node');
});

test('addNode stores node and is retrievable', () => {
  const cm = new CodeMycelium();
  const node = { id: 'test.js::myFn', type: 'function', name: 'myFn', location: 'test.js', line: 1, code: 'function myFn() {}', imports: [], calls: [] };
  cm.addNode(node);
  assert.strictEqual(cm.nodes.size, 1);
  assert.deepStrictEqual(cm.nodes.get('test.js::myFn'), node);
});

test('addConnection creates a bidirectional key', () => {
  const cm = new CodeMycelium();
  cm.addConnection('a.js::foo', 'b.js::bar', 'semantic', 0.85);
  assert.strictEqual(cm.connections.size, 1);
  // Calling again with reversed order should NOT create a duplicate
  cm.addConnection('b.js::bar', 'a.js::foo', 'semantic', 0.85);
  assert.strictEqual(cm.connections.size, 1, 'Reversed connection should not add a duplicate entry');
});

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

console.log('\n🍄 Code Mycelium — Test Suite\n');
run();
