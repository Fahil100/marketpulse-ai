// auto-loop.cjs
const fs = require('fs');
const { execSync } = require('child_process');

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

console.log('🟢 Level 2: Real-time command loop active.');

// Extract all enabled toggles that map to valid commands
const queue = Object.entries(config.toggles)
  .filter(([key, value]) => value === true)
  .map(([key]) => {
    return `activate ${key.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`;
  });

// Sanity check
if (queue.length === 0) {
  console.log('⚠️ No features enabled in config.json toggles.');
  process.exit(0);
}

let currentIndex = 0;

const runCommand = () => {
  const cmd = queue[currentIndex];
  console.log(`📤 Executing: "${cmd}"`);

  try {
    execSync(`node auto-runner.cjs "${cmd}"`, { stdio: 'inherit' });
  } catch (err) {
    console.error(`❌ Level 2 Loop Error: ${err.message}`);
  }

  currentIndex = (currentIndex + 1) % queue.length;

  setTimeout(runCommand, config.loopIntervalSeconds * 1000);
};

runCommand();
