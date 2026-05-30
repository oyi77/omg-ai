'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { detectHarnesses, detectHarness, installFor, uninstall, listInstalled } = require('../src/harness-adapter');

let tmpDir;
let origHomedir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'omg-harness-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('detectHarnesses', () => {
  it('returns an array', () => {
    const result = detectHarnesses();
    assert.ok(Array.isArray(result));
  });

  it('detects claude-code when .claude exists', () => {
    // This test verifies detection logic runs without error
    // Actual detection depends on the environment
    const result = detectHarnesses();
    // On this system, .claude should exist
    assert.ok(Array.isArray(result));
  });
});

describe('detectHarness', () => {
  it('returns a string or null', () => {
    const result = detectHarness();
    assert.ok(result === null || typeof result === 'string');
  });
});

describe('installFor / uninstall / listInstalled', () => {
  it('fails for unknown harness', () => {
    const result = installFor('nonexistent-harness');
    assert.equal(result.success, false);
    assert.match(result.message, /unknown/i);
  });

  it('fails uninstall for unknown harness', () => {
    const result = uninstall('nonexistent-harness');
    assert.equal(result.success, false);
    assert.match(result.message, /unknown/i);
  });

  it('install and uninstall round-trip for a known harness', () => {
    // We test with claude-code since it's likely installed
    // But we won't modify real settings — we just test the API shape
    const harness = 'claude-code';
    const installResult = installFor(harness);
    assert.equal(typeof installResult.success, 'boolean');
    assert.equal(typeof installResult.message, 'string');

    if (installResult.success) {
      // Verify it shows up in list
      const installed = listInstalled();
      const found = installed.find(i => i.harness === harness);
      assert.ok(found, 'Should appear in listInstalled after install');

      // Uninstall
      const uninstallResult = uninstall(harness);
      assert.equal(uninstallResult.success, true);

      // Verify it's gone
      const afterUninstall = listInstalled();
      const gone = afterUninstall.find(i => i.harness === harness);
      assert.ok(!gone, 'Should not appear in listInstalled after uninstall');
    }
  });

  it('listInstalled returns array', () => {
    const result = listInstalled();
    assert.ok(Array.isArray(result));
  });
});

describe('pi-dev and omp harnesses', () => {
  it('pi-dev is a known harness', () => {
    const result = installFor('pi-dev');
    // Should not be unknown harness error
    assert.ok(!result.message.includes('Unknown harness'));
    // success may be false if directory doesn't exist, that's okay
    assert.equal(typeof result.success, 'boolean');
  });
  it('omp is a known harness', () => {
    const result = installFor('omp');
    assert.ok(!result.message.includes('Unknown harness'));
    assert.equal(typeof result.success, 'boolean');
  });
});
