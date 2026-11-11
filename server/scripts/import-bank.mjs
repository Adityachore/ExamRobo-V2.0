import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { pool } from '../db.js';
import { applyTaxonomy, migrate } from './migrate.js';

export const DOMAINS = {
  FE: {
    category: 'Frontend',
    fallback: 'javascript_core',
    skills: {
      HTML: 'html_css',
      CSS: 'html_css',
      JavaScript: 'javascript_core',
      DOM: 'javascript_core',
      React: 'react_frontend',
      Performance: 'javascript_core',
      Accessibility: 'accessibility',
      HTTP: 'javascript_core',
      'Responsive Design': 'responsive_design',
      Debugging: 'javascript_core',
    },
  },
  BE: {
    category: 'Backend',
    fallback: 'rest_api_design',
    skills: {
      Authentication: 'authentication_security',
      'REST APIs': 'rest_api_design',
      SQL: 'relational_databases',
      Databases: 'relational_databases',
      HTTP: 'rest_api_design',
      Errors: 'rest_api_design',
      Validation: 'rest_api_design',
      Security: 'authentication_security',
      Caching: 'caching_performance',
      Scalability: 'caching_performance',
    },
  },
  FS: {
    category: 'Full Stack',
    fallback: 'full_stack_architecture',
    skills: {},
  },
  AI: {
    category: 'AI',
    fallback: 'ai_foundations',
    skills: {
      Fundamentals: 'ai_foundations',
      'Responsible AI': 'ai_ethics',
      Evaluation: 'ai_evaluation',
      Search: 'ai_foundations',
      'Knowledge Representation': 'ai_foundations',
      Agents: 'llm_applications',
      Reasoning: 'ai_foundations',
      NLP: 'llm_applications',
      Planning: 'ai_foundations',
      'Computer Vision': 'ai_foundations',
    },
  },
  ML: {
    category: 'Machine Learning',
    fallback: 'supervised_learning',
    skills: {
      'Learning Types': 'supervised_learning',
      Features: 'feature_engineering',
      'Data Preparation': 'feature_engineering',
      Evaluation: 'supervised_learning',
      Validation: 'supervised_learning',
      Regression: 'supervised_learning',
      Classification: 'supervised_learning',
      Overfitting: 'supervised_learning',
      Clustering: 'supervised_learning',
      Deployment: 'mlops',
    },
  },
  LLM: {
    category: 'LLM',
    fallback: 'llm_integration',
    skills: {
      Prompting: 'instruction_design',
      Safety: 'prompt_safety',
      Evaluation: 'prompt_evaluation',
      Fundamentals: 'llm_integration',
      Hallucinations: 'llm_integration',
      Tokens: 'llm_integration',
      RAG: 'llm_integration',
      Embeddings: 'llm_integration',
      'Fine-tuning': 'llm_integration',
      'Tool Use': 'llm_integration',
    },
  },
  CS: {
    category: 'Cybersecurity',
    fallback: 'security_fundamentals',
    skills: {
      'Incident Response': 'incident_response',
      Authentication: 'security_fundamentals',
      Encryption: 'security_fundamentals',
      Passwords: 'security_fundamentals',
      'Web Attacks': 'web_security',
      'SQL Injection': 'web_security',
      'CIA Triad': 'security_fundamentals',
      'Access Control': 'web_security',
      Networking: 'network_security',
      XSS: 'web_security',
    },
  },
  DM: {
    category: 'Digital Marketing',
    fallback: 'content_marketing',
    skills: {
      Email: 'content_marketing',
      'Paid Ads': 'paid_advertising',
      Analytics: 'web_analytics',
      SEO: 'seo',
      Reporting: 'web_analytics',
      'Social Media': 'content_marketing',
      Conversion: 'web_analytics',
      Campaigns: 'paid_advertising',
      Content: 'content_marketing',
      Audience: 'content_marketing',
    },
  },
  WP: {
    category: 'WordPress',
    fallback: 'content_workflow',
    skills: {
      Themes: 'theme_development',
      Users: 'content_workflow',
      Troubleshooting: 'plugin_development',
      Plugins: 'plugin_development',
      Security: 'plugin_development',
      SEO: 'content_workflow',
      Basics: 'content_workflow',
      Media: 'content_workflow',
      'Posts and Pages': 'content_workflow',
      Performance: 'performance_optimization',
    },
  },
  DO: {
    category: 'DevOps',
    fallback: 'devops_pipelines',
    skills: {},
  },
  OF: {
    category: 'On-Field Marketing',
    fallback: 'field_marketing',
    skills: {},
  },
};

export const DIFFICULTY = { Basic: 1, Medium: 3, High: 5 };

