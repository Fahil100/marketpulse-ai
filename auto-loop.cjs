#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🟢 Level 2: Real-time command loop active.');

const COMMAND_FILE = 'commands-feed.txt';
let commandQueue = [];

function loadCommands() {
  try {
    const content = fs.readFileSync(COMMAND_FILE, 'utf-8').trim();
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    return lines;
  } catch (e) {
    console.error(`❌ Cannot read ${COMMAND_FILE}: ${e.message}`);
    return [];
  }
}

// Loop every 5 seconds
setInterval(() => {
  if (commandQueue.length === 0) {
    commandQueue = loadCommands();
  }

  if (commandQueue.length > 0) {
    const command = commandQueue.shift();
    console.log(`📤 Executing: "${command}"`);
    try {
      execSync(`node auto-runner.cjs "${command}"`, { stdio: 'inherit' });
    } catch (err) {
      console.error(`❌ Level 2 Loop Error: ${err.message}`);
    }
  }
}, 5000);