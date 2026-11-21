import { useEffect, useState } from 'react';
import {
  MapPin,
  ExternalLink,
  AlertTriangle,
  ShieldCheck,
  HeartPulse,
  GraduationCap,
  Calculator,
  Check,
  Database,
} from 'lucide-react';
import { api } from '../api/client';

export default function LocationsPage() {
  const [data, setData] = useState(null);
  const [selectedSlugs, setSelectedSlugs] = useState(['dallas', 'houston', 'beachwood', 'cherry-hill']);
  const [salaryUsd, setSalaryUsd] = useState(140000);
  const [capitalUsd, setCapitalUsd] = useState(135000);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getLocations()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="py-16 text-center text-slate-400">טוען נתוני ערים ופרברים...</div>;
  }

  const { locations, budgetItems, sources } = data;

  const toggleCity = (slug) => {
    setSelectedSlugs((prev) => {
      if (prev.includes(slug)) {
        return prev.length > 1 ? prev.filter((s) => s !== slug) : prev;
      }
      return [...prev, slug];
    });
  };

  const compared = locations.filter((l) => selectedSlugs.includes(l.slug));
  const setupCostAvg = 45000;
  const remainingBuffer = Math.max(0, capitalUsd - setupCostAvg);

  const totals = budgetItems.reduce(
    (acc, item) => ({
      hMin: acc.hMin + item.houston_min,
      hMax: acc.hMax + item.houston_max,
      dMin: acc.dMin + item.dallas_min,
      dMax: acc.dMax + item.dallas_max,
      aMin: acc.aMin + item.atlanta_min,
      aMax: acc.aMax + item.atlanta_max,
    }),
    { hMin: 0, hMax: 0, dMin: 0, dMax: 0, aMin: 0, aMax: 0 }
  );

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          השוואת יעדים: עלויות מחיה, מיסוי, אסונות טבע ואנטישמיות
        </h1>
        <p className="text-sm text-slate-400">
          השוואה בין המטרופולינים המרכזיים (יוסטון, דאלאס/פלאנו, אטלנטה) לבין 3 חלופות דומות-פלאנו עם סיכון FEMA נמוך יותר.
        </p>
      </header>

      {/* City Selector Pills */}
      <section className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-3">
        <div className="text-sm font-bold text-slate-200">בחר ערים להשוואה ראש-בראש (Diff):</div>
        <div className="flex flex-wrap gap-2">
          {locations.map((loc) => {
            const active = selectedSlugs.includes(loc.slug);
            return (
              <button
                key={loc.slug}
                onClick={() => toggleCity(loc.slug)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                  active
                    ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20'
                    : 'bg-slate-800/70 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                {active && <Check size={14} />}
                <span>{loc.name_he}</span>
                <span className={`text-[11px] px-1.5 py-0.5 rounded ${active ? 'bg-blue-500/80 text-white' : 'bg-slate-700 text-slate-300'}`}>
                  {loc.tier === 1 ? 'יעד ראשי' : 'חלופת פלאנו'}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Interactive Tax & Runway Simulator */}
      <section className="bg-gradient-to-l from-indigo-950/90 to-slate-900 border border-indigo-500/30 text-white rounded-2xl p-6 shadow-lg space-y-5">
        <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
          <Calculator size={18} />
          <span>סימולטור מס הכנסה מדינתי ואורך נשימה (Runway) לפי הון עצמי</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">שכר שנתי ברוטו משוער:</span>
              <span className="font-bold text-white">${salaryUsd.toLocaleString()} / שנה</span>
            </div>
            <input
              type="range"
              min={90000}
              max={240000}
              step={5000}
              value={salaryUsd}
              onChange={(e) => setSalaryUsd(Number(e.target.value))}
              className="w-full accent-blue-400 cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">הון עצמי התחלתי (ברירת מחדל 500K ₪):</span>
              <span className="font-bold text-white">
                ${capitalUsd.toLocaleString()} (~₪{Math.round(capitalUsd * 3.7).toLocaleString()})
              </span>
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
            <div className="text-xs text-slate-400">
              לאחר קיזוז ~$45,000 עלויות הקמה (רכבים, פיקדונות, ריהוט): נותרים{' '}
              <strong className="text-emerald-300">${remainingBuffer.toLocaleString()}</strong> למחיה שוטפת.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {compared.map((loc) => {
            const annualStateTax = Math.round((salaryUsd * loc.state_tax_pct) / 100);
            const avgMonthly = Math.round((loc.total_monthly_min + loc.total_monthly_max) / 2);
            const runwayMonths = Math.round((remainingBuffer / avgMonthly) * 10) / 10;
            return (
              <div key={loc.slug} className="bg-slate-950/60 border border-white/10 rounded-xl p-4 space-y-1.5">
                <div className="font-bold text-sm text-white truncate">{loc.name_he}</div>
                <div className="text-xs text-slate-300">
                  מס מדינתי ({loc.state_tax_pct}%):{' '}
                  <span className={annualStateTax === 0 ? 'text-emerald-400 font-bold' : 'text-amber-300 font-bold'}>
                    ${annualStateTax.toLocaleString()} / שנה
                  </span>
                </div>
                <div className="text-xs text-slate-300">
                  הוצאה ממוצעת: <span className="font-semibold text-white">${avgMonthly.toLocaleString()}/חודש</span>
                </div>
                <div className="text-xs text-emerald-400 font-bold pt-1 border-t border-white/10">
                  אורך נשימה ללא עבודה: ~{runwayMonths} חודשים
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Side-by-Side Diff Cards */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {compared.map((loc) => {
          const isLowRisk = loc.fema_risk_level.includes('נמוך');
          return (
            <article
              key={loc.slug}
              className="bg-slate-900/80 rounded-2xl border border-slate-800 shadow-sm overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-slate-800 bg-slate-900 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-blue-400 shrink-0" />
                    <h2 className="text-lg font-extrabold text-white">{loc.name_he}</h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {loc.name_en} • {loc.metro_he}
                  </p>
                </div>
                <div className="text-left shrink-0">
                  <div className="text-sm font-extrabold text-white">
                    ${loc.total_monthly_min.toLocaleString()}–${loc.total_monthly_max.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400">עלות חודשית (4 נפשות)</div>
                </div>
              </div>

              <div className="p-5 space-y-4 text-sm flex-1">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/70">
                    <div className="text-slate-400">שכירות בית פרטי (3–4 חד׳)</div>
                    <div className="font-bold text-white text-sm mt-0.5">
                      ${loc.rent_min.toLocaleString()}–${loc.rent_max.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/70">
                    <div className="text-slate-400">מס הכנסה מדינתי</div>
                    <div className={`font-bold text-sm mt-0.5 ${loc.state_tax_pct === 0 ? 'text-emerald-400' : 'text-white'}`}>
                      {loc.state_tax_label}
                    </div>
                  </div>
                </div>

                <div
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    isLowRisk
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-amber-500/10 border-amber-500/30'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 text-white">
                    <AlertTriangle size={15} className={isLowRisk ? 'text-emerald-400' : 'text-amber-400'} />
                    <span>סיכון FEMA: {loc.fema_risk_level}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{loc.fema_risk_summary}</p>
                  <p className="text-slate-200 font-medium pt-1 border-t border-white/10">
                    השפעה על סוכרת/אינסולין: {loc.diabetes_power_impact}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-blue-300">
                    <ShieldCheck size={15} className="text-blue-400" />
                    <span>קהילה יהודית ({loc.jewish_community_level}) ואנטישמיות (ADL)</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{loc.jewish_community_details}</p>
                  <p className="text-slate-300 leading-relaxed">{loc.antisemitism_summary}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 space-y-1">
                    <div className="font-bold text-rose-300 flex items-center gap-1.5">
                      <HeartPulse size={14} className="text-rose-400" />
                      <span>{loc.diabetes_hospital}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{loc.diabetes_hospital_note}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-1">
                    <div className="font-bold text-slate-200 flex items-center gap-1.5">
                      <GraduationCap size={14} className="text-slate-400" />
                      <span>חינוך ציבורי</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{loc.schools_rating}</p>
                    <p className="text-slate-400">{loc.property_tax_note}</p>
                  </div>
                </div>

                <div className="text-xs space-y-1 pt-1">
                  <div>
                    <span className="font-bold text-emerald-400">יתרונות בולטים: </span>
                    <span className="text-slate-300">{loc.highlights}</span>
                  </div>
                  <div>
                    <span className="font-bold text-rose-400">חסרונות / שימו לב: </span>
                    <span className="text-slate-300">{loc.drawbacks}</span>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 flex flex-wrap gap-4 text-xs font-semibold">
                <a
                  href={loc.official_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 hover:underline"
                >
                  <span>אתר העיר הרשמי</span>
                  <ExternalLink size={12} />
                </a>
                {loc.niche_url && (
                  <a
                    href={loc.niche_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 hover:underline"
                  >
                    <span>תמונות ושכונות ב-Niche</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </section>

      {/* Detailed Monthly Budget Table */}
      <section className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white">פירוט תקציב חודשי לפי סעיפים: יוסטון מול דאלאס מול אטלנטה</h2>
          <p className="text-xs text-slate-400">
            נתוני מחיה מתוקננים לאוקטובר 2026 למשפחה בת 4 נפשות בבית פרטי (3–4 חדרים), 2 רכבים וביטוח מעסיק.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead>
              <tr className="border-b border-slate-700 text-slate-300 text-xs bg-slate-800/60">
                <th className="py-3 px-3 font-bold">סעיף הוצאה</th>
                <th className="py-3 px-3 font-bold">יוסטון (TX)</th>
                <th className="py-3 px-3 font-bold">דאלאס-פורט וורת׳ (TX)</th>
                <th className="py-3 px-3 font-bold">אטלנטה (GA)</th>
                <th className="py-3 px-3 font-bold">הערות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-300">
              {budgetItems.map((row) => (
                <tr key={row.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-semibold text-white">{row.category}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap">${row.houston_min}–${row.houston_max}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap">${row.dallas_min}–${row.dallas_max}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap">${row.atlanta_min}–${row.atlanta_max}</td>
                  <td className="py-2.5 px-3 text-xs text-slate-400">{row.notes}</td>
                </tr>
              ))}
              <tr className="bg-blue-950/60 text-white font-bold border-t border-blue-500/30">
                <td className="py-3 px-3">סה״כ הוצאות מחיה שוטפות</td>
                <td className="py-3 px-3 whitespace-nowrap">${totals.hMin.toLocaleString()}–${totals.hMax.toLocaleString()}</td>
                <td className="py-3 px-3 whitespace-nowrap">${totals.dMin.toLocaleString()}–${totals.dMax.toLocaleString()}</td>
                <td className="py-3 px-3 whitespace-nowrap">${totals.aMin.toLocaleString()}–${totals.aMax.toLocaleString()}</td>
                <td className="py-3 px-3 text-xs font-normal text-blue-200">
                  לפני מס מדינתי: 0% בטקסס מול ~5.39% בג׳ורג׳יה ($450–$650/חודש)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Official Sources */}
      <section className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 space-y-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Database size={18} className="text-blue-400" />
          <span>מקורות נתונים רשמיים ואתרי מיקום ({sources.length})</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sources.map((src) => (
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
      </section>
    </div>
  );
}
