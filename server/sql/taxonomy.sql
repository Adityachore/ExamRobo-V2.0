-- The skills taxonomy: the reference data of the question bank.
--
-- It is a data file, not a migration, because the seed truncates the bank and
-- a TRUNCATE ... CASCADE follows the foreign keys down to the skills table.
-- The taxonomy is re-applied right after a truncate (see scripts/seed.js), so
-- it always exists.
--
-- Applied on every boot (scripts/migrate.js) and to every scratch database
-- (scripts/scratch-db.mjs). ON CONFLICT DO NOTHING: an admin can add skills
-- of their own and a later boot must not remove them.
--
-- A skill belongs to exactly one category. The code is the stable key - a
-- skill can be renamed without breaking anything that points at it.

INSERT INTO skills (code, name, category, description) VALUES
  ('quantitative_reasoning', 'Quantitative Reasoning', 'Aptitude', 'Arithmetic, ratios, percentages and rate problems.'),
  ('verbal_reasoning', 'Verbal Reasoning', 'Aptitude', 'Reading comprehension, vocabulary and written argument.'),
  ('data_interpretation', 'Data Interpretation', 'Aptitude', 'Reading tables, charts and simple statistics.'),
  ('logical_reasoning', 'Logical Reasoning', 'Logic', 'Deductive and inductive argument.'),
  ('analytical_reasoning', 'Analytical Reasoning', 'Logic', 'Breaking a problem into parts and ordering them.'),
  ('pattern_recognition', 'Pattern Recognition', 'Logic', 'Sequences, series and hidden rules.'),
  ('html_css', 'HTML & CSS', 'Frontend', 'Markup, the box model, layout and the cascade.'),
  ('javascript_core', 'JavaScript Fundamentals', 'Frontend', 'The language itself: types, scope, promises and the event loop.'),
  ('react_frontend', 'React & Component Design', 'Frontend', 'Components, state and rendering.'),
  ('accessibility', 'Accessibility', 'Frontend', 'Keyboard access, semantics and assistive technology.'),
  ('responsive_design', 'Responsive Design', 'Frontend', 'Layouts that work from a phone to a desktop.'),
  ('rest_api_design', 'REST API Design', 'Backend', 'Resources, status codes and contracts.'),
  ('relational_databases', 'Relational Databases', 'Backend', 'Schema, indexing and transactions.'),
  ('authentication_security', 'Authentication & Security', 'Backend', 'Identity, sessions, authorisation and secrets.'),
  ('caching_performance', 'Caching & Performance', 'Backend', 'Latency, load and the query behind the request.'),
  ('threat_modelling', 'Threat Modelling', 'Cybersecurity', 'Finding what can go wrong before it does.'),
  ('web_security', 'Web Application Security', 'Cybersecurity', 'Injection, access control and the browser trust boundary.'),
  ('network_security', 'Network Security', 'Cybersecurity', 'Protocols, firewalls and traffic analysis.'),
  ('incident_response', 'Incident Response', 'Cybersecurity', 'Detecting, containing and recovering from an incident.'),
  ('seo', 'Search Engine Optimisation', 'Digital Marketing', 'How a page is found, and why it ranks.'),
  ('web_analytics', 'Web Analytics', 'Digital Marketing', 'Measuring what visitors actually do.'),
  ('content_marketing', 'Content Marketing', 'Digital Marketing', 'Content that earns attention and trust.'),
  ('paid_advertising', 'Paid Advertising', 'Digital Marketing', 'Buying reach and measuring the return.'),
  ('theme_development', 'Theme Development', 'WordPress', 'Templates, the loop and block themes.'),
  ('plugin_development', 'Plugin Development', 'WordPress', 'Hooks, settings and safe updates.'),
  ('content_workflow', 'Content Workflow', 'WordPress', 'Editors, media and publishing.'),
  ('performance_optimization', 'Performance Optimisation', 'WordPress', 'Caching, assets and Core Web Vitals.'),
  ('ai_foundations', 'AI Foundations', 'AI', 'What a model is, what it can and cannot do.'),
  ('llm_applications', 'LLM Applications', 'AI', 'Building products on top of a language model.'),
  ('ai_ethics', 'Responsible AI', 'AI', 'Bias, privacy and the impact of an automated decision.'),
  ('ai_evaluation', 'AI Evaluation', 'AI', 'Measuring whether an AI system is good enough.'),
  ('instruction_design', 'Instruction Design', 'Prompt Engineering', 'Writing instructions a model follows.'),
  ('few_shot_patterns', 'Few-Shot Patterns', 'Prompt Engineering', 'Examples, formats and templates.'),
  ('prompt_evaluation', 'Prompt Evaluation', 'Prompt Engineering', 'Testing a prompt before it ships.'),
  ('prompt_safety', 'Prompt Safety', 'Prompt Engineering', 'Keeping a prompt from being hijacked.'),
  ('supervised_learning', 'Supervised Learning', 'Machine Learning', 'Labelled data, regression and classification.'),
  ('feature_engineering', 'Feature Engineering', 'Machine Learning', 'Turning raw data into something a model can use.'),
  ('deep_learning', 'Deep Learning', 'Machine Learning', 'Neural networks and how they are trained.'),
  ('mlops', 'MLOps', 'Machine Learning', 'Deploying, monitoring and retraining a model.'),
  ('full_stack_architecture', 'Full-Stack Architecture', 'Full Stack', 'Connecting the frontend, backend and data layer into one product.'),
  ('ml_foundations', 'Machine Learning Foundations', 'AI and ML', 'How models learn from data and where they fail.'),
  ('llm_integration', 'LLM Integration', 'LLM', 'Using a language model as a component in a product.'),
  ('security_fundamentals', 'Security Fundamentals', 'Cyber Security', 'Core threats, controls and secure defaults.'),
  ('devops_pipelines', 'DevOps Pipelines', 'DevOps', 'Build, test, release and operate software.'),
  ('field_marketing', 'Field Marketing', 'On-Field Marketing', 'Events, local campaigns and direct customer contact.')
ON CONFLICT (code) DO NOTHING;
