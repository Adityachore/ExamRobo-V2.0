import 'dotenv/config';
import { q, pool } from './db.js';
import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./imported_questions.json', 'utf8'));

async function importQuestions() {
  for (const [filename, fileData] of Object.entries(data)) {
    if (fileData.count === 0 || fileData.questions.length === 0) {
      console.log(`Skipping ${filename}: no questions`);
      continue;
    }
    const mapping = fileData.mapping;
    console.log(`Importing ${filename}: ${fileData.questions.length} questions to ${mapping.category}`);
    
    for (const qitem of fileData.questions) {
      try {
        // Insert question
        const res = await q(
          `INSERT INTO questions (category, difficulty, active) VALUES ($1, $2, $3) RETURNING id`,
          [mapping.category, mapping.difficulty, mapping.active]
        );
        const questionId = res.rows[0].id;
        // Insert variant
        await q(
          `INSERT INTO question_variants (question_id, stem, options, correct_idx) VALUES ($1, $2, $3, $4)`,
          [questionId, qitem.stem, qitem.options, qitem.correct]
        );
      } catch (e) {
        console.error(`Error importing question from ${filename}:`, e.message);
      }
    }
  }
  console.log('Done!');
  await pool.end();
}

importQuestions();
