'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { computeHash, anchorEdit, verifyAnchors, findMatch } = require('../src/edit-tool');

let tmpDir;
let tmpFile;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'omg-ai-test-'));
  tmpFile = path.join(tmpDir, 'test.js');
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('computeHash', () => {
  it('returns consistent hash for same input', () => {
    const h1 = computeHash('hello world');
    const h2 = computeHash('hello world');
    assert.equal(h1, h2);
  });

  it('returns different hash for different input', () => {
    const h1 = computeHash('hello');
    const h2 = computeHash('world');
    assert.notEqual(h1, h2);
  });

  it('returns 64-char hex string', () => {
    const h = computeHash('test');
    assert.equal(h.length, 64);
    assert.match(h, /^[0-9a-f]{64}$/);
  });

  it('handles empty string', () => {
    const h = computeHash('');
    assert.equal(h.length, 64);
  });
});

describe('findMatch', () => {
  it('finds exact match', () => {
    const result = findMatch('const x = 1;\nconst y = 2;', 'const y = 2');
    assert.equal(result.found, true);
    assert.equal(result.line, 2);
  });

  it('returns found=false when not present', () => {
    const result = findMatch('const x = 1;', 'const y = 2');
    assert.equal(result.found, false);
  });

  it('correctly computes line number', () => {
    const content = 'line1\nline2\nline3\nline4';
    const result = findMatch(content, 'line3');
    assert.equal(result.line, 3);
  });
});

describe('anchorEdit', () => {
  it('replaces text successfully', () => {
    fs.writeFileSync(tmpFile, 'const x = 1;\nconst y = 2;\n', 'utf8');
    const result = anchorEdit(tmpFile, 'const x = 1;', 'const x = 42;');
    assert.equal(result.success, true);
    assert.equal(result.anchor.line, 1);

    const content = fs.readFileSync(tmpFile, 'utf8');
    assert.ok(content.includes('const x = 42;'));
    assert.ok(!content.includes('const x = 1;'));
  });

  it('fails when oldString not found', () => {
    fs.writeFileSync(tmpFile, 'const x = 1;\n', 'utf8');
    const result = anchorEdit(tmpFile, 'does not exist', 'replacement');
    assert.equal(result.success, false);
    assert.match(result.message, /not found/i);
  });

  it('fails when file does not exist', () => {
    const result = anchorEdit('/nonexistent/file.js', 'a', 'b');
    assert.equal(result.success, false);
    assert.match(result.message, /not found/i);
  });

  it('fails when oldString appears multiple times', () => {
    fs.writeFileSync(tmpFile, 'foo\nfoo\nbar\n', 'utf8');
    const result = anchorEdit(tmpFile, 'foo', 'baz');
    assert.equal(result.success, false);
    assert.match(result.message, /multiple times/i);
  });

  it('fails when oldString equals newString', () => {
    fs.writeFileSync(tmpFile, 'const x = 1;\n', 'utf8');
    const result = anchorEdit(tmpFile, 'const x = 1;', 'const x = 1;');
    assert.equal(result.success, false);
    assert.match(result.message, /identical/i);
  });

  it('supports dry-run mode', () => {
    fs.writeFileSync(tmpFile, 'const x = 1;\n', 'utf8');
    const result = anchorEdit(tmpFile, 'const x = 1;', 'const x = 99;', { dryRun: true });
    assert.equal(result.success, true);
    assert.match(result.message, /dry run/i);

    // File should be unchanged
    const content = fs.readFileSync(tmpFile, 'utf8');
    assert.ok(content.includes('const x = 1;'));
    assert.ok(result.preview);
  });

  it('returns anchor with hash', () => {
    fs.writeFileSync(tmpFile, 'hello\nworld\n', 'utf8');
    const result = anchorEdit(tmpFile, 'hello', 'greetings');
    assert.equal(result.success, true);
    assert.equal(typeof result.anchor.contentHash, 'string');
    assert.equal(result.anchor.contentHash.length, 64);
  });
});

describe('verifyAnchors', () => {
  it('validates correct anchors', () => {
    const content = 'line1\nline2\nline3\n';
    fs.writeFileSync(tmpFile, content, 'utf8');

    const hash = computeHash('line2');
    const result = verifyAnchors(tmpFile, [{ line: 2, contentHash: hash }]);
    assert.equal(result.valid, true);
    assert.equal(result.results[0].valid, true);
  });

  it('detects hash mismatch', () => {
    const content = 'line1\nline2\nline3\n';
    fs.writeFileSync(tmpFile, content, 'utf8');

    const result = verifyAnchors(tmpFile, [{
      line: 2,
      contentHash: '0000000000000000000000000000000000000000000000000000000000000000',
    }]);
    assert.equal(result.valid, false);
    assert.equal(result.results[0].valid, false);
    assert.match(result.results[0].reason, /mismatch/i);
  });

  it('detects out-of-range line', () => {
    fs.writeFileSync(tmpFile, 'only one line\n', 'utf8');

    const hash = computeHash('only one line');
    const result = verifyAnchors(tmpFile, [{ line: 5, contentHash: hash }]);
    assert.equal(result.valid, false);
    assert.match(result.results[0].reason, /out of range/i);
  });

  it('handles missing file', () => {
    const result = verifyAnchors('/nonexistent/file.js', [{ line: 1, contentHash: 'abc' }]);
    assert.equal(result.valid, false);
    assert.match(result.results[0].reason, /not found/i);
  });
});
