'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Normalize a skill name for deduplication.
 * Lowercases, replaces spaces/dots with hyphens, strips special chars.
 */
function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/[\s._]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Parse a SKILL.md file into a structured skill object.
 * Extracts frontmatter (name, description, category) and body.
 */
function parseSkillMd(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const basename = path.basename(path.dirname(filePath));
  const relPath = filePath;

  let name = basename;
  let description = '';
  let category = path.basename(path.dirname(path.dirname(filePath))) || 'uncategorized';
  let body = content;

  // Try to extract YAML-like frontmatter
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (fmMatch) {
    const fm = fmMatch[1];
    body = fmMatch[2];

    const nameMatch = fm.match(/^name:\s*(.+)$/m);
    if (nameMatch) name = nameMatch[1].trim().replace(/^["']|["']$/g, '');

    const descMatch = fm.match(/^description:\s*(.+)$/m);
    if (descMatch) description = descMatch[1].trim().replace(/^["']|["']$/g, '');

    const catMatch = fm.match(/^category:\s*(.+)$/m);
    if (catMatch) category = catMatch[1].trim().replace(/^["']|["']$/g, '');
  } else {
    // Try to extract from first heading
    const headingMatch = content.match(/^#\s+(.+)$/m);
    if (headingMatch) name = headingMatch[1].trim();

    // Try first paragraph after heading as description
    const paraMatch = content.match(/^#\s+.+\n\n(.+?)(\n\n|\n#|$)/ms);
    if (paraMatch) description = paraMatch[1].trim().split('\n')[0];
  }

  return {
    name,
    normalizedName: normalizeName(name),
    description: description.slice(0, 500),
    category,
    path: relPath,
    body,
    size: content.length,
  };
}

/**
 * Scan a directory for skill definitions.
 * Looks for SKILL.md files recursively.
 *
 * @param {string} dirPath - root directory to scan
 * @returns {Array<object>} list of parsed skills
 */
function scanSkills(dirPath) {
  const skills = [];
  const resolved = path.resolve(dirPath);

  if (!fs.existsSync(resolved)) return skills;

  function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // Skip node_modules, .git, hidden dirs
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
        walk(fullPath);
      } else if (entry.name === 'SKILL.md') {
        try {
          skills.push(parseSkillMd(fullPath));
        } catch {
          // Skip unparseable skills
        }
      }
    }
  }

  walk(resolved);
  return skills;
}

/**
 * Deduplicate skills by normalized name.
 * When duplicates exist, keeps the one with more content (higher quality heuristic).
 *
 * @param {Array<object>} skills
 * @returns {{ unique: Array<object>, duplicates: Array<{kept: object, dropped: object}> }}
 */
function deduplicateSkills(skills) {
  const map = new Map();
  const duplicates = [];

  for (const skill of skills) {
    const key = skill.normalizedName;
    if (map.has(key)) {
      const existing = map.get(key);
      // Keep the larger one (more content = likely higher quality)
      if (skill.size > existing.size) {
        duplicates.push({ kept: skill, dropped: existing });
        map.set(key, skill);
      } else {
        duplicates.push({ kept: existing, dropped: skill });
      }
    } else {
      map.set(key, skill);
    }
  }

  return {
    unique: Array.from(map.values()),
    duplicates,
  };
}

/**
 * Merge skills from multiple source directories.
 *
 * @param {string[]} sourcePaths - directories to scan
 * @returns {{ skills: Array<object>, duplicates: Array, stats: object }}
 */
function mergeSkills(sourcePaths) {
  const allSkills = [];
  const sourceStats = [];

  for (const src of sourcePaths) {
    const scanned = scanSkills(src);
    sourceStats.push({
      path: src,
      count: scanned.length,
    });
    allSkills.push(...scanned);
  }

  const { unique, duplicates } = deduplicateSkills(allSkills);

  // Sort by category then name
  unique.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.name.localeCompare(b.name);
  });

  return {
    skills: unique,
    duplicates,
    stats: {
      totalScanned: allSkills.length,
      unique: unique.length,
      duplicatesRemoved: duplicates.length,
      sources: sourceStats,
    },
  };
}

/**
 * Generate a unified skill catalog JSON.
 *
 * @param {Array<object>} skills
 * @returns {object} catalog object
 */
function generateCatalog(skills) {
  const categories = {};
  for (const skill of skills) {
    if (!categories[skill.category]) {
      categories[skill.category] = [];
    }
    categories[skill.category].push({
      name: skill.name,
      description: skill.description,
      path: skill.path,
    });
  }

  return {
    version: '1.0.0',
    generated: new Date().toISOString(),
    totalSkills: skills.length,
    categories,
  };
}

module.exports = {
  normalizeName,
  parseSkillMd,
  scanSkills,
  deduplicateSkills,
  mergeSkills,
  generateCatalog,
};
