// auto-runner.cjs
const { execSync } = require('child_process');

const command = process.argv[2];

if (!command) {
  console.error('❌ No command provided to auto-runner.');
  process.exit(1);
}

console.log(`📡 Running command: ${command}`);

try {
  switch (command.trim().toLowerCase()) {
    case 'activate options radar':
      console.log('📈 Activating Options Volume Radar...');
      execSync('node optionsRadar.cjs', { stdio: 'inherit' });
      break;
    // Add more cases as you build more modules
    default:
      console.log(`❌ Unknown command: "${command}"`);
      process.exit(1);
  }

  // Skip commit if no changes
  const status = execSync('git status --porcelain').toString().trim();
  if (status) {
    execSync('git add . && git commit -m "🤖 GPT Auto: ' + command + '"', { stdio: 'inherit' });
  } else {
    console.log('⚠️ Git commit skipped: No changes detected.');
  }

} catch (err) {
  console.error(`❌ Execution failed: ${err.message}`);
  process.exit(1);
}
