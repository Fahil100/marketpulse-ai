#!/usr/bin/env node

const { execSync } = require('child_process');

const input = process.argv.slice(2).join(' ').trim();
if (!input) {
  console.error('❌ No command provided to auto-runner.');
  process.exit(1);
}

console.log(`📡 Running command: ${input}`);

try {
  switch (input.toLowerCase()) {
    case 'install institutional flow radar':
      console.log('📡 Installing Institutional Flow Radar...');
      execSync('git add .', { stdio: 'inherit' });
      execSync('git commit -m "🤖 GPT Auto: install institutional flow radar"', { stdio: 'inherit' });
      break;

    case 'inject sentiment analysis engine':
      console.log('🧠 Injecting Sentiment Analysis Engine...');
      execSync('git add .', { stdio: 'inherit' });
      execSync('git commit -m "🤖 GPT Auto: inject sentiment analysis engine"', { stdio: 'inherit' });
      break;

    case 'add chart screenshot generator':
      console.log('📸 Adding Chart Screenshot Generator...');
      execSync('git add .', { stdio: 'inherit' });
      execSync('git commit -m "🤖 GPT Auto: add chart screenshot generator"', { stdio: 'inherit' });
      break;

    case 'enable liquidity scanner':
      console.log('💧 Enabling Liquidity Scanner...');
      execSync('git add .', { stdio: 'inherit' });
      execSync('git commit -m "🤖 GPT Auto: enable liquidity scanner"', { stdio: 'inherit' });
      break;

    case 'activate short interest monitor':
      console.log('📉 Activating Short Interest Monitor...');
      execSync('git add .', { stdio: 'inherit' });
      execSync('git commit -m "🤖 GPT Auto: activate short interest monitor"', { stdio: 'inherit' });
      break;

    case 'add whale tracker':
      console.log('🐋 Adding Whale Tracker...');
      execSync('git add .', { stdio: 'inherit' });
      execSync('git commit -m "🤖 GPT Auto: add whale tracker"', { stdio: 'inherit' });
      break;

    case 'deploy now':
      console.log('🚀 Deploying to Render...');
      execSync('git push origin main', { stdio: 'inherit' });
      break;

    default:
      console.log(`❌ Unknown command: "${input}"`);
      process.exit(1);
  }
} catch (err) {
  console.error(`❌ Execution failed: ${err.message}`);
  process.exit(1);
}
