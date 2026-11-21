import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Wallet,
  HeartPulse,
  Briefcase,
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  FileText,
} from 'lucide-react';
import { api } from '../api/client';

const groupLabels = {
  diabetes_prep: { title: 'היערכות רפואית (T1D)', to: '/diabetes' },
  israel_docs: { title: 'מסמכים ואפוסטיל בישראל', to: '/practical' },
  us_landing: { title: 'צעדי נחיתה בארה״ב', to: '/practical' },
};

export default function OverviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getOverview()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="py-16 text-center text-slate-400">טוען נתונים ממסד הנתונים...</div>;
  }
  if (error) {
    return <div className="p-6 bg-rose-950/60 text-rose-200 rounded-xl border border-rose-800">{error}</div>;
  }

  const { profile, checklistStats, locationsSummary, counts } = data;
  const totalTasks = checklistStats.reduce((acc, g) => acc + g.total, 0);
  const completedTasks = checklistStats.reduce((acc, g) => acc + (g.completed || 0), 0);

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <section className="bg-gradient-to-l from-slate-900 via-slate-900 to-blue-950/80 border border-slate-800 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-medium">
              <Sparkles size={14} />
              <span>נתונים משולבים ומאומתים (2023–2026) • {counts.sources} מקורות רשמיים ב-DB</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {profile.title}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              תמונת מצב מרוכזת למשפחה בת 4 נפשות: שילוב של מסלול הגירה חוקי (DV Lottery / L-1),
              ניהול סוכרת סוג 1 בארה״ב, פריסת הון של 500,000 ₪, והשוואת יעדים עם סיכון נמוך וקהילה יהודית.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              to="/locations"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-blue-600/20"
            >
              <span>השוואת 6 ערים ופרברים</span>
              <ArrowLeft size={16} />
            </Link>
            <Link
              to="/visas"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-sm transition-colors border border-slate-700"
            >
              <span>סימולטור ויזות וגרין קארד</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Combined Family Profile Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
            <Users size={18} />
            <span>זכאות ומוצא המשפחה</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{profile.parents_origin}</p>
          <div className="pt-1.5 text-xs text-slate-400 border-t border-slate-800">
            {profile.children_summary}
          </div>
        </div>

        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <HeartPulse size={18} />
            <span>פרופיל רפואי (T1D)</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{profile.medical_profile}</p>
          <Link to="/diabetes" className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:underline pt-1">
            <span>מדריך Omnipod 5, Libre וקצבאות</span>
            <ArrowLeft size={13} />
          </Link>
        </div>

        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Wallet size={18} />
            <span>הון עצמי ואורך נשימה</span>
          </div>
          <div className="text-2xl font-extrabold text-white">
            ₪{profile.capital_ils.toLocaleString()} <span className="text-base font-semibold text-slate-400">(~${profile.capital_usd.toLocaleString()})</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            הקמה ראשונית: ~$40k–$50k • יתרת ביטחון: ~$85k–$95k (12–18 חודשי מחיה).
          </p>
        </div>

        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <Briefcase size={18} />
            <span>תעסוקה, שפה וקרובים</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{profile.employment_profile}</p>
          <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-800 pt-1.5">
            {profile.relatives_in_us}
          </p>
        </div>
      </section>

      {/* Checklist Progress + Quick Locations Diff */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-white flex items-center gap-2">
              <CheckCircle2 className="text-emerald-400" size={20} />
              <span>מוכנות למעבר (נשמר ב-DB)</span>
            </h2>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              {completedTasks} / {totalTasks}
            </span>
          </div>

          <div className="space-y-3">
            {checklistStats.map((g) => {
              const meta = groupLabels[g.group_name] || { title: g.group_name, to: '/practical' };
              const done = g.completed || 0;
              const pct = g.total ? Math.round((done / g.total) * 100) : 0;
              return (
                <Link
                  key={g.group_name}
                  to={meta.to}
                  className="block p-3.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/70 transition-colors"
                >
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-200 mb-1.5">
                    <span>{meta.title}</span>
                    <span className="text-xs text-slate-400">{done}/{g.total}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-300">
              <ShieldAlert size={15} />
              <span>חוקי ברזל למשפחה שלכם:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-amber-200/90">
              <li>הגשת 2 טפסי DV Lottery נפרדים בכל אוקטובר (על בסיס אוקראינה).</li>
              <li>קצבת ילד נכה מביטוח לאומי נפסקת אחרי 3 חודשים בחו״ל.</li>
              <li>להגיע עם מלאי של 3–4 חודשים של Omnipod 5, Libre ואינסולין.</li>
            </ul>
          </div>
        </section>

        {/* Quick 6-City Diff Table */}
        <section className="lg:col-span-2 bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="font-bold text-lg text-white">הבדלים מרכזיים בין 6 היעדים שנבדקו (Diff)</h2>
              <p className="text-xs text-slate-400">ממוין מהעלות החודשית הנמוכה לגבוהה למשפחה בת 4 נפשות</p>
            </div>
            <Link to="/locations" className="text-sm font-semibold text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1">
              <span>למטריצת ההשוואה המלאה</span>
              <ArrowLeft size={15} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs">
                  <th className="py-2.5 px-2 font-semibold">עיר / פרבר</th>
                  <th className="py-2.5 px-2 font-semibold">עלות חודשית</th>
                  <th className="py-2.5 px-2 font-semibold">מס מדינתי</th>
                  <th className="py-2.5 px-2 font-semibold">סיכון FEMA</th>
                  <th className="py-2.5 px-2 font-semibold">מרכז סוכרת ילדים</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {locationsSummary.map((loc) => {
                  const isLowRisk = loc.fema_risk_level.includes('נמוך');
                  return (
                    <tr key={loc.slug} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-2 font-semibold text-slate-100">
                        {loc.name_he}
                        <div className="text-[11px] font-normal text-slate-400">{loc.state_he}</div>
                      </td>
                      <td className="py-3 px-2 font-medium text-slate-200 whitespace-nowrap">
                        ${loc.total_monthly_min.toLocaleString()}–${loc.total_monthly_max.toLocaleString()}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold ${
                            loc.state_tax_pct === 0
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {loc.state_tax_pct}%
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold ${
                            isLowRisk
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : loc.fema_risk_level.includes('בינוני')
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {loc.fema_risk_level.split('(')[0].trim()}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-xs text-slate-300 font-medium">
                        {loc.diabetes_hospital}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Navigation Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          to="/stories"
          className="group bg-slate-900/80 p-5 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
              עדויות מהשטח ({counts.stories} מקורות)
            </span>
            <FileText size={18} className="text-slate-500 group-hover:text-blue-400" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            סיפורים אמיתיים של ישראלים (ראש העין לאטלנטה, סן דייגו, יוסטון מול CA/NY) עם לינקים מדויקים ל-Reddit ולבלוגים.
          </p>
        </Link>

        <Link
          to="/visas"
          className="group bg-slate-900/80 p-5 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
              מסלולי ויזה, פיטורים ואיחוד משפחות
            </span>
            <ArrowLeft size={18} className="text-slate-500 group-hover:text-blue-400" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            השוואת L-1 מול DV Lottery, תקופת חסד 60 יום בפיטורים, אזרחות לילדים, וכללי ספונסרשיפ לאמא, אח ודודים.
          </p>
        </Link>

        <Link
          to="/practical"
          className="group bg-slate-900/80 p-5 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
              מחשבון נחיתה (500K ₪) ומסמכים
            </span>
            <ArrowLeft size={18} className="text-slate-500 group-hover:text-blue-400" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            פירוט עלויות הקמה, בניית Credit Score, המרת רישיון DMV, רכישת רכבים במזומן ומסמכי אפוסטיל.
          </p>
        </Link>
      </section>
    </div>
  );
}
