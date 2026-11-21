import { useEffect, useState } from 'react';
import {
  FileCheck2,
  ShieldAlert,
  Users,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { api } from '../api/client';

export default function VisasPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dualEntry, setDualEntry] = useState(true);
  const [layoffFilter, setLayoffFilter] = useState('all');

  useEffect(() => {
    api
      .getVisas()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="py-16 text-center text-slate-400">טוען נתוני ויזות והגירה...</div>;
  }

  const { visaPaths, layoffOptions, familySponsorship } = data;

  const filteredLayoff =
    layoffFilter === 'all'
      ? layoffOptions
      : layoffFilter === 'gc'
        ? layoffOptions.filter((o) => o.visa_status === 'Green Card')
        : layoffOptions.filter((o) => o.visa_status !== 'Green Card');

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          מסלולי ויזה, הגרלת גרין קארד, פיטורים ואיחוד משפחות
        </h1>
        <p className="text-sm text-slate-400">
          ניתוח משפטי ומעשי עבור זוג ילידי אוקראינה (יוצאי צבא) עם 2 בנות ילידות ישראל ועבודה בהייטק.
        </p>
      </header>

      {/* Interactive DV Lottery & Citizenship Simulator */}
      <section className="bg-gradient-to-l from-blue-950/90 to-slate-900 border border-blue-500/30 text-white rounded-2xl p-6 shadow-lg space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-300">
              <Sparkles size={15} />
              <span>סימולטור הגרלת גרין קארד (DV Lottery) למשפחה שלכם</span>
            </div>
            <h2 className="text-xl font-extrabold">ילידי אוקראינה + שירות בצה״ל + אנגלית בסיסית + 2 בנות</h2>
          </div>

          <button
            onClick={() => setDualEntry(!dualEntry)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 ${
              dualEntry
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700'
            }`}
          >
            {dualEntry ? 'מצב פעיל: הגשה כפולה (2 טפסים באוקטובר ✓)' : 'לחץ להדמיית הגשה כפולה (פי 2 סיכוי)'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950/50 border border-white/10 rounded-xl p-4 space-y-2">
            <div className="font-bold text-blue-300 text-sm">1. מילוי טופס ה-DV (אוקטובר)</div>
            <p className="text-slate-300 leading-relaxed">
              <strong>Country of Birth / Eligibility:</strong> רושמים <strong className="text-white">Ukraine</strong> (אוקראינה זכאית לחלוטין).
              <br />
              <strong>Country where you live:</strong> רושמים <strong className="text-white">Israel</strong>.
              <br />
              <strong>בנות:</strong> נרשמות כ-Derivative Children (ארץ לידה: Israel). חובה לצרף תמונה עדכנית (עד 6 חודשים) של כל 4 בני המשפחה.
            </p>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold">
              {dualEntry
                ? '2 מספרי אישור בשנה: טופס 1 (אתה ראשי) + טופס 2 (אשתך ראשית). זכייה באחד = גרין קארד לכולם!'
                : 'טופס יחיד בשנה (~1% סיכוי). מומלץ להגיש גם על שם בת הזוג.'}
            </div>
          </div>

          <div className="bg-slate-950/50 border border-white/10 rounded-xl p-4 space-y-2">
            <div className="font-bold text-blue-300 text-sm">2. שירות צבאי, אנגלית ומצב רפואי</div>
            <ul className="space-y-1.5 text-slate-300 leading-relaxed list-disc list-inside">
              <li>
                <strong className="text-white">צה״ל:</strong> לא פוסל! מפרטים שירות בטופס DS-260 ומציגים תעודת שחרור מתורגמת בראיון.
              </li>
              <li>
                <strong className="text-white">אנגלית:</strong> אין שום מבחן אנגלית לגרין קארד! הראיון בת״א/ירושלים מתנהל בעברית (או רוסית).
              </li>
              <li>
                <strong className="text-white">סוכרת סוג 1:</strong> אינה עילה לפסילה רפואית (בודקים רק מחלות מידבקות כגון שחפת וחיסוני חובה).
              </li>
            </ul>
          </div>

          <div className="bg-slate-950/50 border border-white/10 rounded-xl p-4 space-y-2">
            <div className="font-bold text-blue-300 text-sm">3. אחרי 5 שנים: אזרחות (N-400) וילדים</div>
            <ul className="space-y-1.5 text-slate-300 leading-relaxed list-disc list-inside">
              <li>
                <strong className="text-white">בחירה ולא חובה:</strong> גרין קארד קבוע לכל החיים (חידוש כרטיס כל 10 שנים).
              </li>
              <li>
                <strong className="text-white">תנאי התאזרחות:</strong> 30 חודשי שהות פיזית מתוך 5 שנים, ללא יציאה מעל 6 חודשים, דיווח מס (IRS).
              </li>
              <li>
                <strong className="text-white">המבחן:</strong> 90%+ מעבר! קריאה/כתיבה של משפט אחד מתוך 3, ו-6 תשובות נכונות מתוך 10 שאלות היסטוריה (מאגר גלוי של 100 שאלות).
              </li>
              <li>
                <strong className="text-white">הבנות (מתחת ל-18):</strong> מקבלות אזרחות <strong className="text-emerald-300">אוטומטית ללא מבחן</strong> בשנייה שאחד ההורים נשבע (Section 320)! מוציאים דרכון ב-USPS (DS-11) ו/או תעודה (N-600).
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Visa Paths Comparison */}
      <section className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileCheck2 className="text-blue-400" size={22} />
            <span>השוואת מסלולי ההגירה והוויזות (ללא קרובים מדרגה ראשונה)</span>
          </h2>
          <a
            href="https://dvprogram.state.gov/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-500/15 text-blue-300 border border-blue-500/30 hover:bg-blue-500/25"
          >
            <span>אתר ההרשמה הרשמי ל-DV Lottery</span>
            <ExternalLink size={13} />
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {visaPaths.map((v) => (
            <div key={v.code} className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-3">
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-white">{v.name_he}</h3>
                  <div className="text-xs text-slate-400">{v.name_en}</div>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                  {v.code}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                  <span className="text-slate-400 block">סוג מעמד:</span>
                  <span className="font-semibold text-slate-200">{v.status_type}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                  <span className="text-slate-400 block">ודאות / סיכוי:</span>
                  <span className="font-semibold text-slate-200">{v.certainty_level}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                  <span className="text-slate-400 block">עבודת בן/בת זוג:</span>
                  <span className="font-semibold text-slate-200">{v.spouse_work_rights}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                  <span className="text-slate-400 block">עלויות פתיחה:</span>
                  <span className="font-semibold text-slate-200">{v.upfront_cost}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{v.requirements_summary}</p>

              {v.ukraine_israel_note && (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-200 leading-relaxed">
                  <strong className="text-blue-300">רלוונטיות למשפחה שלכם:</strong> {v.ukraine_israel_note}
                </div>
              )}

              <div className="text-xs space-y-1 pt-1">
                <div>
                  <span className="font-bold text-emerald-400">יתרונות: </span>
                  <span className="text-slate-300">{v.pros}</span>
                </div>
                <div>
                  <span className="font-bold text-rose-400">חסרונות: </span>
                  <span className="text-slate-300">{v.cons}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Layoff Diff Section */}
      <section className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldAlert className="text-amber-400" size={22} />
              <span>תרחיש פיטורים בארה״ב: גרין קארד מול ויזת עבודה (L-1)</span>
            </h2>
            <p className="text-xs text-slate-400">
              מה קורה אם מפוטרים אחרי שנה או פחות? האם מגרשים מיד או שיש פתרונות חוקיים?
            </p>
          </div>
          <div className="flex gap-1.5 bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            {[
              { id: 'all', label: 'הכל' },
              { id: 'gc', label: 'גרין קארד' },
              { id: 'l1', label: 'ויזת L-1' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setLayoffFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  layoffFilter === tab.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLayoff.map((opt) => {
            const isGC = opt.visa_status === 'Green Card';
            return (
              <div
                key={opt.id}
                className={`p-4 rounded-xl border space-y-2 ${
                  isGC ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800/50 border-slate-700/70'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                      isGC
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {opt.visa_status}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">{opt.legal_mechanism}</span>
                </div>
                <h3 className="font-bold text-sm text-white">{opt.title}</h3>
                <div className="text-xs font-semibold text-blue-400">מסגרת זמן: {opt.timeframe}</div>
                <p className="text-xs text-slate-300 leading-relaxed">{opt.description}</p>
                <p className="text-[11px] text-slate-400 border-t border-white/10 pt-1.5">
                  <strong className="text-slate-300">מגבלה:</strong> {opt.limitations}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Family Sponsorship Rules */}
      <section className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="text-indigo-400" size={22} />
            <span>איחוד משפחות (טופס I-130): את מי אפשר למשוך ומתי?</span>
          </h2>
          <p className="text-xs text-slate-400">
            השוואה בין בעל גרין קארד, אזרח אמריקאי (אחרי 5 שנים), וקרובים רחוקים (דוד/דודה בארה״ב).
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead>
              <tr className="border-b border-slate-700 text-xs text-slate-300 bg-slate-800/60">
                <th className="py-2.5 px-3 font-bold">סטטוס המבקש</th>
                <th className="py-2.5 px-3 font-bold">קרוב המשפחה</th>
                <th className="py-2.5 px-3 font-bold">זכאות</th>
                <th className="py-2.5 px-3 font-bold">זמן המתנה</th>
                <th className="py-2.5 px-3 font-bold">הסבר ופרטים</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-xs">
              {familySponsorship.map((row) => (
                <tr key={row.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-bold text-slate-200">{row.sponsor_status}</td>
                  <td className="py-3 px-3 font-semibold text-white">
                    {row.relative_type}
                    {row.category_code && (
                      <span className="block text-[11px] font-normal text-slate-400">{row.category_code}</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {row.is_eligible ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                        <CheckCircle2 size={14} /> זכאי
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                        <XCircle size={14} /> לא זכאי
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-200">{row.wait_time}</td>
                  <td className="py-3 px-3 text-slate-300 leading-relaxed">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
