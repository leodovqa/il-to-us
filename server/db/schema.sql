-- SQLite Schema for Israel -> USA Family Relocation Hub

CREATE TABLE IF NOT EXISTS family_profile (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  parents_origin TEXT NOT NULL,
  children_summary TEXT NOT NULL,
  medical_profile TEXT NOT NULL,
  employment_profile TEXT NOT NULL,
  capital_ils INTEGER NOT NULL,
  capital_usd INTEGER NOT NULL,
  english_level TEXT NOT NULL,
  relatives_in_us TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS stories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  origin_city TEXT,
  destination TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  family_size TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  secondary_url TEXT,
  secondary_label TEXT,
  background TEXT NOT NULL,
  housing_and_cars TEXT NOT NULL,
  education_and_community TEXT NOT NULL,
  challenges_and_reality TEXT NOT NULL,
  israel_monthly_cost_ils INTEGER,
  key_takeaway TEXT NOT NULL,
  tags TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS visa_paths (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name_he TEXT NOT NULL,
  name_en TEXT NOT NULL,
  status_type TEXT NOT NULL,
  certainty_level TEXT NOT NULL,
  spouse_work_rights TEXT NOT NULL,
  green_card_path TEXT NOT NULL,
  upfront_cost TEXT NOT NULL,
  requirements_summary TEXT NOT NULL,
  ukraine_israel_note TEXT,
  pros TEXT NOT NULL,
  cons TEXT NOT NULL,
  official_url TEXT
);

CREATE TABLE IF NOT EXISTS layoff_options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visa_status TEXT NOT NULL,
  title TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  legal_mechanism TEXT NOT NULL,
  description TEXT NOT NULL,
  limitations TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS family_sponsorship_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sponsor_status TEXT NOT NULL,
  relative_type TEXT NOT NULL,
  category_code TEXT,
  is_eligible INTEGER NOT NULL,
  wait_time TEXT NOT NULL,
  notes TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name_he TEXT NOT NULL,
  name_en TEXT NOT NULL,
  state_he TEXT NOT NULL,
  metro_he TEXT NOT NULL,
  tier INTEGER NOT NULL,
  rent_min INTEGER NOT NULL,
  rent_max INTEGER NOT NULL,
  total_monthly_min INTEGER NOT NULL,
  total_monthly_max INTEGER NOT NULL,
  state_tax_pct REAL NOT NULL,
  state_tax_label TEXT NOT NULL,
  property_tax_note TEXT NOT NULL,
  fema_risk_level TEXT NOT NULL,
  fema_risk_summary TEXT NOT NULL,
  diabetes_power_impact TEXT NOT NULL,
  antisemitism_summary TEXT NOT NULL,
  jewish_community_level TEXT NOT NULL,
  jewish_community_details TEXT NOT NULL,
  schools_rating TEXT NOT NULL,
  diabetes_hospital TEXT NOT NULL,
  diabetes_hospital_note TEXT NOT NULL,
  highlights TEXT NOT NULL,
  drawbacks TEXT NOT NULL,
  official_url TEXT NOT NULL,
  niche_url TEXT
);

CREATE TABLE IF NOT EXISTS location_budget_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  houston_min INTEGER NOT NULL,
  houston_max INTEGER NOT NULL,
  dallas_min INTEGER NOT NULL,
  dallas_max INTEGER NOT NULL,
  atlanta_min INTEGER NOT NULL,
  atlanta_max INTEGER NOT NULL,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS diabetes_comparisons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section TEXT NOT NULL,
  topic TEXT NOT NULL,
  israel_or_gc TEXT NOT NULL,
  usa_or_citizen TEXT NOT NULL,
  critical_note TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS landing_budget_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  amount_min_usd INTEGER NOT NULL,
  amount_max_usd INTEGER NOT NULL,
  details TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS checklist_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_name TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  is_critical INTEGER NOT NULL DEFAULT 0,
  is_completed INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS official_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS youtube_channels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handle TEXT UNIQUE NOT NULL,
  name_he TEXT NOT NULL,
  creators TEXT NOT NULL,
  channel_url TEXT NOT NULL,
  topics TEXT NOT NULL,
  summary TEXT NOT NULL,
  is_user_recommended INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS niche_db_places (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name_he TEXT NOT NULL,
  name_en TEXT NOT NULL,
  state_code TEXT NOT NULL,
  state_he TEXT NOT NULL,
  county_he TEXT NOT NULL,
  metro_he TEXT NOT NULL,
  niche_overall_grade TEXT NOT NULL,
  niche_crime_grade TEXT NOT NULL,
  niche_schools_grade TEXT NOT NULL,
  niche_family_grade TEXT NOT NULL,
  niche_col_grade TEXT NOT NULL,
  rent_3br_min INTEGER NOT NULL,
  rent_3br_max INTEGER NOT NULL,
  home_buy_median INTEGER NOT NULL,
  housing_supply_note TEXT NOT NULL,
  total_monthly_min INTEGER NOT NULL,
  total_monthly_max INTEGER NOT NULL,
  state_income_tax_pct REAL NOT NULL,
  property_tax_note TEXT NOT NULL,
  fema_nri_rating TEXT NOT NULL,
  fema_area_rating TEXT NOT NULL DEFAULT '',
  fema_county_rating TEXT NOT NULL DEFAULT '',
  fema_county_score REAL NOT NULL DEFAULT 0,
  fema_total_declarations INTEGER NOT NULL DEFAULT 0,
  fema_last_declaration TEXT NOT NULL DEFAULT '',
  fema_combined_severity INTEGER NOT NULL DEFAULT 0,
  fema_hazard_breakdown TEXT NOT NULL DEFAULT '{}',
  fema_hazards_note TEXT NOT NULL,
  power_grid_operator TEXT NOT NULL,
  power_grid_reliability TEXT NOT NULL,
  t1d_hospital_name TEXT NOT NULL,
  t1d_hospital_drive_min INTEGER NOT NULL,
  t1d_supplies_access TEXT NOT NULL,
  qa_remote_and_local_jobs TEXT NOT NULL,
  spouse_parttime_jobs TEXT NOT NULL,
  recommended_car_model TEXT NOT NULL,
  car_buy_budget_usd INTEGER NOT NULL,
  car_insurance_monthly_min INTEGER NOT NULL,
  car_insurance_monthly_max INTEGER NOT NULL,
  car_notes TEXT NOT NULL,
  jewish_israeli_community TEXT NOT NULL,
  peace_of_mind_score INTEGER NOT NULL,
  highlights TEXT NOT NULL,
  watchouts TEXT NOT NULL,
  niche_url TEXT NOT NULL,
  zillow_url TEXT NOT NULL,
  fema_url TEXT NOT NULL
);
