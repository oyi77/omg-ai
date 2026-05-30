'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const CLI = path.resolve(__dirname, '..', 'bin', 'omg-ai.js');

function runCli(args = [], options = {}) {
  try {
    const output = execSync(`node ${CLI} ${args.join(' ')}`, {
      encoding: 'utf8',
      timeout: 10000,
      ...options,
    });
    return { stdout: output, stderr: '', status: 0 };
  } catch (err) {
    return {
      stdout: err.stdout || '',
      stderr: err.stderr || '',
      status: err.status || 1,
    };
  }
}

describe('CLI integration', () => {
  let tmpDir;
  let origHome;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'omg-cli-test-'));
    origHome = process.env.HOME;
    process.env.HOME = tmpDir;
  });

  afterEach(() => {
    process.env.HOME = origHome;
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('shows usage when no args', () => {
    const result = runCli([]);
    assert.equal(result.status, 0);
    assert.ok(result.stdout.includes('OMG-AI'));
    assert.ok(result.stdout.includes('Commands'));
  });

  it('shows version', () => {
    const result = runCli(['version']);
    assert.equal(result.status, 0);
    assert.ok(result.stdout.includes('omg-ai v'));
  });

  it('shows status', () => {
    const result = runCli(['status']);
    assert.equal(result.status, 0);
    assert.ok(result.stdout.includes('OMG-AI Status'));
  });

  it('shows doctor', () => {
    const result = runCli(['doctor']);
    assert.equal(result.status, 0);
    assert.ok(result.stdout.includes('OMG-AI Doctor'));
  });

  it('list-installable harnesses', () => {
    const result = runCli(['list-installable']);
    assert.equal(result.status, 0);
    assert.ok(result.stdout.includes('Installable harnesses'));
  });

  it('fails on unknown command', () => {
    const result = runCli(['nonexistent']);
    assert.equal(result.status, 1);
    assert.ok(result.stdout.includes('Unknown command'));
  });

  it('fails on missing file for edit', () => {
    const result = runCli(['edit', 'nonexistent.js', 'old', 'new']);
    assert.equal(result.status, 1);
  });
});