'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const HARNESSES = {
  'claude-code': {
    name: 'Claude Code',
    detectDir: () => path.join(os.homedir(), '.claude'),
    settingsFile: 'settings.json',
    hooksKey: 'hooks',
    installDir: () => path.join(os.homedir(), '.claude'),
  },
  opencode: {
    name: 'OpenCode',
    detectDir: () => path.join(os.homedir(), '.opencode'),
    settingsFile: 'config.json',
    hooksKey: 'hooks',
    installDir: () => path.join(os.homedir(), '.opencode'),
  },
  codex: {
    name: 'Codex',
    detectDir: () => path.join(os.homedir(), '.codex'),
    settingsFile: 'config.json',
    hooksKey: 'hooks',
    installDir: () => path.join(os.homedir(), '.codex'),
  },
  cursor: {
    name: 'Cursor',
    detectDir: () => path.join(process.cwd(), '.cursor'),
    settingsFile: 'settings.json',
    hooksKey: 'hooks',
    installDir: () => path.join(process.cwd(), '.cursor'),
  },
  'gemini-cli': {
    name: 'Gemini CLI',
    detectDir: () => path.join(os.homedir(), '.gemini'),
    settingsFile: 'settings.json',
    hooksKey: 'extensions',
    installDir: () => path.join(os.homedir(), '.gemini'),
  },
  'pi-dev': {
    name: 'Pi.dev',
    detectDir: () => path.join(os.homedir(), '.pi'),
    settingsFile: 'settings.json',
    hooksKey: 'hooks',
    installDir: () => path.join(os.homedir(), '.pi/agent'),
  },
  omp: {
    name: 'OMP',
    detectDir: () => path.join(process.cwd(), '.omp'),
    settingsFile: 'settings.json',
    hooksKey: 'hooks',
    installDir: () => path.join(process.cwd(), '.omp'),
  },
};

/**
 * Detect which harnesses are installed.
 * Returns an array of detected harness names.
 */
function detectHarnesses() {
  const detected = [];
  for (const [key, config] of Object.entries(HARNESSES)) {
    const dir = config.detectDir();
    if (fs.existsSync(dir)) {
      detected.push(key);
    }
  }
  return detected;
}

/**
 * Detect the primary harness (first detected).
 * @returns {string|null}
 */
function detectHarness() {
  const detected = detectHarnesses();
  return detected.length > 0 ? detected[0] : null;
}

/**
 * Read the settings file for a harness.
 */
function readSettings(harnessName) {
  const config = HARNESSES[harnessName];
  if (!config) return null;

  const dir = config.installDir();
  const filePath = path.join(dir, config.settingsFile);

  if (!fs.existsSync(filePath)) return {};

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return {};
  }
}

/**
 * Write settings file for a harness.
 */
function writeSettings(harnessName, settings) {
  const config = HARNESSES[harnessName];
  if (!config) return false;

  const dir = config.installDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(dir, config.settingsFile);
  fs.writeFileSync(filePath, JSON.stringify(settings, null, 2) + '\n', 'utf8');
  return true;
}

/**
 * Get the omg-ai marker file path for a harness.
 */
function markerPath(harnessName) {
  const config = HARNESSES[harnessName];
  if (!config) return null;
  return path.join(config.installDir(), '.omg-ai-installed');
}

/**
 * Install omg-ai hooks into a harness.
 *
 * @param {string} harnessName
 * @returns {{ success: boolean, message: string }}
 */
function installFor(harnessName) {
  const config = HARNESSES[harnessName];
  if (!config) {
    return { success: false, message: `Unknown harness: ${harnessName}` };
  }

  const dir = config.installDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const settings = readSettings(harnessName);

  // Inject omg-ai hooks
  if (!settings[config.hooksKey]) {
    settings[config.hooksKey] = {};
  }

  const omgHooks = {
    'omg-ai-edit': {
      command: 'node',
      args: ['-e', `require('${path.join(__dirname, 'edit-tool.js')}')`],
      description: 'Hash-anchored edit tool for safe file modifications',
    },
  };

  // Merge omg-ai hooks (don't overwrite existing)
  const hooks = settings[config.hooksKey];
  for (const [key, value] of Object.entries(omgHooks)) {
    if (!hooks[key]) {
      hooks[key] = value;
    }
  }

  // Add omg-ai metadata
  settings['omg-ai'] = {
    version: require('../package.json').version,
    installedAt: new Date().toISOString(),
    harness: harnessName,
  };

  writeSettings(harnessName, settings);

  // Write marker file
  const marker = markerPath(harnessName);
  fs.writeFileSync(marker, JSON.stringify({
    harness: harnessName,
    installedAt: new Date().toISOString(),
    version: require('../package.json').version,
  }, null, 2) + '\n', 'utf8');

  return {
    success: true,
    message: `Installed omg-ai hooks for ${config.name}`,
  };
}

/**
 * Uninstall omg-ai from a harness.
 *
 * @param {string} harnessName
 * @returns {{ success: boolean, message: string }}
 */
function uninstall(harnessName) {
  const config = HARNESSES[harnessName];
  if (!config) {
    return { success: false, message: `Unknown harness: ${harnessName}` };
  }

  const settings = readSettings(harnessName);

  // Remove omg-ai hooks
  if (settings[config.hooksKey]) {
    const hooks = settings[config.hooksKey];
    for (const key of Object.keys(hooks)) {
      if (key.startsWith('omg-ai')) {
        delete hooks[key];
      }
    }
  }

  // Remove omg-ai metadata
  delete settings['omg-ai'];

  writeSettings(harnessName, settings);

  // Remove marker file
  const marker = markerPath(harnessName);
  if (marker && fs.existsSync(marker)) {
    fs.unlinkSync(marker);
  }

  return {
    success: true,
    message: `Uninstalled omg-ai from ${config.name}`,
  };
}

/**
 * List installed omg-ai integrations.
 *
 * @returns {Array<{harness: string, name: string, installedAt: string, version: string}>}
 */
function listInstalled() {
  const installed = [];

  for (const [key, config] of Object.entries(HARNESSES)) {
    const marker = markerPath(key);
    if (marker && fs.existsSync(marker)) {
      try {
        const data = JSON.parse(fs.readFileSync(marker, 'utf8'));
        installed.push({
          harness: key,
          name: config.name,
          installedAt: data.installedAt,
          version: data.version,
        });
      } catch {
        installed.push({
          harness: key,
          name: config.name,
          installedAt: 'unknown',
          version: 'unknown',
        });
      }
    }
  }

  return installed;
}

module.exports = {
  HARNESSES,
  detectHarnesses,
  detectHarness,
  readSettings,
  installFor,
  uninstall,
  listInstalled,
};
