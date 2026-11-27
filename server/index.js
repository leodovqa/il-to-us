const path = require('node:path');
const fs = require('node:fs');
const express = require('express');
const cors = require('cors');
const { initDb } = require('./db/init');

const app = express();
const PORT = process.env.PORT || 3001;
const db = initDb();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, db: 'relocation.db' });
});

app.get('/api/overview', (req, res) => {
  const profile = db.prepare('SELECT * FROM family_profile WHERE id = 1').get();
  const checklistStats = db
    .prepare(
      `SELECT group_name, COUNT(*) AS total, SUM(is_completed) AS completed
       FROM checklist_items GROUP BY group_name`
    )
    .all();
  const locations = db
    .prepare(
      `SELECT slug, name_he, state_he, total_monthly_min, total_monthly_max, state_tax_pct, fema_risk_level, diabetes_hospital
       FROM locations ORDER BY total_monthly_min ASC`
    )
    .all();
  const sourcesCount = db.prepare('SELECT COUNT(*) AS count FROM official_sources').get().count;
  const storiesCount = db.prepare('SELECT COUNT(*) AS count FROM stories').get().count;

  res.json({
    profile,
    checklistStats,
    locationsSummary: locations,
    counts: { sources: sourcesCount, stories: storiesCount, locations: locations.length },
  });
});

app.get('/api/stories', (req, res) => {
  const { q, tag } = req.query;
  let stories = db.prepare('SELECT * FROM stories ORDER BY id ASC').all();

  if (tag && tag !== 'all') {
    stories = stories.filter((s) => s.tags.split(',').includes(tag));
  }
  if (q && q.trim()) {
    const needle = q.trim().toLowerCase();
    stories = stories.filter(
      (s) =>
        s.title.toLowerCase().includes(needle) ||
        s.destination.toLowerCase().includes(needle) ||
        s.background.toLowerCase().includes(needle) ||
        s.challenges_and_reality.toLowerCase().includes(needle)
    );
  }

  const youtubeChannels = db.prepare('SELECT * FROM youtube_channels ORDER BY is_user_recommended DESC, id ASC').all();
  res.json({ stories, youtubeChannels });
});

app.get('/api/visas', (req, res) => {
  const visaPaths = db.prepare('SELECT * FROM visa_paths ORDER BY id ASC').all();
  const layoffOptions = db.prepare('SELECT * FROM layoff_options ORDER BY id ASC').all();
  const familySponsorship = db.prepare('SELECT * FROM family_sponsorship_rules ORDER BY id ASC').all();
  res.json({ visaPaths, layoffOptions, familySponsorship });
});

app.get('/api/locations', (req, res) => {
  const locations = db.prepare('SELECT * FROM locations ORDER BY tier ASC, total_monthly_min ASC').all();
  const budgetItems = db.prepare('SELECT * FROM location_budget_items ORDER BY id ASC').all();
  const sources = db
    .prepare(
      `SELECT * FROM official_sources WHERE category IN ('מאגרי נתונים רשמיים', 'אתרי ערים ו-Niche') ORDER BY id ASC`
    )
    .all();
  res.json({ locations, budgetItems, sources });
});

app.get('/api/diabetes', (req, res) => {
  const comparisons = db.prepare('SELECT * FROM diabetes_comparisons ORDER BY id ASC').all();
  const checklist = db
    .prepare(`SELECT * FROM checklist_items WHERE group_name = 'diabetes_prep' ORDER BY step_order ASC`)
    .all();
  const sources = db
    .prepare(`SELECT * FROM official_sources WHERE category = 'סוכרת וביטוח' ORDER BY id ASC`)
    .all();
  res.json({ comparisons, checklist, sources });
});

app.get('/api/practical', (req, res) => {
  const landingBudget = db.prepare('SELECT * FROM landing_budget_items ORDER BY id ASC').all();
  const checklists = db
    .prepare(
      `SELECT * FROM checklist_items WHERE group_name IN ('israel_docs', 'us_landing') ORDER BY group_name ASC, step_order ASC`
    )
    .all();
  const sources = db.prepare('SELECT * FROM official_sources ORDER BY category ASC, id ASC').all();
  res.json({ landingBudget, checklists, sources });
});

app.get('/api/niche-db', (req, res) => {
  const places = db
    .prepare('SELECT * FROM niche_db_places ORDER BY peace_of_mind_score DESC, home_buy_median ASC')
    .all();
  res.json({
    places,
    criteria: {
      crime_min: 'A-',
      schools_min: 'A',
      fema_focus: 'ללא שריפות יער, ללא הוריקנים, ללא צונאמי, רשת חשמל אמינה לסוכרת סוג 1',
      family_profile: 'QA בכיר (עבודה מהבית + גיבוי מקומי) + בת זוג במשרה חלקית גמישה + 2 ילדים (אחד עם T1D) + רכב אמין בעלות נמוכה',
    },
  });
});

app.patch('/api/checklists/:id', (req, res) => {
  const id = Number(req.params.id);
  const { is_completed } = req.body;
  if (!Number.isInteger(id) || typeof is_completed !== 'boolean') {
    return res.status(400).json({ error: 'Invalid id or is_completed boolean' });
  }
  const existing = db.prepare('SELECT * FROM checklist_items WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Checklist item not found' });
  }
  db.prepare('UPDATE checklist_items SET is_completed = ? WHERE id = ?').run(is_completed ? 1 : 0, id);
  const updated = db.prepare('SELECT * FROM checklist_items WHERE id = ?').get(id);
  res.json({ item: updated });
});

// Serve built client in production
const distDir = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Relocation Hub API listening on http://localhost:${PORT}`);
});
