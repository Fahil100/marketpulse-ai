// auto-loop.cjs
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'config.json');
let lastCommand = '';

console.log('🟢 Level 2: Real-time command loop active.');

setInterval(() => {
  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (err) {
    console.error('❌ Failed to read config.json:', err.message);
    return;
  }

  if (!config || !config.toggles || !config.toggles.optionsRadar) {
    console.log('⚠️ OptionsRadar is toggled off or config invalid.');
    return;
  }

  const command = 'activate options radar';

  if (command === lastCommand) return;

  lastCommand = command;

  console.log(`📤 Executing: "${command}"`);

  try {
    execSync(`node auto-runner.cjs "${command}"`, { stdio: 'inherit' });
  } catch (err) {
    console.error(`❌ Level 2 Loop Error: ${err.message}`);
  }

  lastCommand = '';
}, 30 * 1000); // 30 seconds default; will dynamically adjust later
