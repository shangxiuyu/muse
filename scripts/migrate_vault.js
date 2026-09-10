#!/usr/bin/env node

/**
 * Muse Vault Schema Migration Engine
 * Zero dependencies. Runs on native Node.js.
 * Ensures seamless, non-destructive migration of user personal taste assets across schema versions.
 */

const fs = require('fs');
const path = require('path');

const TARGET_VERSION = "1.1.0";

const MIGRATIONS = [
  {
    from: "1.0.0",
    to: "1.1.0",
    description: "Add interaction_and_motion guidelines and formal rejected_cases schema",
    migrate: (content) => {
      let updated = content;

      // Update version string
      updated = updated.replace(/version:\s*"1\.0\.0"/, `version: "${TARGET_VERSION}"`);

      // Ensure interaction_and_motion exists
      if (!updated.includes("interaction_and_motion:")) {
        const motionSnippet = `
interaction_and_motion:
  motion_first_citizen: "动效是一等公民而非次级修饰。UI 宏观构建必须首发全量交付进场错落时序 (stagger reveal)、动态时序推演与弹簧微物理反馈，严禁交出死寂的静态页面。"
`;
        // Insert after palette_and_materials block
        if (updated.includes("contrast_style:")) {
          updated = updated.replace(
            /(contrast_style:.*?\n)/,
            `$1${motionSnippet}`
          );
        } else {
          updated += motionSnippet;
        }
      }

      // Ensure rejected_cases exists as array
      if (!updated.includes("rejected_cases:")) {
        updated += `
# 被毙案例档案：逼近用户判断函数的核心数据（捕获协议 §5.2 维护）
rejected_cases: []
`;
      }

      return updated;
    }
  }
];

function run() {
  const vaultDir = process.argv[2] || path.join(__dirname, '..', 'vault');
  const dnaPath = path.join(vaultDir, 'personal_dna.yaml');

  console.log(`\n🏛️  Muse Vault Schema Migration Manager`);
  console.log(`Scanning: ${path.resolve(dnaPath)}\n`);

  if (!fs.existsSync(dnaPath)) {
    console.log(`✖ Cannot find personal_dna.yaml in ${vaultDir}`);
    process.exit(1);
  }

  const content = fs.readFileSync(dnaPath, 'utf8');
  const versionMatch = content.match(/version:\s*"([^"]+)"/);
  const currentVersion = versionMatch ? versionMatch[1] : "1.0.0";

  console.log(`Current Vault Schema Version : v${currentVersion}`);
  console.log(`Target Schema Version        : v${TARGET_VERSION}`);

  if (currentVersion === TARGET_VERSION) {
    console.log(`✓ Vault schema is already up to date!\n`);
    process.exit(0);
  }

  // Find applicable migrations
  let migratingContent = content;
  let appliedCount = 0;

  MIGRATIONS.forEach(m => {
    if (m.from === currentVersion) {
      console.log(`Applying migration [${m.from} ➔ ${m.to}]: ${m.description}`);
      migratingContent = m.migrate(migratingContent);
      appliedCount++;
    }
  });

  if (appliedCount === 0) {
    console.log(`▲ No migration path found from v${currentVersion} to v${TARGET_VERSION}. Manual upgrade may be needed.\n`);
    process.exit(0);
  }

  // Create backup
  const backupPath = `${dnaPath}.bak-${Date.now()}`;
  fs.writeFileSync(backupPath, content, 'utf8');
  console.log(`✓ Created safe backup at: ${path.basename(backupPath)}`);

  // Write migrated file
  fs.writeFileSync(dnaPath, migratingContent, 'utf8');
  console.log(`✓ Successfully migrated personal_dna.yaml to v${TARGET_VERSION}!\n`);
}

run();
