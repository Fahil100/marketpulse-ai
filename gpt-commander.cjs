const fs = require("fs");
const { execSync } = require("child_process");

// === CONFIGURABLE TARGET ===
const targetFile = "index.js"; // File GPT will update
const gptUpdateComment = `// ✅ Auto-update from GPT Commander at ${new Date().toLocaleString()}\n`;

// === STEP 1: Inject Change ===
try {
  let content = fs.readFileSync(targetFile, "utf-8");
  if (content.includes("GPT Commander")) {
    console.log("✅ Already updated. No changes needed.");
  } else {
    const updatedContent = gptUpdateComment + content;
    fs.writeFileSync(targetFile, updatedContent);
    console.log(`✅ File "${targetFile}" updated successfully.`);
  }
} catch (err) {
  console.error(`❌ Error reading or writing to ${targetFile}:`, err);
  process.exit(1);
}

// === STEP 2: Git Auto-Commit & Push ===
try {
  execSync(`git add ${targetFile}`);
  execSync(`git commit -m "🤖 GPT Commander Auto-Update"`);
  execSync(`git push origin main`);
  console.log("🚀 Changes pushed to GitHub. Auto-deploy will follow.");
} catch (err) {
  console.error("❌ Git operation failed:", err.message);
  process.exit(1);
}
