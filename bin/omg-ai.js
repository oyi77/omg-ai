#!/usr/bin/env node

'use strict';

const path = require('path');
const editTool = require('../src/edit-tool');
const skillMerger = require('../src/skill-merger');
const harnessAdapter = require('../src/harness-adapter');

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(msg, color = 'reset') {
  console.log(`${COLORS[color] || ''}${msg}${COLORS.reset}`);
}

function usage() {
  log('');
  log('OMG-AI: Hash-anchored edits + skill merging + multi-harness', 'cyan');
  log('');
  log('Commands:', 'bright');
  log('  edit <file> <old> <new>    Hash-anchored edit');
  log('  edit --dry-run <f> <o> <n> Preview edit without writing');
  log('  verify <file> <hash>       Verify anchor hash');
  log('  skills merge [paths...]     Merge skill sources');
  log('  skills list [paths...]      List available skills');
  log('  install [harness]           Install for detected/specified harness');
  log('  uninstall [harness]         Remove hooks');
  log('  status                      Show installed harnesses and skill count');
  log('');
  log('Examples:', 'dim');
  log('  omg-ai edit src/app.js "old code" "new code"');
  log('  omg-ai verify src/app.js');
  log('  omg-ai skills merge /path/to/skills-a /path/to/skills-b');
  log('  omg-ai install claude-code');
  log('  omg-ai status');
  log('');
}

function cmdEdit(args) {
  let dryRun = false;
  const filtered = [];
  for (const arg of args) {
    if (arg === '--dry-run') {
      dryRun = true;
    } else {
      filtered.push(arg);
    }
  }

  if (filtered.length < 3) {
    log('Usage: omg-ai edit [--dry-run] <file> <oldString> <newString>', 'red');
    process.exit(1);
  }

  const [file, oldStr, newStr] = filtered;
  const result = editTool.anchorEdit(file, oldStr, newStr, { dryRun });

  if (result.success) {
    log(result.message, 'green');
    log(`  Hash: ${result.anchor.contentHash.slice(0, 16)}...`, 'dim');
    log(`  Line: ${result.anchor.line}`, 'dim');
  } else {
    log(`Error: ${result.message}`, 'red');
    process.exit(1);
  }
}

function cmdVerify(args) {
  if (args.length < 1) {
    log('Usage: omg-ai verify <file>', 'red');
    process.exit(1);
  }

  const filePath = args[0];
  const content = editTool.readFile(filePath);

  if (content === null) {
    log(`Error: File not found: ${filePath}`, 'red');
    process.exit(1);
  }

  // Verify the whole file: compute and display hash
  const hash = editTool.computeHash(content);
  log(`File: ${filePath}`, 'cyan');
  log(`SHA-256: ${hash}`, 'green');
  log(`Size: ${content.length} bytes`, 'dim');
  log(`Lines: ${content.split('\n').length}`, 'dim');
}

function cmdSkills(args) {
  const sub = args[0] || 'list';
  const paths = args.slice(1);

  // Default skill source paths
  const defaultPaths = [
    path.resolve(__dirname, '..', '..', '1ai-skills'),
  ];

  const sourcePaths = paths.length > 0 ? paths : defaultPaths.filter(p => {
    try { return require('fs').existsSync(p); } catch { return false; }
  });

  if (sourcePaths.length === 0) {
    log('No skill sources found. Provide paths: omg-ai skills list /path/to/skills', 'yellow');
    log('Or ensure 1ai-skills is at: ' + defaultPaths[0], 'dim');
    return;
  }

  const merged = skillMerger.mergeSkills(sourcePaths);

  if (sub === 'merge') {
    log(`Skill merge complete:`, 'green');
    log(`  Total scanned: ${merged.stats.totalScanned}`, 'dim');
    log(`  Unique: ${merged.stats.unique}`, 'dim');
    log(`  Duplicates removed: ${merged.stats.duplicatesRemoved}`, 'dim');
    for (const src of merged.stats.sources) {
      log(`  Source: ${src.path} (${src.count} skills)`, 'dim');
    }

    // Generate and save catalog
    const catalog = skillMerger.generateCatalog(merged.skills);
    const catalogPath = path.resolve(__dirname, '..', 'skill-catalog.json');
    require('fs').writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + '\n', 'utf8');
    log(`Catalog written to: ${catalogPath}`, 'blue');
  } else {
    // list
    log(`Skills found: ${merged.stats.unique}`, 'cyan');
    log('');
    for (const [cat, skills] of Object.entries(skillMerger.generateCatalog(merged.skills).categories)) {
      log(`[${cat}]`, 'yellow');
      for (const s of skills) {
        log(`  ${s.name}: ${s.description || '(no description)'}`, 'dim');
      }
    }
  }
}

function cmdInstall(args) {
  const harness = args[0] || harnessAdapter.detectHarness();

  if (!harness) {
    log('Could not detect a harness. Specify one:', 'yellow');
    log('  omg-ai install claude-code|opencode|codex|cursor|gemini-cli', 'dim');
    process.exit(1);
  }

  const result = harnessAdapter.installFor(harness);
  if (result.success) {
    log(result.message, 'green');
  } else {
    log(result.message, 'red');
    process.exit(1);
  }
}

function cmdUninstall(args) {
  const harness = args[0] || harnessAdapter.detectHarness();

  if (!harness) {
    log('Could not detect a harness. Specify one:', 'yellow');
    log('  omg-ai uninstall claude-code|opencode|codex|cursor|gemini-cli', 'dim');
    process.exit(1);
  }

  const result = harnessAdapter.uninstall(harness);
  if (result.success) {
    log(result.message, 'green');
  } else {
    log(result.message, 'red');
    process.exit(1);
  }
}

function cmdStatus() {
  log('OMG-AI Status', 'cyan');
  log('');

  // Detected harnesses
  const detected = harnessAdapter.detectHarnesses();
  log(`Detected harnesses: ${detected.length > 0 ? detected.join(', ') : 'none'}`, 'dim');

  // Installed integrations
  const installed = harnessAdapter.listInstalled();
  if (installed.length > 0) {
    log('Installed for:', 'green');
    for (const inst of installed) {
      log(`  ${inst.name} (v${inst.version}, installed ${inst.installedAt})`, 'dim');
    }
  } else {
    log('No harness integrations installed.', 'yellow');
  }

  log('');

  // Skill count from default path
  const skillPath = path.resolve(__dirname, '..', '..', '1ai-skills');
  const fs = require('fs');
  if (fs.existsSync(skillPath)) {
    const merged = skillMerger.mergeSkills([skillPath]);
    log(`Skills available: ${merged.stats.unique}`, 'green');
  } else {
    log('Skills: 1ai-skills not found at expected path', 'yellow');
  }

  log('');
  log('Core features:', 'bright');
  log('  Hash-anchored edits: YES', 'green');
  log('  Skill merging: YES', 'green');
  log('  Multi-harness: YES', 'green');
  log('  Version: ' + require('../package.json').version, 'dim');
  log('');
}

// Main
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'edit':
    cmdEdit(args.slice(1));
    break;
  case 'verify':
    cmdVerify(args.slice(1));
    break;
  case 'skills':
    cmdSkills(args.slice(1));
    break;
  case 'install':
    cmdInstall(args.slice(1));
    break;
  case 'uninstall':
    cmdUninstall(args.slice(1));
    break;
  case 'status':
    cmdStatus();
    break;
  case '--help':
  case '-h':
  case 'help':
    usage();
    break;
  default:
    if (command) {
      log(`Unknown command: ${command}`, 'red');
    }
    usage();
    process.exit(command ? 1 : 0);
}
