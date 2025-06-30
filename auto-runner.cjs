const { execSync } = require("child_process");
const fs = require("fs");

const command = process.argv.slice(2).join(" ");

if (!command) {
  console.error("❌ No command provided to auto-runner.");
  process.exit(1);
}

console.log(`📡 Running command: ${command}`);

try {
  if (command === "activate options radar") {
    console.log("📈 Activating Options Volume Radar...");
    require("./optionsRadar.js");
  } else {
    console.log(`❌ Unknown command: "${command}"`);
    process.exit(1);
  }

  try {
    execSync("git add .");
    execSync(`git diff --cached --quiet || git commit -m "🤖 GPT Auto: ${command}"`);
  } catch (commitErr) {
    console.warn("⚠️ Nothing to commit. Skipping Git commit.");
  }

} catch (err) {
  console.error(`❌ Execution failed: ${err.message}`);
  process.exit(1);
}
