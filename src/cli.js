#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { CodeMycelium } from './index.js';
import path from 'path';

const program = new Command();

program
  .name('mycelium')
  .description('🍄 Code Mycelium - Reveal hidden connections in your codebase')
  .version('0.1.0');

program
  .command('analyze <directory>')
  .description('Analyze a codebase and reveal its mycelial network')
  .option('-o, --output <file>', 'Save graph data to JSON file')
  .action(async (directory, options) => {
    try {
      const targetDir = path.resolve(directory);
      
      console.log(chalk.magenta.bold('\n🍄 Code Mycelium'));
      console.log(chalk.gray(`Analyzing: ${targetDir}\n`));
      
      const mycelium = new CodeMycelium();
      const stats = await mycelium.buildNetwork(targetDir);
      
      console.log(chalk.green(`✓ Network built successfully\n`));
      
      // Visualize
      mycelium.visualize();
      
      // Optionally save to JSON
      if (options.output) {
        const graphData = {
          nodes: Array.from(mycelium.nodes.values()),
          connections: Array.from(mycelium.connections.entries()).map(([key, conns]) => {
            const [nodeA, nodeB] = JSON.parse(key);
            return { nodeA, nodeB, connections: conns };
          })
        };
        
        const fs = await import('fs');
        fs.writeFileSync(options.output, JSON.stringify(graphData, null, 2));
        console.log(chalk.cyan(`💾 Graph data saved to ${options.output}\n`));
      }
      
    } catch (err) {
      console.error(chalk.red(`\n❌ Error: ${err.message}\n`));
      process.exit(1);
    }
  });

program
  .command('demo')
  .description('Run demo on example codebase')
  .action(async () => {
    const exampleDir = path.join(path.dirname(new URL(import.meta.url).pathname), '../examples/sample-codebase');
    console.log(chalk.yellow('Running demo on sample codebase...\n'));
    program.parse(['node', 'mycelium', 'analyze', exampleDir]);
  });

program.parse();
