const fs = require('node:fs');
const path = require('node:path');
const { initDb } = require('./init');

const db = initDb();
const outDir = path.join(__dirname, '..', '..', 'client', 'public', 'data');
fs.mkdirSync(outDir, { recursive: true });

// 1. overview.json
const profile = db.prepare('SELECT * FROM family_profile WHERE id = 1').get();
const checklistStats = db
  .prepare(
    `SELECT group_name, COUNT(*) AS total, SUM(is_completed) AS completed
     FROM checklist_items GROUP BY group_name`
  )
  .all();
const locationsSummary = db
  .prepare(
    `SELECT slug, name_he, state_he, total_monthly_min, total_monthly_max, state_tax_pct, fema_risk_level, diabetes_hospital
     FROM locations ORDER BY total_monthly_min ASC`
  )
  .all();
const sourcesCount = db.prepare('SELECT COUNT(*) AS count FROM official_sources').get().count;
const storiesCount = db.prepare('SELECT COUNT(*) AS count FROM stories').get().count;

fs.writeFileSync(
  path.join(outDir, 'overview.json'),
  JSON.stringify(
    {
      profile,
      checklistStats,
      locationsSummary,
      counts: { sources: sourcesCount, stories: storiesCount, locations: locationsSummary.length },
    },
    null,
    2
  )
);

// 2. stories.json
const stories = db.prepare('SELECT * FROM stories ORDER BY id ASC').all();
const youtubeChannels = db
  .prepare('SELECT * FROM youtube_channels ORDER BY is_user_recommended DESC, id ASC')
  .all();
fs.writeFileSync(path.join(outDir, 'stories.json'), JSON.stringify({ stories, youtubeChannels }, null, 2));

// 3. visas.json
const visaPaths = db.prepare('SELECT * FROM visa_paths ORDER BY id ASC').all();
const layoffOptions = db.prepare('SELECT * FROM layoff_options ORDER BY id ASC').all();
const familySponsorship = db.prepare('SELECT * FROM family_sponsorship_rules ORDER BY id ASC').all();
fs.writeFileSync(
  path.join(outDir, 'visas.json'),
  JSON.stringify({ visaPaths, layoffOptions, familySponsorship }, null, 2)
);

// 4. locations.json
const locations = db.prepare('SELECT * FROM locations ORDER BY tier ASC, total_monthly_min ASC').all();
const budgetItems = db.prepare('SELECT * FROM location_budget_items ORDER BY id ASC').all();
const locSources = db
  .prepare(
    `SELECT * FROM official_sources WHERE category IN ('מאגרי נתונים רשמיים', 'אתרי ערים ו-Niche') ORDER BY id ASC`
  )
  .all();
fs.writeFileSync(
  path.join(outDir, 'locations.json'),
  JSON.stringify({ locations, budgetItems, sources: locSources }, null, 2)
);

// 5. diabetes.json
const comparisons = db.prepare('SELECT * FROM diabetes_comparisons ORDER BY id ASC').all();
const diabChecklist = db
  .prepare(`SELECT * FROM checklist_items WHERE group_name = 'diabetes_prep' ORDER BY step_order ASC`)
  .all();
const diabSources = db
  .prepare(`SELECT * FROM official_sources WHERE category = 'סוכרת וביטוח' ORDER BY id ASC`)
  .all();
fs.writeFileSync(
  path.join(outDir, 'diabetes.json'),
  JSON.stringify({ comparisons, checklist: diabChecklist, sources: diabSources }, null, 2)
);

// 6. practical.json
const landingBudget = db.prepare('SELECT * FROM landing_budget_items ORDER BY id ASC').all();
const pracChecklists = db
  .prepare(
    `SELECT * FROM checklist_items WHERE group_name IN ('israel_docs', 'us_landing') ORDER BY group_name ASC, step_order ASC`
  )
  .all();
const allSources = db.prepare('SELECT * FROM official_sources ORDER BY category ASC, id ASC').all();
fs.writeFileSync(
  path.join(outDir, 'practical.json'),
  JSON.stringify({ landingBudget, checklists: pracChecklists, sources: allSources }, null, 2)
);

// 7. niche-db.json
const nichePlaces = db
  .prepare('SELECT * FROM niche_db_places ORDER BY peace_of_mind_score DESC, home_buy_median ASC')
  .all();
fs.writeFileSync(
  path.join(outDir, 'niche-db.json'),
  JSON.stringify(
    {
      places: nichePlaces,
      criteria: {
        crime_min: 'A-',
        schools_min: 'A',
        fema_focus: 'ללא שריפות יער, ללא הוריקנים, ללא צונאמי, רשת חשמל אמינה לסוכרת סוג 1',
        family_profile:
          'QA בכיר (עבודה מהבית + גיבוי מקומי) + בת זוג במשרה חלקית גמישה + 2 ילדים (אחד עם T1D) + רכב אמין בעלות נמוכה',
      },
    },
    null,
    2
  )
);

console.log('Exported static JSON bundles to:', outDir);