const OPTION_RE = /^-\s*([A-D])\)\s*(.*)$/;
const QUESTION_RE =
  /^\*\*([A-Z]{2,3})-(\d{3})\*\*\s*\|\s*([^|]+?)\s*\|\s*(Basic|Medium|High)\s*$/;
const HEADING_RE = /^#\s+([A-Z]{2,3})\s+(?:\u2014|\u2013|-)\s+(.+?)\s*$/u;

export function parseBank(text) {
  const lines = String(text).replace(/^\uFEFF/, '').split(/\r?\n/);
  const questions = [];
  const issues = [];
  let domain = null;
  let current = null;

  const finish = () => {
    if (!current) return;
    const fail = (message) => issues.push(`${current.id} (line ${current.line}): ${message}`);
    const stem = current.stemLines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    if (!stem) fail('missing question text');
    if (current.options.length !== 4) fail(`expected 4 options, found ${current.options.length}`);
    const letters = current.options.map((option) => option.letter).join('');
    if (letters !== 'ABCD') fail(`options must be A-D in order, found ${letters || 'none'}`);
    if (!current.answer) fail('missing answer');
    if (current.answer && !'ABCD'.includes(current.answer)) fail('answer must be A-D');
    const blank = current.options.find((option) => !option.text);
    if (blank) fail(`option ${blank.letter} is empty`);

    if (stem && current.options.length === 4 && letters === 'ABCD' && current.answer) {
      questions.push({
        id: current.id,
        domain: current.domain,
        subtopic: current.subtopic,
        difficultyLabel: current.difficulty,
        difficulty: DIFFICULTY[current.difficulty],
        stem,
        options: current.options.map((option) => option.text),
        correctIdx: 'ABCD'.indexOf(current.answer),
        explanation: current.explanation,
        line: current.line,
      });
    }
    current = null;
  };

  lines.forEach((line, index) => {
    const heading = line.match(HEADING_RE);
    if (heading) {
      finish();
      domain = heading[1];
      return;
    }
    const question = line.match(QUESTION_RE);
    if (question) {
      finish();
      current = {
        id: `${question[1]}-${question[2]}`,
        domain: question[1],
        subtopic: question[3].trim(),
        difficulty: question[4],
        stemLines: [],
        options: [],
        answer: null,
        explanation: '',
        line: index + 1,
      };
      return;
    }
    if (!current) return;

    const option = line.match(OPTION_RE);
    if (option) {
      current.options.push({ letter: option[1], text: option[2].trim() });
      return;
    }
    const answer = line.match(/^\*\*Answer:\*\*\s*([A-D])\s*$/);
    if (answer) {
      current.answer = answer[1];
      return;
    }
    const explanation = line.match(/^\*\*Explanation:\*\*\s*(.*)$/);
    if (explanation) {
      current.explanation = explanation[1].trim();
      return;
    }
    if (current.answer) return;
    current.stemLines.push(line);
  });

  finish();
  return { questions, issues, domain };
}

export function categorize(questions) {
  const issues = [];
  const warnings = [];
  const prepared = [];
  const seen = new Map();
  for (const question of questions) {
    const config = DOMAINS[question.domain];
    if (!config) {
      issues.push(`${question.id}: unknown domain ${question.domain}`);
      continue;
    }
    const key = `${config.category}\u0000${question.stem}`;
    const original = seen.get(key);
    if (original) {
      warnings.push(`${question.id}: repeats the stem of ${original} (imported as a distinct row)`);
    } else {
      seen.set(key, question.id);
    }
    const skill = config.skills[question.subtopic] || config.fallback;
    prepared.push({
      ...question,
      sourceKey: `examrobo-bank:${question.id}`,
      category: config.category,
      skill,
      fallbackSkill: !config.skills[question.subtopic],
    });
  }
  return { prepared, issues, warnings };
}

export function report(prepared) {
  const byDomain = new Map();
  const byDifficulty = { 1: 0, 3: 0, 5: 0 };
  const fallbackSkills = new Map();
  for (const item of prepared) {
    const bucket = byDomain.get(item.domain) || { total: 0, fallback: 0, skills: new Set() };
    bucket.total += 1;
    bucket.skills.add(item.skill);
    if (item.fallbackSkill) {
      bucket.fallback += 1;
      fallbackSkills.set(item.subtopic, (fallbackSkills.get(item.subtopic) || 0) + 1);
    }
    byDomain.set(item.domain, bucket);
    byDifficulty[item.difficulty] += 1;
  }
  return { byDomain, byDifficulty, fallbackSkills };
}

