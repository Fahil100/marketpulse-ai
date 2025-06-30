// auto-runner.cjs
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load config.json
const configPath = path.join(__dirname, 'config.json');
let config;

try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (err) {
  console.error('❌ Failed to read config.json:', err.message);
  process.exit(1);
}

// Grab command from command-line args
const userCommand = process.argv.slice(2).join(' ').trim();

if (!userCommand) {
  console.log('⛔ No command provided.');
  process.exit(0);
}

console.log(`📡 Running command: ${userCommand}`);

// Handle command routing
switch (userCommand.toLowerCase()) {
  case 'activate options radar':
    if (config.toggles.optionsRadar !== true) {
      console.log('⛔ optionsRadar toggle is OFF in config.json');
      process.exit(0);
    }

    console.log('📈 Activating Options Volume Radar...');
    execSync('node optionsRadar.cjs', { stdio: 'inherit' });

    // Auto Git commit
    try {
      execSync('git add . && git commit -m "🤖 GPT Auto: activate options radar"', { stdio: 'inherit' });
    } catch (err) {
      console.warn('⚠️ Git commit skipped:', err.message);
    }
    break;

  default:
    console.log(`❌ Unknown command: "${userCommand}"`);
    process.exit(1);
}
