#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

// Simple line-based edit (traditional approach)
function lineBasedEdit(filePath, lineNum, newContent) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  if (lineNum < 1 || lineNum > lines.length) {
    return { success: false, message: `Line ${lineNum} out of range` };
  }
  
  // Simulate stale read: file might have changed after we read it
  // In real scenario, another process could have modified the file
  lines[lineNum - 1] = newContent;
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  
  return { success: true, message: `Edited line ${lineNum}` };
}

// Hash-anchored edit
const editTool = require('../src/edit-tool');

// Benchmark configuration
const ITERATIONS = 100;
const FILE_SIZE = 1000; // lines
const CONCURRENT_EDITS = 5;

function generateTestFile() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'omg-benchmark-'));
  const filePath = path.join(tmpDir, 'test-file.js');
  
  const lines = [];
  for (let i = 1; i <= FILE_SIZE; i++) {
    lines.push(`// Line ${i}: ${crypto.randomBytes(8).toString('hex')}`);
  }
  
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  return { tmpDir, filePath };
}

function simulateRaceCondition(filePath, editFn, iterations) {
  let successes = 0;
  let failures = 0;
  let corruptions = 0;
  
  for (let i = 0; i < iterations; i++) {
    const original = fs.readFileSync(filePath, 'utf8');
    const lines = original.split('\n');
    
    // Pick a random line to edit
    const lineNum = Math.floor(Math.random() * lines.length) + 1;
    const oldContent = lines[lineNum - 1];
    const newContent = `// EDITED ${i}: ${crypto.randomBytes(8).toString('hex')}`;
    
    // Simulate concurrent modification: modify the file after reading
    // but before the edit is applied
    const modifiedLines = [...lines];
    modifiedLines[Math.floor(Math.random() * lines.length)] = `// MODIFIED ${i}: ${crypto.randomBytes(8).toString('hex')}`;
    fs.writeFileSync(filePath, modifiedLines.join('\n'), 'utf8');
    
    // Now try to edit the original line
    const result = editFn(filePath, oldContent, newContent);
    
    if (result.success) {
      successes++;
    } else {
      failures++;
      // Check if file was corrupted (line-based edit would write to wrong line)
      const after = fs.readFileSync(filePath, 'utf8');
      if (after.includes(newContent) && !modifiedLines[lineNum - 1].includes(newContent)) {
        corruptions++;
      }
    }
  }
  
  return { successes, failures, corruptions };
}

function runBenchmark() {
  console.log('OMG-AI Edit Benchmark');
  console.log('=====================\n');
  
  console.log(`Configuration:`);
  console.log(`  Iterations: ${ITERATIONS}`);
  console.log(`  File size: ${FILE_SIZE} lines`);
  console.log(`  Concurrent edits: ${CONCURRENT_EDITS}`);
  console.log('');
  
  // Test 1: Line-based edits with race conditions
  console.log('Test 1: Line-based edits (simulating race conditions)');
  const { tmpDir: dir1, filePath: file1 } = generateTestFile();
  
  const lineBasedResults = simulateRaceCondition(
    file1,
    (fp, oldContent, newContent) => {
      // Simulate line-based edit: find line number from content
      const content = fs.readFileSync(fp, 'utf8');
      const lines = content.split('\n');
      const lineNum = lines.findIndex(line => line === oldContent) + 1;
      if (lineNum === 0) {
        return { success: false, message: 'Line not found' };
      }
      return lineBasedEdit(fp, lineNum, newContent);
    },
    ITERATIONS
  );
  
  console.log(`  Successes: ${lineBasedResults.successes}`);
  console.log(`  Failures: ${lineBasedResults.failures}`);
  console.log(`  Corruptions: ${lineBasedResults.corruptions}`);
  console.log(`  Success rate: ${(lineBasedResults.successes / ITERATIONS * 100).toFixed(1)}%`);
  console.log('');
  
  // Test 2: Hash-anchored edits with race conditions
  console.log('Test 2: Hash-anchored edits (simulating race conditions)');
  const { tmpDir: dir2, filePath: file2 } = generateTestFile();
  
  const hashAnchoredResults = simulateRaceCondition(
    file2,
    (fp, oldContent, newContent) => {
      return editTool.anchorEdit(fp, oldContent, newContent, { dryRun: false });
    },
    ITERATIONS
  );
  
  console.log(`  Successes: ${hashAnchoredResults.successes}`);
  console.log(`  Failures: ${hashAnchoredResults.failures}`);
  console.log(`  Corruptions: ${hashAnchoredResults.corruptions}`);
  console.log(`  Success rate: ${(hashAnchoredResults.successes / ITERATIONS * 100).toFixed(1)}%`);
  console.log('');
  
  // Test 3: Correctness check
  console.log('Test 3: Correctness verification');
  
  // Verify line-based edits may have corrupted the file
  const file1After = fs.readFileSync(file1, 'utf8');
  const lines1 = file1After.split('\n');
  let lineCorruptions = 0;
  for (let i = 0; i < lines1.length; i++) {
    if (lines1[i].includes('EDITED') && lines1[i].includes('MODIFIED')) {
      lineCorruptions++;
    }
  }
  
  // Verify hash-anchored edits preserved file integrity
  const file2After = fs.readFileSync(file2, 'utf8');
  const lines2 = file2After.split('\n');
  let hashCorruptions = 0;
  for (let i = 0; i < lines2.length; i++) {
    if (lines2[i].includes('EDITED') && lines2[i].includes('MODIFIED')) {
      hashCorruptions++;
    }
  }
  
  console.log(`  Line-based corruptions detected: ${lineCorruptions}`);
  console.log(`  Hash-anchored corruptions detected: ${hashCorruptions}`);
  console.log('');
  
  // Cleanup
  fs.rmSync(dir1, { recursive: true, force: true });
  fs.rmSync(dir2, { recursive: true, force: true });
  
  // Summary
  console.log('Summary');
  console.log('=======');
  console.log(`Line-based edit success rate: ${(lineBasedResults.successes / ITERATIONS * 100).toFixed(1)}%`);
  console.log(`Hash-anchored edit success rate: ${(hashAnchoredResults.successes / ITERATIONS * 100).toFixed(1)}%`);
  console.log('');
  
  if (hashAnchoredResults.successes > lineBasedResults.successes) {
    console.log('✓ Hash-anchored edits outperform line-based edits');
    console.log(`  Improvement: ${((hashAnchoredResults.successes - lineBasedResults.successes) / lineBasedResults.successes * 100).toFixed(1)}% more successful edits`);
  } else if (hashAnchoredResults.successes === lineBasedResults.successes) {
    console.log('✓ Both methods performed equally');
  } else {
    console.log('✗ Line-based edits outperformed hash-anchored edits');
  }
  
  if (lineBasedResults.corruptions > hashAnchoredResults.corruptions) {
    console.log(`✓ Hash-anchored edits prevented ${lineBasedResults.corruptions - hashAnchoredResults.corruptions} corruptions`);
  }
  
  console.log('\nBenchmark complete.');
}

// Run if called directly
if (require.main === module) {
  runBenchmark();
}

module.exports = { runBenchmark };