-- The taxonomy had two spellings of the same category: `Cybersecurity` (four
-- skills) and `Cyber Security` (security_fundamentals). The bank import uses
-- `Cybersecurity`. Normalise the reference row, then rename only questions
-- that no paper has frozen, so an exam that already ran keeps its category.
--
-- Re-applied on every boot, so every statement must be idempotent.

UPDATE skills
   SET category = 'Cybersecurity'
 WHERE code = 'security_fundamentals'
   AND category = 'Cyber Security';

UPDATE questions q
   SET category = 'Cybersecurity'
 WHERE q.category = 'Cyber Security'
   AND NOT EXISTS (
     SELECT 1
       FROM paper_questions pq
       JOIN question_variants v ON v.id = pq.variant_id
      WHERE v.question_id = q.id
   );
