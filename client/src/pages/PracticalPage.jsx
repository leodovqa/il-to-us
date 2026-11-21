import { useEffect, useState } from 'react';
import {
  Wallet,
  Home,
  Car,
  CreditCard,
  CheckCircle2,
  Circle,
  ExternalLink,
  FolderOpen,
} from 'lucide-react';
import { api } from '../api/client';

export default function PracticalPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [capitalUsd, setCapitalUsd] = useState(135000);

  useEffect(() => {
    api
      .getPractical()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const toggleItem = async (item) => {
    const next = !item.is_completed;
    setData((prev) => ({
      ...prev,
      checklists: prev.checklists.map((c) => (c.id === item.id ? { ...c, is_completed: next ? 1 : 0 } : c)),
    }));
    await api.toggleChecklist(item.id, next);
  };

  if (loading || !data) {
    return <div className="py-16 text-center text-slate-400">טוען מדריך נחיתה ומסמכים...</div>;
  }

  const { landingBudget, checklists, sources } = data;
  const setupMin = landingBudget.reduce((s, r) => s + r.amount_min_usd, 0);
  const setupMax = landingBudget.reduce((s, r) => s + r.amount_max_usd, 0);
  const remMin = Math.max(0, capitalUsd - setupMax);
  const remMax = Math.max(0, capitalUsd - setupMin);

  const israelDocs = checklists.filter((c) => c.group_name === 'israel_docs');
  const usLanding = checklists.filter((c) => c.group_name === 'us_landing');

  const sourcesByCat = sources.reduce((acc, s) => {
    acc[s.category] = acc[s.category] || [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          מדריך מעבר מעשי, תקציב נחיתה (500K ₪) וצ׳קליסט מסמכים
        </h1>
        <p className="text-sm text-slate-400">
          כל מה שצריך להכין בישראל מראש, איך צולחים את 3 החודשים הראשונים בלי Credit Score, ואיך מנהלים את ההון העצמי.
        </p>
      </header>

      {/* Interactive Landing Budget */}
      <section className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Wallet className="text-emerald-400" size={22} />
              <span>פירוט הוצאות נחיתה והקמה (חודשים 1–3)</span>
            </h2>
            <p className="text-xs text-slate-400">
              חישוב מבוסס הון של 500,000 ₪ (~$135,000). התאם את ההון העצמי שלך כדי לראות את יתרת הביטחון.
            </p>
          </div>
          <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-3 min-w-[260px] space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-200">
              <span>הון עצמי:</span>
              <span>${capitalUsd.toLocaleString()} (~₪{Math.round(capitalUsd * 3.7).toLocaleString()})</span>
            </div>
            <input
              type="range"
              min={70000}
              max={250000}
              step={5000}
              value={capitalUsd}
              onChange={(e) => setCapitalUsd(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead>
              <tr className="border-b border-slate-700 text-xs text-slate-300 bg-slate-800/60">
                <th className="py-2.5 px-3 font-bold">סעיף הקמה חד-פעמי</th>
                <th className="py-2.5 px-3 font-bold">עלות משוערת (USD)</th>
                <th className="py-2.5 px-3 font-bold">פירוט והסבר</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-xs">
              {landingBudget.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-bold text-white">{item.category}</td>
                  <td className="py-3 px-3 font-semibold text-slate-200 whitespace-nowrap">
                    ${item.amount_min_usd.toLocaleString()} – ${item.amount_max_usd.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-slate-300 leading-relaxed">{item.details}</td>
                </tr>
              ))}
              <tr className="bg-emerald-950/50 text-white font-bold border-t border-emerald-500/30">
                <td className="py-3 px-3">סה״כ עלויות הקמה (חודשים 1–3)</td>
                <td className="py-3 px-3 whitespace-nowrap">
                  ${setupMin.toLocaleString()} – ${setupMax.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-xs font-normal text-emerald-300">
                  יתרה נותרת בבנק: <strong>${remMin.toLocaleString()} – ${remMax.toLocaleString()}</strong> (כ-12–18 חודשי מחיה)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Practical Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-2.5 text-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-white">
            <Home className="text-blue-400" size={18} />
            <span>דיור: שכירות מול קניית בית</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            <strong className="text-white">קניית בית:</strong> כמעט בלתי אפשרי בנחיתה אלא ב-100% מזומן. בנקים דורשים Credit Score והיסטוריית הכנסה של 1–2 שנים. הלוואות Foreign National דורשות 30%–40% מקדמה וריבית גבוהה.
          </p>
          <p className="text-slate-300 leading-relaxed">
            <strong className="text-white">שכירות:</strong> בעלי בתים פרטיים מסרבים לרוב ללא Credit Score. הפתרון הנפוץ: <strong className="text-blue-300">קומפלקס דירות מנוהל (Apartment Community)</strong> שמסתפק ב-Offer Letter ופיקדון מוגדל.
          </p>
        </div>

        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-2.5 text-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-white">
            <Car className="text-indigo-400" size={18} />
            <span>רכב, DMV וביטוח</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            <strong className="text-white">קניית רכב:</strong> ללא Credit Score, ליסינג או מימון גוררים ריביות של <strong className="text-white">10%–18%</strong>. לכן רוכשים רכב ראשון משומש במזומן (למשל דרך CarMax).
          </p>
          <p className="text-slate-300 leading-relaxed">
            <strong className="text-white">רישיון נהיגה:</strong> להמיר לרישיון מקומי בהקדם (תיאוריה + טסט מעשי). הוצאת רישיון מקומי + מכתב היעדר תביעות ל-3 שנים מישראל מוזילים את הביטוח במאות דולרים לחודש!
          </p>
        </div>

        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-2.5 text-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-white">
            <CreditCard className="text-emerald-400" size={18} />
            <span>בניית Credit Score</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            מזומן או Debit Card אינם מייצרים דירוג אשראי. מיד עם קבלת <strong className="text-white">SSN</strong> יש לפתוח <strong className="text-emerald-300">Secured Credit Card</strong> (הפקדת ביטחון בבנק) או להעביר היסטוריה דרך American Express Global Transfer.
          </p>
          <p className="text-slate-300 leading-relaxed">
            שמירה על ניצול מסגרת מתחת ל-<strong className="text-white">30%</strong> ותשלום מלא בזמן בונים ציון סביר (680–700+) תוך 6–12 חודשים.
          </p>
        </div>
      </section>

      {/* Interactive Persistent Checklists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          { title: 'מסמכים חיוניים להכנה מראש בישראל (אפוסטיל ותרגום)', items: israelDocs },
          { title: 'צעדים פרקטיים לנחיתה והגרלה בארה״ב', items: usLanding },
        ].map((group) => (
          <section key={group.title} className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-3">
            <h2 className="font-bold text-base text-white">{group.title}</h2>
            <div className="space-y-2">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item)}
                  className={`w-full text-right p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                    item.is_completed
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/70'
                  }`}
                >
                  {item.is_completed ? (
                    <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={18} />
                  ) : (
                    <Circle className="text-slate-500 shrink-0 mt-0.5" size={18} />
                  )}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`font-bold text-xs sm:text-sm ${
                          item.is_completed ? 'line-through text-slate-500' : 'text-white'
                        }`}
                      >
                        {item.title}
                      </span>
                      {item.is_critical === 1 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          חובה
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Complete Sources Directory */}
      <section className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 space-y-5">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FolderOpen className="text-blue-400" size={22} />
          <span>אינדקס מקורות ולינקים ישירים ({sources.length})</span>
        </h2>

        <div className="space-y-5">
          {Object.entries(sourcesByCat).map(([cat, list]) => (
            <div key={cat} className="space-y-2">
              <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-1">{cat}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {list.map((src) => (
                  <a
                    key={src.id}
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl border border-slate-800 bg-slate-800/40 hover:border-blue-500/50 hover:bg-slate-800 transition-all block"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs font-bold text-blue-400">
                      <span className="truncate">{src.title}</span>
                      <ExternalLink size={12} className="shrink-0" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{src.description}</p>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
