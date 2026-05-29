'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { normalizeName, parseSkillMd, scanSkills, deduplicateSkills, mergeSkills, generateCatalog } = require('../src/skill-merger');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'omg-skill-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function createSkill(dirName, skillMd) {
  const dir = path.join(tmpDir, dirName);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'SKILL.md'), skillMd, 'utf8');
}

describe('normalizeName', () => {
  it('lowercases and hyphenates', () => {
    assert.equal(normalizeName('My Skill Name'), 'my-skill-name');
  });

  it('removes special characters', () => {
    assert.equal(normalizeName('skill@v2.0!'), 'skillv2-0');
  });

  it('collapses multiple hyphens', () => {
    assert.equal(normalizeName('a--b--c'), 'a-b-c');
  });

  it('strips leading/trailing hyphens', () => {
    assert.equal(normalizeName('-test-'), 'test');
  });
});

describe('parseSkillMd', () => {
  it('parses frontmatter', () => {
    createSkill('test-skill', `---
name: Test Skill
description: A test skill
category: testing
---
# Body
Content here`);
    const skill = parseSkillMd(path.join(tmpDir, 'test-skill', 'SKILL.md'));
    assert.equal(skill.name, 'Test Skill');
    assert.equal(skill.description, 'A test skill');
    assert.equal(skill.category, 'testing');
  });

  it('falls back to heading when no frontmatter', () => {
    createSkill('heading-skill', `# Heading Skill
First paragraph description.
More text.`);
    const skill = parseSkillMd(path.join(tmpDir, 'heading-skill', 'SKILL.md'));
    assert.equal(skill.name, 'Heading Skill');
  });

  it('uses directory name as fallback for name', () => {
    createSkill('dir-name-skill', `Just plain text, no heading.`);
    const skill = parseSkillMd(path.join(tmpDir, 'dir-name-skill', 'SKILL.md'));
    assert.equal(skill.name, 'dir-name-skill');
  });
});

describe('scanSkills', () => {
  it('finds SKILL.md files recursively', () => {
    createSkill('cat-a/skill-one', `# Skill One\ndesc`);
    createSkill('cat-b/skill-two', `# Skill Two\ndesc`);
    const skills = scanSkills(tmpDir);
    assert.equal(skills.length, 2);
  });

  it('skips .git and node_modules', () => {
    createSkill('.git/skip-this', `# Skip\ndesc`);
    createSkill('node_modules/skip-this', `# Skip\ndesc`);
    createSkill('valid/skill', `# Valid\ndesc`);
    const skills = scanSkills(tmpDir);
    assert.equal(skills.length, 1);
  });

  it('returns empty for nonexistent path', () => {
    const skills = scanSkills('/nonexistent/path');
    assert.equal(skills.length, 0);
  });
});

describe('deduplicateSkills', () => {
  it('removes duplicates by normalized name', () => {
    const skills = [
      { normalizedName: 'my-skill', name: 'My Skill', size: 100 },
      { normalizedName: 'my-skill', name: 'my skill', size: 200 },
      { normalizedName: 'other', name: 'Other', size: 50 },
    ];
    const { unique, duplicates } = deduplicateSkills(skills);
    assert.equal(unique.length, 2);
    assert.equal(duplicates.length, 1);
    // Kept the larger one
    assert.equal(duplicates[0].kept.size, 200);
  });

  it('keeps all when no duplicates', () => {
    const skills = [
      { normalizedName: 'a', name: 'A', size: 100 },
      { normalizedName: 'b', name: 'B', size: 200 },
    ];
    const { unique, duplicates } = deduplicateSkills(skills);
    assert.equal(unique.length, 2);
    assert.equal(duplicates.length, 0);
  });
});

describe('mergeSkills', () => {
  it('merges from multiple sources', () => {
    const dir1 = path.join(tmpDir, 'source1');
    const dir2 = path.join(tmpDir, 'source2');
    createSkill('source1/skill-a', `# Skill A\ndesc`);
    createSkill('source2/skill-b', `# Skill B\ndesc`);
    const result = mergeSkills([dir1, dir2]);
    assert.equal(result.stats.unique, 2);
    assert.equal(result.stats.totalScanned, 2);
  });

  it('deduplicates across sources', () => {
    const dir1 = path.join(tmpDir, 'src1');
    const dir2 = path.join(tmpDir, 'src2');
    createSkill('src1/duplicate', `# Duplicate\nsmall`);
    createSkill('src2/duplicate', `# Duplicate\nmuch longer content that is bigger`);
    const result = mergeSkills([dir1, dir2]);
    assert.equal(result.stats.unique, 1);
    assert.equal(result.stats.duplicatesRemoved, 1);
  });
});

describe('generateCatalog', () => {
  it('groups skills by category', () => {
    const skills = [
      { name: 'A', category: 'cat1', description: 'desc a', path: '/a' },
      { name: 'B', category: 'cat1', description: 'desc b', path: '/b' },
      { name: 'C', category: 'cat2', description: 'desc c', path: '/c' },
    ];
    const catalog = generateCatalog(skills);
    assert.equal(catalog.totalSkills, 3);
    assert.equal(Object.keys(catalog.categories).length, 2);
    assert.equal(catalog.categories.cat1.length, 2);
    assert.equal(catalog.categories.cat2.length, 1);
  });
});
