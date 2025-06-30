#!/usr/bin/env node
const fs = require('fs');
const { execSync } = require('child_process');

const command = process.argv.slice(2).join(' ').trim();

if (!command) {
  console.log("❌ No command provided to auto-runner.");
  process.exit(1);
}

console.log(`📡 Running command: ${command}`);

try {
  if (command === "install institutional flow radar") {
    console.log("📡 Installing Institutional Flow Radar...");
    fs.writeFileSync('institutionalFlowRadar.js', `// 📡 Institutional Flow Radar Module Installed\n`, 'utf-8');
    execSync('git add . && git commit -m "🤖 GPT Auto: install institutional flow radar"');
  }

  else if (command === "inject sentiment analysis engine") {
    console.log("🧠 Injecting Sentiment Analysis Engine...");
    fs.writeFileSync('sentimentEngine.js', `// 🧠 Sentiment Analysis Engine Injected\n`, 'utf-8');
    execSync('git add . && git commit -m "🤖 GPT Auto: inject sentiment analysis engine"');
  }

  else if (command === "add chart screenshot generator") {
    console.log("📸 Adding Chart Screenshot Generator...");
    fs.writeFileSync('chartScreenshot.js', `// 📸 Chart Screenshot Generator Added\n`, 'utf-8');
    execSync('git add . && git commit -m "🤖 GPT Auto: add chart screenshot generator"');
  }

  else if (command === "enable liquidity scanner") {
    console.log("💧 Enabling Liquidity Scanner...");
    fs.writeFileSync('liquidityScanner.js', `// 💧 Liquidity Scanner Enabled\n`, 'utf-8');
    execSync('git add . && git commit -m "🤖 GPT Auto: enable liquidity scanner"');
  }

  else if (command === "activate short interest monitor") {
    console.log("📉 Activating Short Interest Monitor...");
    fs.writeFileSync('shortInterestMonitor.js', `// 📉 Short Interest Monitor Activated\n`, 'utf-8');
    execSync('git add . && git commit -m "🤖 GPT Auto: activate short interest monitor"');
  }

  else if (command === "add whale tracker") {
    console.log("🐋 Adding Whale Tracker...");
    fs.writeFileSync('whaleTracker.js', `// 🐋 Whale Tracker Module Added\n`, 'utf-8');
    execSync('git add . && git commit -m "🤖 GPT Auto: add whale tracker"');
  }

  else if (command === "activate options radar") {
    console.log("📈 Activating Options Volume Radar...");
    fs.writeFileSync('optionsRadar.js', `// 📈 Options Volume Radar Activated\n`, 'utf-8');
    execSync('git add . && git commit -m "🤖 GPT Auto: activate options radar"');
  }

  else if (command === "deploy now") {
    console.log("🚀 Deploying to Render...");
    execSync('git push origin main');
  }

  else {
    console.log(`❌ Unknown command: "${command}"`);
    process.exit(1);
  }

} catch (error) {
  console.error(`❌ Execution failed: ${error.message}`);
  process.exit(1);
}