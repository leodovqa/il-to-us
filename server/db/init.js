const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = path.join(__dirname, 'relocation.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

function initDb({ force = false } = {}) {
  if (force && fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
  }

  const db = new DatabaseSync(DB_PATH);
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  db.exec(schema);

  const existing = db.prepare('SELECT COUNT(*) AS cnt FROM family_profile').get();

  const insertYt = db.prepare(`
    INSERT OR IGNORE INTO youtube_channels (handle, name_he, creators, channel_url, topics, summary, is_user_recommended)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertYt.run(
    '@-therashttys',
    'The Rashtty\'s (משפחת רשתי)',
    'זוג / משפחה ישראלית',
    'https://www.youtube.com/@-therashttys',
    'רישיון נהיגה,שכירות וקניית בית,רכב,בדיקות שטח',
    'ערוץ מומלץ המסביר שלב-אחר-שלב איך בוצע הרילוקיישן מישראל לארה״ב: הוצאת רישיון נהיגה אמריקאי, איך לשכור או לקנות בית, רכישת רכב, מה לבדוק ואיפה לבדוק.',
    1
  );
  insertYt.run(
    '@or.yochanan',
    'אור יוחנן — רילוקיישן לטקסס (Or Yochanan)',
    'אור יוחנן (יוצא הייטק וטכניון, Austin Connections Group)',
    'https://www.youtube.com/@or.yochanan',
    'טקסס,שכונות ובתי ספר,קניית/שכירת בית,ראיונות משפחות מישראל',
    'ערוץ בעברית המתמקד במשפחות הייטק ישראליות שעוברות לטקסס (אוסטין/פרברים): סיורי בתים ושכונות, בתי ספר, עלויות מחיה אמיתיות וראיונות עם ישראלים שעשו את המעבר.',
    0
  );
  insertYt.run(
    '@FoolyLiving',
    'FoolyLiving (הדר ואנדראה)',
    'הדר (ישראלי) ואנדראה (אמריקאית) + 2 ילדים',
    'https://www.youtube.com/@FoolyLiving',
    'מעבר משפחתי,פרידה מישראל,הקמת בית,חיי יומיום ובריאות',
    'וולוג משפחתי ותיק של זוג ישראלי-אמריקאי שחי בישראל כ-10 שנים ותיעד את המעבר המלא עם הילדים לארה״ב, הקמת הבית החדש והתמודדות עם מעברים וצרכים רפואיים.',
    0
  );
  insertYt.run(
    '@PerspectivesTvIl',
    'פרספקטיבה — ערוץ ישראלי בצפון אמריקה',
    'PerspectivesTv',
    'https://www.youtube.com/@PerspectivesTvIl',
    'קהילות ישראליות,מיאמי וניו יורק,צופים,חינוך וביטחון',
    'כתבות שטח, ראיונות וסיפורים אישיים של משפחות ישראליות המתגוררות בארה״ב (מיאמי, ניו יורק ועוד), חיי קהילה, שבטי צופים והתאקלמות.',
    0
  );

  if (existing.cnt > 0 && !force) {
    return db;
  }

  // Clear all tables if re-seeding
  const tables = [
    'family_profile',
    'stories',
    'visa_paths',
    'layoff_options',
    'family_sponsorship_rules',
    'locations',
    'location_budget_items',
    'diabetes_comparisons',
    'landing_budget_items',
    'checklist_items',
    'official_sources',
  ];
  for (const t of tables) {
    db.exec(`DELETE FROM ${t}`);
  }

  // 1. Family Profile
  db.prepare(`
    INSERT INTO family_profile (
      id, title, parents_origin, children_summary, medical_profile,
      employment_profile, capital_ils, capital_usd, english_level, relatives_in_us
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    1,
    'פרופיל משפחת היעד (4 נפשות)',
    'זוג הורים ילידי אוקראינה שעלו לישראל בילדות ושירתו בצה"ל (זכאים להגרלת DV על בסיס אוקראינה עם 2 כרטיסים בשנה)',
    '2 בנות ילידות ישראל (כולל בת כמעט 9)',
    'סוכרת סוג 1 (T1D) לבת ה-9 — מטופלת כיום בישראל עם Omnipod 5 + FreeStyle Libre Plus ומקבלת גמלת ילד נכה (~3,800 ש"ח/חודש)',
    'עובד הייטק בחברה עם סניף/נוכחות בארה"ב (פוטנציאל L-1 או הגשת DV Lottery במקביל)',
    500000,
    135000,
    'אחד ההורים מבין ועובד מול אמריקאים; בת הזוג עם אנגלית בסיסית (אינו מהווה מכשול לגרין קארד)',
    'קרובים רחוקים (דוד וכו\') שחיים שנים בארה"ב ואזרחים — לא יכולים למשוך ישירות, אך יכולים לשמש כ-Joint Sponsor (I-864) בעת הצורך'
  );

  // 2. Stories
  const insertStory = db.prepare(`
    INSERT INTO stories (
      slug, title, origin_city, destination, timeframe, family_size,
      source_name, source_url, secondary_url, secondary_label,
      background, housing_and_cars, education_and_community,
      challenges_and_reality, israel_monthly_cost_ils, key_takeaway, tags
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertStory.run(
    'rosh-haayin-atlanta',
    'משפחה עם 4 ילדים שעברה מראש העין לאטלנטה, ג\'ורג\'יה',
    'ראש העין',
    'אטלנטה, ג\'ורג\'יה',
    '2025–2026 (פורסם אפריל 2026)',
    'זוג הורים + 4 ילדים',
    'Reddit r/Israel',
    'https://www.reddit.com/r/Israel/comments/1sd0gam/finances_and_war_lets_talk_about_it/',
    null,
    null,
    'הורה שעבד כ-12 שנים בסטארט-אפים ישראליים. בעקבות גלי פיטורים וצמצומים אחרי אוקטובר 2023, מחלקתו עברה לארה"ב והמשרדים בישראל נסגרו. אחרי חצי שנה של חיפוש עבודה ושחיקת חסכונות (הוצאה חודשית של ~25,000 ש"ח בישראל: 11,000 ש"ח גנים, 8,000 ש"ח משכנתא וחשבונות עם רכב אחד), המשפחה החליטה לעבור.',
    'שוכרים בית פרטי מרווח עם חצר לילדים. רכשו שני רכבים משומשים במזומן מכיוון שהתחבורה הציבורית באטלנטה אינה מאפשרת התנהלות יומיומית למשפחה.',
    'כדי להימנע משכר לימוד אסטרונומי בבתי ספר יהודיים פרטיים ($15,000–$35,000 לילד בשנה), רשמו את הילדים לבית ספר ציבורי חינמי בשכונה עם ריכוז יהודי גבוה.',
    'האב עדיין מחפש עבודה מלאה בהייטק האמריקאי ומתפרנס זמנית מנהיגת Uber ומשלוחים; האם בבית עם הילדים. למרות שההכנסה כמחצית משכר ההייטק בישראל, רמת החיים החומרית, גודל הבית והשקט הנפשי גבוהים יותר. הקושי המרכזי: ריחוק מסבא, סבתא וחברים בארץ.',
    25000,
    'חינוך ציבורי בשכונה יהודית חזקה + 2 רכבים משומשים במזומן מאפשרים רמת חיים רגועה גם בתקופת מעבר.',
    'אטלנטה,הייטק,4 ילדים,מזומן,חינוך ציבורי'
  );

  insertStory.run(
    'san-diego-teens',
    'משפחה עם בני נוער שעברה לסן דייגו, קליפורניה',
    'ישראל',
    'סן דייגו, קליפורניה',
    'פורסם פברואר 2026',
    'זוג הורים + 2 מתבגרים (גילאי 14 ו-17)',
    'בלוג ארץ חדשה',
    'https://relocating.co.il/relocating-to-san-diego-us/',
    'https://relocating.co.il/relocation-guide-to-the-usa/',
    'מדריך רילוקיישן פרקטי מהשטח - ארץ חדשה',
    'ראיון אישי עם הילדים (שיר ועידן) ומדריך מעבר מפורט שנכתב מהשטח על חוויית הנחיתה וההשתלבות של בני נוער בישראלית-אמריקאית.',
    'מעבר לשגרה פרברית שקטה וקבועה בסן דייגו, קליפורניה.',
    'האתגר החברתי דרש מאמץ אקטיבי: הצטרפות לחוגים, קבוצות ספורט, צופי צבר ("שבט צופים" ישראלי) ופעילויות נוער של ארגון הקהילה הישראלית-אמריקאית (IAC) ליצירת מעגל חברים דובר עברית לצד בית הספר.',
    'המתבגרים מתארים מעבר מחיים עמוסי לחץ ושינויים בישראל לשגרה שקטה וקבועה, אך מדגישים שההשתלבות החברתית לא קורה מעצמה ודורשת יוזמה.',
    null,
    'מסגרות כמו צופי צבר ו-IAC הן עוגן חברתי קריטי לילדים ובני נוער בחודשים הראשונים.',
    'סן דייגו,קליפורניה,בני נוער,צופי צבר,IAC'
  );

  insertStory.run(
    'houston-vs-ca-ny',
    'דיון מהגרים ישראלים: יוסטון מול קליפורניה וניו יורק',
    'ישראל',
    'יוסטון (טקסס) מול CA ו-NY',
    'ינואר 2026',
    'דיון קהילתי רחב של משפחות',
    'Reddit r/Israel',
    'https://www.reddit.com/r/Israel/comments/1q9u5q7/moving_from_israel_to_the_us/',
    null,
    null,
    'דיון עכשווי בקהילת הישראלים ברדיט על תכנון יעדי הגירה ומחיה למשפחות ישראליות ללא גב כלכלי קיצוני.',
    'ביוסטון/טקסס מחירי הנדל"ן מאפשרים שכירת או רכישת בית פרטי בעלויות סבירות, לעומת קליפורניה וניו יורק שבהן השכירות והמחיה שוחקות חיסכון.',
    'ביוסטון קיימת קהילה ישראלית ויהודית ענפה סביב ה-JCC, בתי כנסת, חנויות כשרות ומוצרים ישראליים.',
    'הבדל קריטי במיסוי: בטקסס 0% מס הכנסה מדינתי (State Income Tax), בעוד קליפורניה וניו יורק מטילות מס מדינתי גבוה ומחייבות חבילת שכר גדולה מאוד של Big Tech כדי לחסוך.',
    null,
    'ללא חבילת Big Tech קיצונית, טקסס (יוסטון/דאלאס) מציעה יחס עלות-תועלת עדיף משמעותית על קליפורניה וניו יורק.',
    'יוסטון,טקסס,קליפורניה,ניו יורק,מיסוי'
  );

  // 3. Visa Paths
  const insertVisa = db.prepare(`
    INSERT INTO visa_paths (
      code, name_he, name_en, status_type, certainty_level,
      spouse_work_rights, green_card_path, upfront_cost,
      requirements_summary, ukraine_israel_note, pros, cons, official_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertVisa.run(
    'DV_LOTTERY',
    'הגרלת הגרין קארד',
    'Diversity Immigrant Visa (DV Lottery)',
    'תושבות קבע ישירה (גרין קארד מלא לכל המשפחה)',
    'הסתברותי (~1% לישראלים; כ-2% עם 2 טפסים)',
    'בן/בת הזוג מקבלים גרין קארד עצמאי וללא תלות במעסיק',
    'מיידי — מגיעים לארה"ב כבר עם גרין קארד לפני הטיסה',
    'הרשמה חינמית לחלוטין. אגרות + בדיקות רפואיות בשגרירות (~$500–$700 לאדם) רק במקרה של זכייה',
    'ארץ לידה זכאית + 12 שנות לימוד (בגרות מלאה) או שנתיים ניסיון במקצוע מיומן (O*NET Job Zone 4+ / SVP 7.0+). רישום מלא של בן זוג וכל הילדים מתחת לגיל 21 + תמונות עדכניות ב-6 חודשים.',
    'שני ההורים ילידי אוקראינה (זכאית) והבנות ילידות ישראל (נלוות). מותר וחוקי להגיש 2 טפסים בכל אוקטובר (פעם אחת הבעל ראשי + פעם האישה ראשית), מה שמכפיל את הסיכוי! שירות צבאי בצה"ל ואנגלית בסיסית אינם פוסלים.',
    'חירות תעסוקתית מלאה, אפשרות לדמי אבטלה, מסלול לאזרחות תוך 5 שנים (כולל אוטומטית לילדים קטינים), אין תלות במעסיק.',
    'תלוי במזל (הגרלה שנתית באוקטובר); דורש הקפדה טכנית מוחלטת בטופס למניעת פסילה.',
    'https://dvprogram.state.gov/'
  );

  insertVisa.run(
    'L1',
    'ניוד פנים-ארגוני (עבודה)',
    'L-1A (Managers) / L-1B (Specialized Knowledge)',
    'אשרת עבודה זמנית (Non-immigrant עם Dual Intent)',
    'דטרמיניסטי — תלוי בהחלטת החברה וותק של שנה רצופה',
    'בן/בת הזוג מקבלים ויזת L-2S ומורשים לעבוד בכל עבודה חוקית ללא ספונסר נפרד',
    'המעסיק יכול להתחיל תהליך גרין קארד (EB-1C / EB-2 / EB-3) תוך כדי השהות בארה"ב',
    'ממומן כולו על ידי המעסיק לפי חוק',
    'עבודה של לפחות שנה רצופה ב-3 השנים האחרונות בחברה שיש לה סניף פעיל בישראל ובארה"ב.',
    'מתאים מאוד לעובד ההייטק במשפחה אם החברה תאשר רילוקיישן לסניף האמריקאי; מומלץ להגיש DV Lottery במקביל בכל שנה.',
    'מסלול ודאי וממומן, בן/בת זוג מקבלים אישור עבודה אוטומטי (L-2S), Dual Intent מאפשר תהליך גרין קארד.',
    'קשור בלעדית למעסיק (אין ניידות פשוטה כמו H-1B); במקרה פיטורים נכנס שעון 60-Day Grace Period.',
    'https://www.uscis.gov/working-in-the-united-states/temporary-workers/l-1a-intracompany-transferee-executive-or-manager'
  );

  insertVisa.run(
    'E2',
    'משקיע או עובד חיוני (אמנה)',
    'E-2 Treaty Investor / Essential Employee',
    'אשרת משקיע/עובד זמנית מתחדשת (Non-immigrant)',
    'בינוני-גבוה — דורש השקעת הון או חברה בבעלות ישראלית (50%+)',
    'בן/בת הזוג מקבלים אשרת עבודה פתוחה בארה"ב',
    'לא מוביל ישירות לגרין קארד (נדרש מסלול נפרד)',
    'השקעה עסקית מהותית החל מ-$80,000–$100,000+ בעסק פעיל, או העסקה כעובד חיוני בחברה בבעלות ישראלית',
    'מאז כניסת ישראל לאמנת E-2 ב-2019: השקעה בעסק אמריקאי מייצר משרות, או תפקיד ניהולי/ייחודי בחברה בבעלות 50%+ אזרחים ישראלים.',
    'רלוונטי אם בוחרים לרכוש/להקים עסק או להצטרף לחברה בבעלות ישראלית בארה"ב (כולל כפתרון חירום לאחר פיטורים מ-L-1).',
    'פתוח ללא קשר משפחתי, אפשרות לחדש ללא הגבלה כל עוד העסק פעיל.',
    'אינו מסלול גרין קארד ישיר; סיכון הון אם מקימים עסק עם תקציב של ~$135k בלבד.',
    'https://www.uscis.gov/working-in-the-united-states/temporary-workers/e-2-treaty-investors'
  );

  insertVisa.run(
    'O1',
    'יכולת יוצאת דופן',
    'O-1 Extraordinary Ability',
    'אשרת עבודה זמנית (Non-immigrant)',
    'תלוי תיק הוכחות — מצריך תיעוד הישגים בולטים',
    'בן/בת הזוג (O-3) אינם רשאים לעבוד בארה"ב',
    'מאפשר מעבר עצמאי/מעסיק ל-EB-1A או EB-2 NIW',
    'עלויות עו"ד/אגרות (~$4,000–$8,000), אפשרות ל-Premium Processing תוך 15 ימי עסקים',
    'הוכחת הישגים בולטים בהייטק/מחקר: שכר גבוה משמעותית מהממוצע, תפקידים מרכזיים, פרסומים, פטנטים או סיקור תקשורתי.',
    'כלי הצלה מצוין אם מפוטרים מוויזת L-1 ומוצאים מעסיק אמריקאי חדש תוך 60 יום.',
    'אין מכסה שנתית (בניגוד ל-H-1B), אישור מהיר ב-Premium Processing.',
    'רף הוכחה גבוה; בן/בת הזוג על O-3 לא יכולים לעבוד.',
    'https://www.uscis.gov/working-in-the-united-states/temporary-workers/o-1-visa-individuals-with-extraordinary-ability-or-achievement'
  );

  // 4. Layoff Options
  const insertLayoff = db.prepare(`
    INSERT INTO layoff_options (
      visa_status, title, timeframe, legal_mechanism, description, limitations
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertLayoff.run(
    'Green Card',
    'גרין קארד — חסינות מוחלטת מפיטורים',
    'ללא הגבלת זמן',
    'Permanent Resident Status',
    'המעמד בלתי תלוי לחלוטין במעסיק. אפשר לחפש כל עבודה, להקים עסק, או לקחת הפסקה. זכאים לדמי אבטלה מדינתיים (Unemployment Insurance) אם שולמו מסים בתקופה מספקת.',
    'לשמור על תושבות בארה"ב ולא לשהות בחו"ל מעל 6 חודשים ברציפות.'
  );

  insertLayoff.run(
    'L-1 (Grace Period)',
    'תקופת חסד 60 יום + חובת מימון טיסה חזרה',
    'עד 60 יום קלנדריים מסיום העבודה הרשמי (או פקיעת I-94)',
    '8 CFR 214.1(l)(2)',
    'אין גירוש מיידי. השהות של כל המשפחה חוקית ל-60 יום כדי למצוא פתרון או לארוז. אם המעסיק פיטר לפני תום הוויזה, הוא מחויב חוקית לממן טיסה חזרה לישראל.',
    'אסור לעבוד במהלך 60 הימים ללא אישור עבודה חדש.'
  );

  insertLayoff.run(
    'L-1 (אפשרות 1)',
    'שינוי סטטוס לתייר (B-1/B-2)',
    'הגשה לפני תום 60 הימים — מעניק 3–6 חודשי המתנה',
    'Form I-539 (Period of Authorized Stay)',
    'ברגע שהטופס נקלט ב-USCIS, המשפחה נמצאת בשהייה מורשית חוקית ל-3–6 חודשים. מאפשר להתראיין פיזית לחברות חדשות או להתארגן בנחת.',
    'אסור לעבוד בזמן ההמתנה; אם מוצאים ספונסר חדש מגישים שינוי סטטוס נוסף.'
  );

  insertLayoff.run(
    'L-1 (אפשרות 2)',
    'מעבר למעסיק חדש תחת ויזת O-1 / E-2 / H-1B',
    'בתוך 60 הימים (או ב-Premium Processing של 15 יום)',
    'New Employer Sponsorship',
    'מעסיק חדש לא יכול "להעביר" L-1, אבל יכול להגיש O-1 (מומחיות), E-2 (חברה בבעלות ישראלית 50%+), או H-1B (אוניברסיטה/מכון מחקר פטור ממכסה או זכייה קודמת).',
    'בוויזת O-1 בת הזוג (O-3) מאבדת את היתר העבודה שהיה לה ב-L-2S.'
  );

  insertLayoff.run(
    'L-1 (אפשרות 3)',
    'ניוד תהליך גרין קארד קיים (AC21)',
    'אם הוגש I-140 וטופס I-485 תלוי ועומד מעל 180 יום',
    'AC21 Portability',
    'החוק מאפשר להעביר את בקשת הגרין קארד למעסיק חדש באותו תחום עיסוק מבלי שהתהליך יימחק.',
    'לא רלוונטי אם פוטרתם בשנה הראשונה לפני הגשת I-485.'
  );

  insertLayoff.run(
    'L-1 (אפשרות 4)',
    'מעבר לסטטוס סטודנט (F-1) או משא ומתן על תאריך סיום',
    'לפני ניתוק יחסי העבודה / תום 60 יום',
    'F-1 COS / Severance Unpaid Leave',
    'אפשר להירשם ללימודים (F-1) או לבקש מהמעסיק להישאר על ה-Payroll בחופשה ללא תשלום (Unpaid Leave) / פריסת Severance לחודש-חודשיים כדי לדחות את תחילת שעון ה-60 יום.',
    'סטודנט F-1 כרוך בשכר לימוד ומגבלות עבודה (CPT/OPT).'
  );

  // 5. Family Sponsorship Rules
  const insertFam = db.prepare(`
    INSERT INTO family_sponsorship_rules (
      sponsor_status, relative_type, category_code, is_eligible, wait_time, notes
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertFam.run('בעל גרין קארד', 'בן/בת זוג וילדים רווקים', 'F2A / F2B', 1, 'כשנתיים–מספר שנים', 'הקרובים היחידים שבעל גרין קארד יכול לבקש עבורם איחוד משפחות (I-130).');
  insertFam.run('בעל גרין קארד', 'הורים (אמא/אבא)', 'לא זכאי', 0, 'בלתי אפשרי עד לאזרחות', 'בעל גרין קארד אינו יכול להגיש בקשה עבור הוריו. יש להמתין 5 שנים עד לקבלת אזרחות.');
  insertFam.run('בעל גרין קארד', 'אחים ואחיות', 'לא זכאי', 0, 'בלתי אפשרי עד לאזרחות', 'בעל גרין קארד אינו יכול להגיש בקשה עבור אחיו.');
  insertFam.run('אזרח אמריקאי (מעל 21)', 'הורים (אמא/אבא)', 'IR-5 (Immediate Relative)', 1, '1–1.5 שנים מרגע האזרחות (~6–7 שנים מהנחיתה)', 'אין מכסה שנתית ואין תור המתנה. מתבצע מול השגרירות בישראל.');
  insertFam.run('אזרח אמריקאי (מעל 21)', 'אחים ואחיות', 'F4', 1, '15–22 שנים', 'מכסה שנתית מוגבלת ועומס עולמי אדיר — לא ריאלי לטווח קצר. עדיף לאח לנסות DV Lottery או L-1/H-1B/O-1.');
  insertFam.run('קרובים רחוקים (דוד/בן דוד אזרח)', 'אחיינים / בני דודים', 'אין קטגוריה', 0, 'אין מסלול ישיר', 'דוד יכול לבקש את אחיו (ההורה שלך, F4: 15–22 שנה), אך ילד נשוי ובוגר אינו נכלל. סיוע אפשרי: Joint Sponsor כספי (I-864) או משרה אמיתית בחברה שלו תחת בדיקת PERM מחמירה.');

  // 6. Locations (6 Cities/Suburbs)
  const insertLoc = db.prepare(`
    INSERT INTO locations (
      slug, name_he, name_en, state_he, metro_he, tier,
      rent_min, rent_max, total_monthly_min, total_monthly_max,
      state_tax_pct, state_tax_label, property_tax_note,
      fema_risk_level, fema_risk_summary, diabetes_power_impact,
      antisemitism_summary, jewish_community_level, jewish_community_details,
      schools_rating, diabetes_hospital, diabetes_hospital_note,
      highlights, drawbacks, official_url, niche_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertLoc.run(
    'houston',
    'יוסטון (קייטי / שוגר לנד)',
    'Katy / Sugar Land, TX',
    'טקסס',
    'מטרופולין יוסטון',
    1,
    2300, 2700, 6220, 7820,
    0.0, '0% (ללא מס הכנסה מדינתי)',
    'ארנונה גבוהה בקניית בית (~2%–2.5% בשנה), אך לא מורגשת ישירות בשכירות.',
    'גבוה מאוד (Very High)',
    'הוריקנים, הצפות וגלי חום קיצוניים (1% הגבוה ב-FEMA NRI). חובה לבדוק FEMA Flood Map שהבית מחוץ ל-100-Year Flood Plain.',
    'קריטי לסוכרת: הפסקות חשמל של 3–7 ימים בסופות מסכנות מלאי אינסולין במקרר. חובה לרכוש תחנת כוח ניידת (Power Station) או גנרטור.',
    'פשיעה נמוכה בפרברים; חיכוך אנטישמי מתרכז באוניברסיטאות וב-Downtown. חוקי Anti-BDS חזקים ואבטחת מוסדות יהודיים ע"י המשטרה.',
    'גדולה ומבוססת',
    'ריכוז מרכזי ב-Meyerland / Bellaire עם JCC, גני ילדים, מחלקות כשרות ענקיות ב-H-E-B ומוצרים מישראל.',
    'גבוה בפרברי Katy ו-Sugar Land',
    'Texas Children\'s Hospital',
    'המרכז הרפואי לילדים הגדול בארה"ב — מדורג #1–2 בארה"ב בסוכרת ואנדוקרינולוגיה של ילדים. חיבור ישיר ל-Omnipod ו-Libre.',
    'המשתלמת ביותר מבין ה-3, 0% מס מדינתי, רשת H-E-B זולה, בית החולים המוביל לסוכרת ילדים.',
    'סיכון הוריקנים והפסקות חשמל, קיץ חם ולח שמייקר מיזוג, חובה לבדוק מפות שיטפונות.',
    'https://www.cityofkaty.com/',
    'https://www.niche.com/places-to-live/katy-fort-bend-tx/'
  );

  insertLoc.run(
    'dallas',
    'דאלאס (פלאנו / פריסקו)',
    'Plano / Frisco, TX',
    'טקסס',
    'דאלאס-פורט וורת\' (DFW)',
    1,
    2500, 3000, 6570, 8310,
    0.0, '0% (ללא מס הכנסה מדינתי)',
    'ארנונה גבוהה בקניית בית (~2%–2.5% בשנה), בשכירות נהנים מ-0% מס הכנסה מדינתי.',
    'גבוה (Relatively/Very High)',
    'שולי סמטת הטורנדו (0.1% העליון ב-FEMA לברד וטורנדו) + סופות קרח בחורף. סופות נקודתיות עם חדרי מחסה פנימיים בבתים.',
    'פחות הצפות מיוסטון, אך עדיין מומלץ גיבוי חשמל קל למקרר אינסולין בסופות קרח/טורנדו + ביטוח גגות וברד.',
    'פשיעה אלימה אפסית כמעט בפרברים; אפס אנטישמיות אלימה ברחובות. צופי צבר ומוסדות קהילה פועלים בביטחון תחת אבטחה מקומית.',
    'בינונית-גדולה ופעילה',
    'קהילה ישראלית פעילה בצפון דאלאס (Plano/Frisco), קבוצות "ישראלים בדאלאס", סניף צופי צבר ומוסדות חינוך.',
    'GreatSchools 9–10 (מהגבוהים בארה"ב)',
    'Children\'s Medical Center Dallas',
    'מחלקת אנדוקרינולוגיה וסוכרת ילדים חזקה מאוד במטרופולין עם מעטפת ביטוחית רחבה.',
    'מרכז הייטק וטלקום ענק (קל להחליף עבודה בלי לעבור דירה), 0% מס מדינתי, בתי ספר מעולים.',
    'סיכון ברד וטורנדו (FEMA), אגרות כבישים (NTTA Tolls) יקרות של $120–$220 בחודש.',
    'https://www.plano.gov/',
    'https://www.niche.com/places-to-live/plano-collin-tx/'
  );

  insertLoc.run(
    'atlanta',
    'אטלנטה (אלפארטה / ג\'ונס קריק)',
    'Alpharetta / Johns Creek, GA',
    'ג\'ורג\'יה',
    'צפון מטרופולין אטלנטה',
    1,
    2500, 2950, 6500, 8120,
    5.39, 'כ-5.39% מס הכנסה מדינתי',
    'מחירי בתים ושכירות סבירים, אך המס המדינתי מקזז ~$450–$650 נטו בחודש ($5k–$6k בשנה על שכר $120k).',
    'בינוני (Moderate)',
    'היציב והבטוח ביותר מבין ה-3 הראשונים. רחוק מהאוקיינוס (ללא הוריקנים ישירים). סיכון עיקרי: ענפי עצים על כבלי חשמל בסופות רעמים.',
    'סיכון נמוך להפסקות חשמל ממושכות לעומת יוסטון; סוללת גיבוי קטנה מספיקה.',
    'פרברים עשירים ובטוחים עם אוכלוסיית הייטק מגוונת. נרשמו מקרים בודדים של עלונים אנטישמיים בלילות; בינואר 2024 ג\'ורג\'יה אימצה את חוק IHRA (HB 30) להחמרת ענישה.',
    'גדולה וענפה',
    'ריכוז יהודי וישראלי גדול ב-Alpharetta, Johns Creek, Dunwoody ו-East Cobb עם בתי ספר ציבוריים מבוקשים.',
    'חינוך ציבורי מדורג גבוה מאוד',
    'Children\'s Healthcare of Atlanta (CHOA)',
    'מערך רפואת ילדים גדול ומבוסס באטלנטה עם מחלקות אנדוקרינולוגיה ייעודיות.',
    'סביבה ירוקה ומיוערת, 4 עונות מאוזנות, מעט אסונות טבע, קהילה ישראלית גדולה.',
    '5.39% מס הכנסה מדינתי, פקקים, ותחבורה ציבורית חלשה (חובה 2 רכבים).',
    'https://www.alpharetta.ga.us/',
    'https://www.niche.com/places-to-live/alpharetta-fulton-ga/'
  );

  insertLoc.run(
    'beachwood',
    'ביצ\'ווד, אוהיו (פרבר קליבלנד)',
    'Beachwood, OH',
    'אוהיו',
    'מזרח קליבלנד (20 דק\' מהמרכז)',
    2,
    2100, 2600, 5600, 6400,
    3.5, 'כ-3.5% מס הכנסה מדינתי',
    'עלות דיור ומחיה זולה משמעותית ($5,600–$6,400 סה"כ לחודש).',
    'נמוך מאוד (Very Low)',
    'מחוץ לרצועת ההוריקנים והטורנדו; ללא רעידות אדמה או שריפות יער. חורף מושלג עם פינוי שלג מנוסה ותשתיות חשמל יציבות.',
    'תשתיות חשמל יציבות מאוד, סיכון נמוך במיוחד לאובדן קירור לאינסולין.',
    'אחד הריכוזים היהודיים הבטוחים בארה"ב; פשיעה כמעט אפסית ושיתוף פעולה הדוק בין הקהילה למשטרה המקומית.',
    'גדולה מאוד (80%+ יהודים)',
    'למעלה מ-80% מתושבי הפרבר יהודים/בעלי זיקה; Mandel JCC ענק, עשרות בתי כנסת, סופרים כשרים ומוצרים מישראל.',
    'A+ ב-Niche / GreatSchools 9–10',
    'Cleveland Clinic Children\'s',
    '15–20 דקות נסיעה ל-Cleveland Clinic — מהמובילים בעולם באנדוקרינולוגיה וסוכרת ילדים.',
    'הזול ביותר מבין ה-6, סיכון FEMA נמוך מאוד, רוב יהודי מובהק, רפואה עולמית צמודה.',
    'חורף קר ומושלג, שוק הייטק מקומי קטן יותר מדאלאס.',
    'https://www.beachwoodohio.com/',
    null
  );

  insertLoc.run(
    'carmel',
    'כרמל, אינדיאנה (פרבר אינדיאנפוליס)',
    'Carmel, IN',
    'אינדיאנה',
    'צפון אינדיאנפוליס',
    2,
    2200, 2700, 5800, 6600,
    3.05, 'כ-3.05% מס שטוח',
    'עלויות מחיה נגישות מאוד עם איכות תשתיות מהגבוהות במדינה.',
    'נמוך עד מתון (Relatively Low)',
    'מרוחקת מהאוקיינוס ומסופות טרופיות; תשתיות חשמל תת-קרקעיות בהשקעת מיליארדים וכיכרות תנועה שמפחיתות תאונות.',
    'רשת חשמל תת-קרקעית מודרנית מפחיתה דרמטית הפסקות חשמל ממושכות.',
    'פשיעה אלימה מהנמוכות בארה"ב; ללא גילויי אנטישמיות גלויים ברחובות.',
    'קטנה–בינונית ומגובשת',
    'קהילה יהודית פעילה בכרמל ובצפון אינדיאנפוליס (Congregation Shaarey Tefilla, JCC סמוך ותוכניות נוער).',
    'מופת חינוכי ארצי (Carmel High School)',
    'Riley Children\'s Health',
    'מרכז רפואת ילדים מוביל באינדיאנה עם מחלקת סוכרת ילדים ייעודית.',
    'נבחרת באופן קבוע כ"עיר הטובה למשפחות בארה"ב", תשתיות תת-קרקעיות, עלויות נמוכות.',
    'קהילה ישראלית קטנה יותר מדאלאס/אטלנטה/צ\'רי היל.',
    'https://www.carmel.in.gov/',
    null
  );

  insertLoc.run(
    'cherry-hill',
    'צ\'רי היל, ניו ג\'רזי (פרבר פילדלפיה)',
    'Cherry Hill, NJ',
    'ניו ג\'רזי',
    'דרום ניו ג\'רזי (15 דק\' מפילדלפיה)',
    2,
    2600, 3100, 6700, 7600,
    5.9, 'כ-5.5%–6.37% מס מדינתי',
    'יקרה מעט מאוהיו ואינדיאנה, אך זולה משמעותית מצפון ניו ג\'רזי וניו יורק.',
    'נמוך (Low)',
    'מיקום פנים-יבשתי ללא הצפות חוף מהוריקנים וללא סופות טורנדו משמעותיות; 4 עונות מתונות יחסית.',
    'סיכון אקלימי נמוך ויציב; קרבה מיידית למרכז רפואי עולמי.',
    'אזור בטוח מאוד ללא הפגנות אלימות או חיכוך אנטישמי יומיומי.',
    'גדולה מאוד ומגובשת',
    'מוקד ישראלי ויהודי ותיק: Katz JCC מהגדולים בחוף המזרחי, בתי כנסת מכל הזרמים, מסעדות וסניף צופי צבר דוברי עברית.',
    'חינוך ציבורי חזק ומבוסס',
    'CHOP (Children\'s Hospital of Philadelphia)',
    'מעבר לגשר בפילדלפיה — מדורג #1–2 בכל ארה"ב ברפואת ילדים, אנדוקרינולוגיה וסוכרת נעורים.',
    'גישה ל-CHOP, קהילה ישראלית ענקית וצופי צבר, סיכון טבע נמוך, קרוב לניו יורק ופילדלפיה.',
    'מס הכנסה מדינתי גבוה יחסית (5.5%–6.37%) ושכירות גבוהה מאוהיו/אינדיאנה.',
    'https://www.chnj.gov/',
    null
  );

  // 7. Location Budget Items (Houston vs Dallas vs Atlanta)
  const insertBudget = db.prepare(`
    INSERT INTO location_budget_items (
      category, houston_min, houston_max, dallas_min, dallas_max, atlanta_min, atlanta_max, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertBudget.run('שכירות (בית פרטי 3–4 חדרים)', 2300, 2700, 2500, 3000, 2500, 2950, 'שכונות עם חינוך ציבורי מעולה (Katy/Plano/Alpharetta)');
  insertBudget.run('חשבונות (חשמל, מים, גז, אינטרנט)', 380, 480, 350, 440, 320, 400, 'ביוסטון המיזוג בקיץ מייקר את החשמל');
  insertBudget.run('מזון וסופרמרקט (4 נפשות)', 1050, 1250, 1100, 1300, 1150, 1350, 'רשת H-E-B בטקסס מוזילה את סל הקניות');
  insertBudget.run('תחבורה (2 רכבים: דלק + ביטוח)', 600, 750, 600, 750, 600, 750, 'אחרי המרת רישיון נהיגה למקומי להוזלת הביטוח');
  insertBudget.run('אגרות כבישים (Tolls)', 40, 90, 120, 220, 30, 70, 'בצפון דאלאס רשת NTTA מוסיפה $150–$250 בשימוש יומי');
  insertBudget.run('ביטוח בריאות + תרופות (השתתפות)', 800, 1050, 800, 1050, 800, 1050, 'פוליסת מעסיק + סבסוד/Copay למכשור סוכרת');
  insertBudget.run('חוגים, צהרונים ופעילויות ילדים', 450, 700, 500, 750, 500, 750, 'חוגים, ספורט, צופי צבר / JCC');
  insertBudget.run('הוצאות שונות, ביגוד ופנאי', 600, 800, 600, 800, 600, 800, 'שונות חודשיות למשפחה');

  // 8. Diabetes & Healthcare Comparisons
  const insertDiab = db.prepare(`
    INSERT INTO diabetes_comparisons (section, topic, israel_or_gc, usa_or_citizen, critical_note)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertDiab.run('israel_vs_usa', 'קצבה כספית חודשית', 'ישראל: גמלת ילד נכה (~3,800+ ש"ח/חודש מביטוח לאומי)', 'ארה"ב: 0$ קצבה ישירה לבעלי ויזות עבודה (L-1/E-2/H-1B)', 'ביטוח לאומי מפסיק לשלם את הגמלה לאחר 3 חודשים ממועד היציאה מהארץ! (תוכנית SSI פדרלית מיועדת לאזרחים מעוטי יכולת בלבד).');
  insertDiab.run('israel_vs_usa', 'כיסוי מחלה קיימת (T1D)', 'ישראל: סל בריאות ממלכתי אוניברסלי', 'ארה"ב: ביטוח מעסיק מסחרי (ACA / Obamacare)', 'על פי חוק ה-ACA, ביטוח קבוצתי של מעסיק חייב לכסות סוכרת סוג 1 מהיום הראשון ללא תקופת המתנה וללא החרגות.');
  insertDiab.run('israel_vs_usa', 'Omnipod 5', 'ישראל: ללא תשלום בסל הבריאות', 'ארה"ב: מכוסה ב->90% מהתוכניות המסחריות (Pharmacy Benefit)', '50% מהמבוטחים משלמים $30 ומטה לחודש (לעיתים $0 ב-Platinum/Tier 1); ניתן להוריד ל-$0–$25 בעזרת Insulet Savings Card.');
  insertDiab.run('israel_vs_usa', 'FreeStyle Libre (2 Plus / 3 Plus)', 'ישראל: ללא תשלום בסל הבריאות', 'ארה"ב: מאושר ומשולב ישירות עם Omnipod 5 כמרשם בבית מרקחת', 'Abbott מפעילה תוכנית Savings Card למבוטחים מסחריים שמקטינה עלות קופה ל-$0–$25/חודש.');
  insertDiab.run('gc_vs_citizen', 'ביטוח בריאות מהמעסיק (Commercial)', 'בעל גרין קארד: זכאות מלאה זהה לחלוטין', 'אזרח אמריקאי: זכאות מלאה זהה לחלוטין', 'אין שום הבדל בפרמיות, כיסוי או Formulary.');
  insertDiab.run('gc_vs_citizen', 'שוק הביטוח הפדרלי (ACA Marketplace)', 'בעל גרין קארד: זכאי לרכישה וסבסוד מהיום הראשון', 'אזרח אמריקאי: זכאי לרכישה וסבסוד מהיום הראשון', 'זהה לחלוטין מיום הנחיתה עם גרין קארד.');
  insertDiab.run('gc_vs_citizen', 'Medicaid (ביטוח למעוטי הכנסה)', 'בעל גרין קארד: מחסום 5 שנים (The 5-Year Bar)', 'אזרח אמריקאי: זכאות מיידית לפי רף הכנסה', 'החרגה קריטית לילדים: 35+ מדינות (כולל NJ, CA, NY, PA) אימצו CHIPRA שמבטל המתנה של 5 שנים לילדים.');
  insertDiab.run('gc_vs_citizen', 'קצבת נכות מעבודה (SSDI)', 'בעל גרין קארד: זכאות זהה לפי צבירת נקודות עבודה', 'אזרח אמריקאי: זכאות זהה לפי צבירת נקודות עבודה', 'ממומן ממסי שכר (FICA) — אין עדיפות לאזרח.');
  insertDiab.run('gc_vs_citizen', 'קצבת סעד לנכים (SSI)', 'בעל גרין קארד: לא זכאי עד צבירת 40 רבעונים (10 שנים) או אזרחות', 'אזרח אמריקאי: זכאי לפי מבחן הכנסה', 'הבדל מהותי רק במקרה של משבר כלכלי עמוק.');
  insertDiab.run('gc_vs_citizen', 'דמי אבטלה ופנסיה (Social Security)', 'בעל גרין קארד: זכאי לדמי אבטלה ולפנסיה (אחרי 10 שנות מס)', 'אזרח אמריקאי: זכאי לדמי אבטלה ולפנסיה ללא הגבלת שהייה בחו"ל', 'שהייה של בעל גרין קארד מעל 6 חודשים מחוץ לארה"ב עלולה להקפיא קצבה.');

  // 9. Landing Budget Items (~$135,000 / 500,000 ILS)
  const insertLanding = db.prepare(`
    INSERT INTO landing_budget_items (category, amount_min_usd, amount_max_usd, details)
    VALUES (?, ?, ?, ?)
  `);

  insertLanding.run('טיסות, שילוח מזוודות ואגרות מעבר', 5000, 7000, 'כרטיסי טיסה ל-4 נפשות, אגרות ויזה/גרין קארד ומשלוח ציוד ראשוני');
  insertLanding.run('כניסה לבית שכור (ללא Credit Score)', 5000, 7500, 'חודש ראשון + חודש אחרון + פיקדון ביטחון מוגדל (לבית של ~$2,400/חודש)');
  insertLanding.run('ריהוט ואבזור בסיסי לבית', 6000, 9000, 'בתים בארה"ב מושכרים ריקים (למעט מקרר/כיריים/מדיח) — איקאה, טארגט ויד שנייה');
  insertLanding.run('רכישת 2 רכבים משומשים במזומן', 18000, 24000, 'טויוטה/הונדה אמינות דרך CarMax או סוכנויות כדי להימנע מריבית של 10%–18%');
  insertLanding.run('ביטוח רכב לחצי שנה ראשונה', 2000, 3000, 'תעריף ראשוני גבוה לבעלי רישיון זר עד להמרה לרישיון DMV מקומי');
  insertLanding.run('קרן חירום רפואית (Deductible + ציוד)', 3000, 3000, 'כיסוי השתתפות עצמית ראשונית (Deductible) וסבסוד ציוד סוכרת');

  // 10. Interactive Checklists
  const insertCheck = db.prepare(`
    INSERT INTO checklist_items (group_name, step_order, title, description, is_critical, is_completed)
    VALUES (?, ?, ?, ?, ?, 0)
  `);

  // Group: diabetes_prep
  insertCheck.run('diabetes_prep', 1, 'בדיקת פוליסת הביטוח לפני חתימה על חוזה', 'לוודא ש-Omnipod 5 ו-FreeStyle Libre 2/3 Plus מופיעים ב-Formulary בדרגת Tier 1/2, ולהעדיף PPO/EPO על פני High Deductible (HDHP).', 1);
  insertCheck.run('diabetes_prep', 2, 'הצטיידות במלאי רפואי ל-3 עד 4 חודשים מראש', 'חוק הברזל: לקחת מרופא הסוכרת וקופת החולים מלאי מקסימלי של פודים, סנסורים, אינסולין וציוד גיבוי (עטים, מד סוכר, קטונים) לפני הטיסה.', 1);
  insertCheck.run('diabetes_prep', 3, 'תרגום תיק רפואי וייצוא Glooko / LibreView', 'סיכום מחלה באנגלית (קוד E10.9), מינוני Basal / I:C / ISF, בדיקת HbA1c אחרונה וייצוא PDF מלא של נתוני הסנסור והמשאבה.', 1);
  insertCheck.run('diabetes_prep', 4, 'פנייה לרופא ילדים, אנדוקרינולוג ו-Prior Authorization', 'מיד עם הפעלת הביטוח וה-SSN: קביעת תור ל-PCP (להפניה אם נדרשת), תור ל-Pediatric Endocrinologist והגשת Prior Authorization דיגיטלית.', 0);

  // Group: israel_docs
  insertCheck.run('israel_docs', 1, 'תעודות לידה ונישואין מקוריות עם אפוסטיל', 'הנפקת תעודות רשמיות, תרגום לאנגלית וחותמת אפוסטיל.', 1);
  insertCheck.run('israel_docs', 2, 'פנקסי חיסונים מלאים מתורגמים לאנגלית', 'חובה מוחלטת לרישום לבתי ספר ציבוריים בארה"ב — ללא חיסונים מאומתים הילדות לא מורשות להיכנס לכיתה.', 1);
  insertCheck.run('israel_docs', 3, 'תעודות בגרות, גיליונות ציונים ותעודת שחרור מצה"ל', 'מתורגמים ומאושרים באפוסטיל (רלוונטי לראיון שגרירות DS-260 ולרישום לימודים).', 0);
  insertCheck.run('israel_docs', 4, 'אישור ביטוח רכב על היעדר תביעות ל-3 שנים', 'מכתב רשמי באנגלית מחברת הביטוח בישראל להוזלת פרמיות ביטוח הרכב בארה"ב.', 0);

  // Group: us_landing
  insertCheck.run('us_landing', 1, 'הגעה לקומפלקס דירות מנוהל (Apartment Community) או מכתב Offer Letter', 'הימנעות מסירוב בעלי בתים פרטיים בהיעדר Credit Score אמריקאי.', 0);
  insertCheck.run('us_landing', 2, 'קבלת SSN ופתיחת Secured Credit Card / העברת Amex', 'שמירה על ניצול מסגרת מתחת ל-30% ותשלום מלא בזמן לבניית ציון 680–700+ תוך 6–12 חודשים.', 1);
  insertCheck.run('us_landing', 3, 'המרת רישיון נהיגה ב-DMV בהקדם האפשרי', 'מבחן תיאוריה (בחלק מהמדינות גם בעברית) + מבחן מעשי — חוסך מאות דולרים בחודש בביטוח הרכב.', 1);
  insertCheck.run('us_landing', 4, 'הגשת כרטיסי DV Lottery כפולים בכל אוקטובר (אתה + אשתך)', 'רישום שני טפסים נפרדים על בסיס ארץ הלידה אוקראינה עם תמונות עדכניות וכל הילדות.', 0);

  // 11. Official Sources
  const insertSrc = db.prepare(`
    INSERT INTO official_sources (category, title, url, description)
    VALUES (?, ?, ?, ?)
  `);

  insertSrc.run('סיפורים אישיים מהשטח', 'Reddit r/Israel — משפחה מראש העין לאטלנטה (אפריל 2026)', 'https://www.reddit.com/r/Israel/comments/1sd0gam/finances_and_war_lets_talk_about_it/', 'שיתוף מפורט של הוצאות בישראל מול אטלנטה, 4 ילדים, רכבים וחינוך ציבורי.');
  insertSrc.run('סיפורים אישיים מהשטח', 'ארץ חדשה — סיפור המעבר לסן דייגו (פברואר 2026)', 'https://relocating.co.il/relocating-to-san-diego-us/', 'ראיון אישי עם בני נוער על ההתאקלמות בסן דייגו, צופי צבר ו-IAC.');
  insertSrc.run('סיפורים אישיים מהשטח', 'ארץ חדשה — מדריך רילוקיישן פרקטי לארה"ב', 'https://relocating.co.il/relocation-guide-to-the-usa/', 'מדריך שטח מעודכן למשפחות ישראליות.');
  insertSrc.run('סיפורים אישיים מהשטח', 'Reddit r/Israel — דיון יוסטון מול קליפורניה וניו יורק (ינואר 2026)', 'https://www.reddit.com/r/Israel/comments/1q9u5q7/moving_from_israel_to_the_us/', 'השוואת קהילה, מס מדינתי ועלויות מחיה.');
  insertSrc.run('הגירה וויזות', 'Official Diversity Visa Program (U.S. Department of State)', 'https://dvprogram.state.gov/', 'האתר הרשמי והיחיד להרשמה חינמית להגרלת הגרין קארד.');
  insertSrc.run('סוכרת וביטוח', 'Omnipod — Cost, Coverage & Savings Access in the US', 'https://www.omnipod.com/is-omnipod-right-for-me/coverage', 'בדיקת כיסוי ביטוחי ותוכניות סבסוד Copay בארה"ב.');
  insertSrc.run('סוכרת וביטוח', 'Omnipod 5 with FreeStyle Libre Sensor Integration', 'https://www.omnipod.com/what-is-omnipod/omnipod-5/sensors/freestyle-libre-integration', 'מדריך תאימות ומרשמים בין אומניפוד 5 לחיישני ליברה.');
  insertSrc.run('סוכרת וביטוח', 'Abbott FreeStyle Libre — US Insurance Coverage & Savings', 'https://www.freestyleprovider.abbott/us-en/cost-access.html', 'זכאות וחיסכון לחיישני FreeStyle Libre בארה"ב.');
  insertSrc.run('סוכרת וביטוח', 'ביטוח לאומי — שהות בחוץ לארץ של ילד המקבל גמלה', 'https://www.btl.gov.il/About/faq/yelednehe/Pages/hol.aspx', 'כללי הפסקת גמלת ילד נכה לאחר 3 חודשים בחו"ל.');
  insertSrc.run('מאגרי נתונים רשמיים', 'Zillow Research Data', 'https://www.zillow.com/research/data/', 'נתוני שכר דירה חציוני בפרברי ארה"ב.');
  insertSrc.run('מאגרי נתונים רשמיים', 'Realtor.com Research Data', 'https://www.realtor.com/research/data/', 'מאגרי שכירות ונדל"ן פדרליים.');
  insertSrc.run('מאגרי נתונים רשמיים', 'Numbeo Cost of Living Index', 'https://www.numbeo.com/cost-of-living/', 'מדדי מחירים לצרכן לפי מטרופולינים.');
  insertSrc.run('מאגרי נתונים רשמיים', 'U.S. Bureau of Labor Statistics (BLS) — CPI', 'https://www.bls.gov/cpi/', 'מדד המחירים לצרכן הרשמי של ממשלת ארה"ב.');
  insertSrc.run('מאגרי נתונים רשמיים', 'Texas Comptroller of Public Accounts', 'https://comptroller.texas.gov/', 'אישור רשמי: 0% מס הכנסה מדינתי בטקסס.');
  insertSrc.run('מאגרי נתונים רשמיים', 'Georgia Department of Revenue', 'https://dor.georgia.gov/', 'שיעורי מס הכנסה מדינתי בג\'ורג\'יה (~5.39%).');
  insertSrc.run('מאגרי נתונים רשמיים', 'KFF Employer Health Benefits Survey', 'https://www.kff.org/health-costs/', 'סקר השתתפות עצמית ועלויות ביטוחי מעסיק בארה"ב.');
  insertSrc.run('אתרי ערים ו-Niche', 'City of Plano, TX (Official)', 'https://www.plano.gov/', 'הפורטל הרשמי של העיר פלאנו, טקסס.');
  insertSrc.run('אתרי ערים ו-Niche', 'Living in Plano, TX — Niche', 'https://www.niche.com/places-to-live/plano-collin-tx/', 'תמונות, דירוג בתי ספר וסקירת שכונות בפלאנו.');
  insertSrc.run('אתרי ערים ו-Niche', 'City of Frisco, TX (Official)', 'https://www.friscotexas.gov/', 'הפורטל הרשמי של העיר פריסקו, טקסס.');
  insertSrc.run('אתרי ערים ו-Niche', 'Living in Frisco, TX — Niche', 'https://www.niche.com/places-to-live/frisco-collin-tx/', 'תמונות ופרופיל שכונתי של פריסקו.');
  insertSrc.run('אתרי ערים ו-Niche', 'City of Katy, TX (Official)', 'https://www.cityofkaty.com/', 'הפורטל הרשמי של קייטי, טקסס.');
  insertSrc.run('אתרי ערים ו-Niche', 'Living in Katy, TX — Niche', 'https://www.niche.com/places-to-live/katy-fort-bend-tx/', 'תמונות ודירוגים של קייטי, טקסס.');
  insertSrc.run('אתרי ערים ו-Niche', 'City of Sugar Land, TX (Official)', 'https://www.sugarlandtx.gov/', 'הפורטל הרשמי של שוגר לנד, טקסס.');
  insertSrc.run('אתרי ערים ו-Niche', 'Living in Sugar Land, TX — Niche', 'https://www.niche.com/places-to-live/sugar-land-fort-bend-tx/', 'תמונות ודירוגים של שוגר לנד.');
  insertSrc.run('אתרי ערים ו-Niche', 'City of Alpharetta, GA (Official)', 'https://www.alpharetta.ga.us/', 'הפורטל הרשמי של אלפארטה, ג\'ורג\'יה.');
  insertSrc.run('אתרי ערים ו-Niche', 'Living in Alpharetta, GA — Niche', 'https://www.niche.com/places-to-live/alpharetta-fulton-ga/', 'תמונות ודירוגים של אלפארטה.');
  insertSrc.run('אתרי ערים ו-Niche', 'City of Johns Creek, GA (Official)', 'https://www.johnscreekga.gov/', 'הפורטל הרשמי של ג\'ונס קריק, ג\'ורג\'יה.');
  insertSrc.run('אתרי ערים ו-Niche', 'Living in Johns Creek, GA — Niche', 'https://www.niche.com/places-to-live/johns-creek-fulton-ga/', 'תמונות ודירוגים של ג\'ונס קריק.');
  insertSrc.run('אתרי ערים ו-Niche', 'City of Beachwood, OH (Official)', 'https://www.beachwoodohio.com/', 'הפורטל הרשמי של ביצ\'ווד, אוהיו.');
  insertSrc.run('אתרי ערים ו-Niche', 'City of Carmel, IN (Official)', 'https://www.carmel.in.gov/', 'הפורטל הרשמי של כרמל, אינדיאנה.');
  insertSrc.run('אתרי ערים ו-Niche', 'Cherry Hill Township, NJ (Official)', 'https://www.chnj.gov/', 'הפורטל הרשמי של צ\'רי היל, ניו ג\'רזי.');

  return db;
}

if (require.main === module) {
  const force = process.argv.includes('--force');
  const db = initDb({ force });
  const counts = {
    stories: db.prepare('SELECT COUNT(*) AS c FROM stories').get().c,
    visa_paths: db.prepare('SELECT COUNT(*) AS c FROM visa_paths').get().c,
    locations: db.prepare('SELECT COUNT(*) AS c FROM locations').get().c,
    checklist_items: db.prepare('SELECT COUNT(*) AS c FROM checklist_items').get().c,
    official_sources: db.prepare('SELECT COUNT(*) AS c FROM official_sources').get().c,
  };
  console.log('SQLite DB initialized at:', DB_PATH);
  console.log('Seeded counts:', counts);
}

module.exports = { initDb, DB_PATH };
