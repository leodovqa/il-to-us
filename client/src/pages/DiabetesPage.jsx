import { useEffect, useState } from 'react';
import {
  HeartPulse,
  CheckCircle2,
  Circle,
  ExternalLink,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../api/client';

export default function DiabetesPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('israel_vs_usa');

  useEffect(() => {
    api
      .getDiabetes()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const toggleItem = async (item) => {
    const next = !item.is_completed;
    setData((prev) => ({
      ...prev,
      checklist: prev.checklist.map((c) => (c.id === item.id ? { ...c, is_completed: next ? 1 : 0 } : c)),
    }));
    await api.toggleChecklist(item.id, next);
  };

  if (loading || !data) {
    return <div className="py-16 text-center text-slate-400">טוען נתוני סוכרת סוג 1 וביטוחים...</div>;
  }

  const { comparisons, checklist, sources } = data;
  const activeComparisons = comparisons.filter((c) => c.section === tab);
  const doneCount = checklist.filter((c) => c.is_completed).length;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          סוכרת סוג 1 (T1D) ברילוקיישן: Omnipod 5, FreeStyle Libre, ביטוחים וקצבאות
        </h1>
        <p className="text-sm text-slate-400">
          מדריך ייעודי לילדה בת כמעט 9: מה קורה לגמלת ביטוח לאומי, איך מקבלים ציוד בארה״ב, ומה ההבדל בין גרין קארד לאזרחות.
        </p>
      </header>

      {/* Key Alert Banner */}
      <section className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-start">
        <AlertCircle className="text-rose-400 shrink-0 mt-0.5" size={24} />
        <div className="space-y-1 text-sm text-rose-100">
          <div className="font-bold text-base text-rose-300">נקודת מפתח: אין קצבת כסף חודשית בארה״ב — הכל נשען על ביטוח המעסיק</div>
          <p className="text-xs sm:text-sm text-rose-200/90 leading-relaxed">
            בישראל גמלת ילד נכה (1,943 ₪/חודש מגיל 6; 3,820 ₪ עד גיל 6) משולמת בחו״ל <strong className="text-white">חודש היציאה + 3 חודשים בלבד</strong> ואז נפסקת.
            בארה״ב אין תשלום מזומן להורים על ויזת עבודה, אך תחת חוק ה-ACA ביטוח בריאות של מעסיק <strong className="text-white">חייב לכסות סוכרת סוג 1 ללא החרגה</strong> (תיתכן תקופת המתנה כללית של עד 90 יום לעובד חדש).
          </p>
        </div>
      </section>

      {/* Equipment Overview Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-white">Omnipod 5 (חברת Insulet)</h2>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Pharmacy Benefit
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            מכוסה לרוב כהטבת בית מרקחת (CVS, Walgreens או משלוח הביתה) ולא כ-DME.
            למעלה מ-<strong className="text-white">90%</strong> מהמבוטחים בתוכניות מסחריות מכוסים, וכ-<strong className="text-white">50%</strong> משלמים Copay של <strong className="text-white">$30 ומטה לחודש</strong> (או $0 בפוליסות Platinum/Tier 1).
          </p>
          <p className="text-xs text-blue-400 font-medium">
            טיפ סבסוד: תוכנית Omnipod Copay Card מורידה השתתפות עצמית ל-$50/חודש (עד $100 הנחה חודשית) למבוטחים מסחריים.
          </p>
        </div>

        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-white">FreeStyle Libre 2 Plus / 3 Plus (Abbott)</h2>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
              משולב עם Omnipod 5
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            מאושר ומשולב ישירות במערכת Omnipod 5 גם בארה״ב ונאסף כמרשם בבית המרקחת.
            חברת Abbott מפעילה תוכנית Copay Card המגבילה עלות חודשית ל-$75 ומטה עבור 2 סנסורים (ובנוסף שובר התנסות חינמי חד-פעמי ל-Libre 3 Plus אחד).
          </p>
          <p className="text-xs text-amber-300 font-medium">
            שימו לב: בפוליסות High Deductible (HDHP) יש לשלם Deductible שנתי ($1,500–$3,000) בתחילת השנה — עדיף לבחור PPO או EPO!
          </p>
        </div>
      </section>

      {/* Diff Tabs */}
      <section className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="text-blue-400" size={22} />
            <span>טבלאות השוואה (Diff): מערכות בריאות וזכויות</span>
          </h2>
          <div className="flex gap-1.5 bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setTab('israel_vs_usa')}
              className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                tab === 'israel_vs_usa' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              ישראל מול ארה״ב (T1D)
            </button>
            <button
              onClick={() => setTab('gc_vs_citizen')}
              className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                tab === 'gc_vs_citizen' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              בעל גרין קארד מול אזרח אמריקאי
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead>
              <tr className="border-b border-slate-700 text-xs text-slate-300 bg-slate-800/60">
                <th className="py-2.5 px-3 font-bold">נושא</th>
                <th className="py-2.5 px-3 font-bold">
                  {tab === 'israel_vs_usa' ? 'ישראל' : 'בעל גרין קארד'}
                </th>
                <th className="py-2.5 px-3 font-bold">
                  {tab === 'israel_vs_usa' ? 'ארצות הברית' : 'אזרח אמריקאי'}
                </th>
                <th className="py-2.5 px-3 font-bold">דגש קריטי</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-xs">
              {activeComparisons.map((row) => (
                <tr key={row.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-bold text-white">{row.topic}</td>
                  <td className="py-3 px-3 text-slate-300 leading-relaxed">{row.israel_or_gc}</td>
                  <td className="py-3 px-3 text-slate-300 leading-relaxed">{row.usa_or_citizen}</td>
                  <td className="py-3 px-3 text-slate-400 leading-relaxed font-medium">{row.critical_note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Interactive 4-Step Medical Checklist */}
      <section className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <HeartPulse className="text-rose-400" size={22} />
              <span>רשימת פעולות רפואית מחייבת (נשמרת ב-SQLite)</span>
            </h2>
            <p className="text-xs text-slate-400">
              תהליך קביעת תור לאנדוקרינולוג ילדים ו-Prior Authorization בארה״ב אורך 1.5–3 חודשים מהנחיתה.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            הושלמו {doneCount} מתוך {checklist.length}
          </span>
        </div>

        <div className="space-y-2.5">
          {checklist.map((item) => (
            <button
              key={item.id}
              onClick={() => toggleItem(item)}
              className={`w-full text-right p-4 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                item.is_completed
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/70'
              }`}
            >
              {item.is_completed ? (
                <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={20} />
              ) : (
                <Circle className="text-slate-500 shrink-0 mt-0.5" size={20} />
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`font-bold text-sm ${
                      item.is_completed ? 'line-through text-slate-500' : 'text-white'
                    }`}
                  >
                    שלב {item.step_order}: {item.title}
                  </span>
                  {item.is_critical === 1 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      קריטי
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Official Links */}
      <section className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 space-y-3">
        <h2 className="text-lg font-bold text-white">קישורים ישירים לבדיקת כיסוי, סבסוד וביטוח לאומי</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sources.map((src) => (
            <a
              key={src.id}
              href={src.url}
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-xl border border-slate-800 bg-slate-800/40 hover:border-rose-500/50 hover:bg-slate-800 transition-all block"
            >
              <div className="flex items-center justify-between gap-2 text-xs font-bold text-rose-400">
                <span>{src.title}</span>
                <ExternalLink size={13} className="shrink-0" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{src.description}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
