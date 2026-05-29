'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Compute SHA-256 hash of content.
 * @param {string} content
 * @returns {string} hex digest
 */
function computeHash(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

/**
 * Read a file and return its content, or null if it doesn't exist.
 */
function readFile(filePath) {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) return null;
  return fs.readFileSync(resolved, 'utf8');
}

/**
 * Write content to a file, creating directories if needed.
 */
function writeFile(filePath, content) {
  const resolved = path.resolve(filePath);
  const dir = path.dirname(resolved);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(resolved, content, 'utf8');
}

/**
 * Find oldString in fileContent and return the match info.
 * Returns { found: true, start, end, matchedText } or { found: false }.
 */
function findMatch(fileContent, oldString) {
  const idx = fileContent.indexOf(oldString);
  if (idx === -1) {
    return { found: false };
  }
  // Compute line of the match (1-indexed)
  const before = fileContent.slice(0, idx);
  const line = before.split('\n').length;
  return {
    found: true,
    start: idx,
    end: idx + oldString.length,
    matchedText: oldString,
    line,
  };
}

/**
 * Hash-anchored edit: replace oldString with newString in a file.
 *
 * @param {string} filePath - path to the file
 * @param {string} oldString - text to find (must exist exactly once)
 * @param {string} newString - replacement text
 * @param {object} [opts]
 * @param {boolean} [opts.dryRun=false] - if true, don't write the file
 * @returns {{ success: boolean, anchor: object, message: string, preview?: string }}
 */
function anchorEdit(filePath, oldString, newString, opts = {}) {
  const { dryRun = false } = opts;
  const resolved = path.resolve(filePath);
  const content = readFile(resolved);

  if (content === null) {
    return {
      success: false,
      anchor: null,
      message: `File not found: ${resolved}`,
    };
  }

  const match = findMatch(content, oldString);
  if (!match.found) {
    return {
      success: false,
      anchor: null,
      message: `oldString not found in ${path.basename(filePath)}`,
    };
  }

  // Check for multiple occurrences
  const firstIdx = content.indexOf(oldString);
  const secondIdx = content.indexOf(oldString, firstIdx + 1);
  if (secondIdx !== -1) {
    return {
      success: false,
      anchor: null,
      message: `oldString appears multiple times in ${path.basename(filePath)}. Provide more context to make it unique.`,
    };
  }

  // Compute pre-edit hash of the matched content
  const preHash = computeHash(match.matchedText);

  // Build anchor
  const anchor = {
    file: resolved,
    line: match.line,
    contentHash: preHash,
    expected: oldString,
  };

  // Apply edit
  const newContent = content.slice(0, match.start) + newString + content.slice(match.end);

  // Verify post-edit: the replaced region should differ
  const replacedRegion = newContent.slice(match.start, match.start + newString.length);
  const postHash = computeHash(replacedRegion);

  if (postHash === preHash) {
    return {
      success: false,
      anchor,
      message: 'Edit produced identical content — oldString equals newString.',
    };
  }

  if (!dryRun) {
    writeFile(resolved, newContent);
  }

  return {
    success: true,
    anchor,
    message: dryRun
      ? `Dry run: would replace at line ${match.line}`
      : `Replaced at line ${match.line}`,
    preview: dryRun ? newContent : undefined,
  };
}

/**
 * Verify that a list of anchors still match their expected content.
 *
 * @param {string} filePath
 * @param {Array<{line: number, contentHash: string, expected: string}>} anchors
 * @returns {{ valid: boolean, results: Array<{anchor: object, valid: boolean, reason?: string}> }}
 */
function verifyAnchors(filePath, anchors) {
  const resolved = path.resolve(filePath);
  const content = readFile(resolved);

  if (content === null) {
    return {
      valid: false,
      results: anchors.map((a) => ({
        anchor: a,
        valid: false,
        reason: 'File not found',
      })),
    };
  }

  const lines = content.split('\n');
  const results = anchors.map((anchor) => {
    const lineIdx = anchor.line - 1;
    if (lineIdx < 0 || lineIdx >= lines.length) {
      return {
        anchor,
        valid: false,
        reason: `Line ${anchor.line} out of range (file has ${lines.length} lines)`,
      };
    }

    const lineContent = lines[lineIdx];
    const actualHash = computeHash(lineContent);

    if (actualHash !== anchor.contentHash) {
      return {
        anchor,
        valid: false,
        reason: `Hash mismatch at line ${anchor.line}: expected ${anchor.contentHash.slice(0, 12)}..., got ${actualHash.slice(0, 12)}...`,
      };
    }

    return { anchor, valid: true };
  });

  return {
    valid: results.every((r) => r.valid),
    results,
  };
}

module.exports = {
  computeHash,
  anchorEdit,
  verifyAnchors,
  findMatch,
  readFile,
  writeFile,
};