function printReport(prepared, issues, warnings = []) {
  const { byDomain, byDifficulty, fallbackSkills } = report(prepared);
  console.log(`parsed ${prepared.length} questions`);
  for (const [domain, bucket] of [...byDomain].sort()) {
    const fallback = bucket.fallback ? `, ${bucket.fallback} via fallback` : '';
    console.log(`  ${domain} -> ${DOMAINS[domain].category}: ${bucket.total} questions${fallback}`);
  }
  console.log(
    `difficulty: Basic ${byDifficulty[1]}, Medium ${byDifficulty[3]}, High ${byDifficulty[5]}`,
  );
  if (fallbackSkills.size) {
    console.log('subtopics using a domain fallback skill:');
    for (const [subtopic, count] of [...fallbackSkills].sort()) {
      console.log(`  ${subtopic}: ${count}`);
    }
  }
  if (warnings.length) {
    console.log(`repeated stems (${warnings.length}, imported as distinct rows):`);
    warnings.slice(0, 5).forEach((warning) => console.log(`  ${warning}`));
    if (warnings.length > 5) console.log(`  ... ${warnings.length - 5} more`);
  }
  if (issues.length) {
    console.log(`issues (${issues.length}):`);
    issues.slice(0, 50).forEach((issue) => console.log(`  ${issue}`));
    if (issues.length > 50) console.log(`  ... ${issues.length - 50} more`);
  }
}

function option(name, fallback = null) {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return fallback;
  const value = process.argv[index + 1];
  return value && !value.startsWith('--') ? value : true;
}

async function run() {
  const source =
    option('source') ||
    path.resolve(process.cwd(), '..', 'docs', 'question-bank', 'Internship_Exam_Question_Bank_1100.md');
  const dryRun = Boolean(option('dry-run', false));
  const replace = Boolean(option('replace', false));
  const limit = Number(option('limit', 0)) || 0;

  const text = await fs.readFile(source, 'utf8');
  const parsed = parseBank(text);
  const { prepared, issues, warnings } = categorize(parsed.questions);
  const selected = limit ? prepared.slice(0, limit) : prepared;
  printReport(selected, [...parsed.issues, ...issues], warnings);

  if (parsed.issues.length || issues.length) {
    throw new Error('the source has malformed or unmapped questions; nothing was imported');
  }
  if (dryRun) {
    console.log('dry run: no database changes');
    return;
  }

  const client = await pool.connect();
  try {
    await migrate();
    await applyTaxonomy();
    const { rows: institutions } = await client.query(
      `SELECT id FROM institutions WHERE slug = 'pararobo' AND is_internal`,
    );
    if (!institutions.length) throw new Error('the legacy ParaRobo institution is missing');
    const institutionId = institutions[0].id;
    const skills = [...new Set(selected.map((item) => item.skill))];
    const { rows: skillRows } = await client.query(
      `SELECT code FROM skills WHERE code = ANY($1::text[])`,
      [skills],
    );
    const knownSkills = new Set(skillRows.map((row) => row.code));
    const missing = skills.filter((code) => !knownSkills.has(code));
    if (missing.length) throw new Error(`taxonomy is missing skills: ${missing.join(', ')}`);

    await client.query('BEGIN');
    if (replace) {
      const { rowCount } = await client.query(
        `DELETE FROM questions q
          WHERE q.source_key LIKE 'examrobo-bank:%'
            AND NOT EXISTS (
              SELECT 1
                FROM paper_questions pq
                JOIN question_variants v ON v.id = pq.variant_id
               WHERE v.question_id = q.id
            )`,
      );
      console.log(`replace: removed ${rowCount} imported questions not used by a paper`);
    }

    const { rows: existing } = await client.query(
      `SELECT source_key FROM questions WHERE source_key LIKE 'examrobo-bank:%'`,
    );
    const present = new Set(existing.map((row) => row.source_key));

    let inserted = 0;
    let skipped = 0;
    for (const item of selected) {
      if (present.has(item.sourceKey)) {
        skipped += 1;
        continue;
      }
      const { rows } = await client.query(
        `INSERT INTO questions (category, skill_id, difficulty, active, source_key, institution_id)
         SELECT $1, id, $2, true, $4, $5
           FROM skills
          WHERE code = $3 AND institution_id = $5
         RETURNING id`,
        [item.category, item.difficulty, item.skill, item.sourceKey, institutionId],
      );
      if (!rows.length) throw new Error(`skill ${item.skill} disappeared during import`);
      await client.query(
        `INSERT INTO question_variants (question_id, stem, options, correct_idx, institution_id)
         VALUES ($1,$2,$3,$4,$5)`,
        [rows[0].id, item.stem, item.options, item.correctIdx, institutionId],
      );
      present.add(item.sourceKey);
      inserted += 1;
    }
    await client.query('COMMIT');
    console.log(`imported ${inserted}, skipped ${skipped} already present`);
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run()
    .catch((error) => {
      console.error('import failed:', error.message);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}
