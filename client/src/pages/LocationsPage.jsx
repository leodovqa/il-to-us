import { Fragment, useEffect, useMemo, useState } from 'react';
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
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Table2,
} from 'lucide-react';
import { api } from '../api/client';

export default function LocationsPage() {
  const [data, setData] = useState(null);
  const [selectedSlugs, setSelectedSlugs] = useState([]);
  const [baselineSlug, setBaselineSlug] = useState('dallas');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [sortBy, setSortBy] = useState('monthly'); // 'monthly' | 'rent' | 'tax' | 'runway' | 'fema'
  const [sortDir, setSortDir] = useState('asc');
  const [expandedSlug, setExpandedSlug] = useState(null);
  const [salaryUsd, setSalaryUsd] = useState(100000);
  const [capitalUsd, setCapitalUsd] = useState(151500);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getLocations()
      .then((res) => {
        setData(res);
        setSelectedSlugs(res.locations.map((l) => l.slug));
      })
      .finally(() => setLoading(false));
  }, []);

  const femaRank = (level) => {
    if (level.includes('Very Low')) return 1;
    if (level.includes('Relatively Low')) return 2;
    if (level.includes('Relatively Moderate') || level.includes('בינוני')) return 3;
    if (level.includes('Relatively High')) return 4;
    return 5;
  };

  const setupCostAvg = 59000;
  const remainingBuffer = Math.max(0, capitalUsd - setupCostAvg);

  const compared = useMemo(() => {
    if (!data) return [];
    const list = data.locations.filter((l) => selectedSlugs.includes(l.slug));
    return [...list].sort((a, b) => {
      let va = 0;
      let vb = 0;
      if (sortBy === 'monthly') {
        va = (a.total_monthly_min + a.total_monthly_max) / 2;
        vb = (b.total_monthly_min + b.total_monthly_max) / 2;
      } else if (sortBy === 'rent') {
        va = (a.rent_min + a.rent_max) / 2;
        vb = (b.rent_min + b.rent_max) / 2;
      } else if (sortBy === 'tax') {
        va = a.state_tax_pct;
        vb = b.state_tax_pct;
      } else if (sortBy === 'runway') {
        va = remainingBuffer / ((a.total_monthly_min + a.total_monthly_max) / 2);
        vb = remainingBuffer / ((b.total_monthly_min + b.total_monthly_max) / 2);
      } else if (sortBy === 'fema') {
        va = femaRank(a.fema_risk_level);
        vb = femaRank(b.fema_risk_level);
      }
      return sortDir === 'asc' ? va - vb : vb - va;
    });
  }, [data, selectedSlugs, sortBy, sortDir, remainingBuffer]);

  if (loading || !data) {
    return <div className="py-16 text-center text-slate-400">טוען נתוני ערים ופרברים...</div>;
  }

  const { locations, budgetItems, sources } = data;
  const baseline = locations.find((l) => l.slug === baselineSlug) || locations[0];
  const baseMonthlyAvg = Math.round((baseline.total_monthly_min + baseline.total_monthly_max) / 2);
  const baseRentAvg = Math.round((baseline.rent_min + baseline.rent_max) / 2);
  const baseTaxAnnual = Math.round((salaryUsd * baseline.state_tax_pct) / 100);
  const baseRunway = Math.round((remainingBuffer / baseMonthlyAvg) * 10) / 10;

  const toggleCity = (slug) => {
    setSelectedSlugs((prev) => {
      if (prev.includes(slug)) {
        return prev.length > 1 ? prev.filter((s) => s !== slug) : prev;
      }
      return [...prev, slug];
    });
  };

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(col);
      setSortDir(col === 'runway' ? 'desc' : 'asc');
    }
  };

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

  const formatDiff = (val, suffix = '', invertGood = false) => {
    if (val === 0) return { text: 'בסיס', cls: 'text-slate-400 bg-slate-800 border-slate-700' };
    const isGood = invertGood ? val > 0 : val < 0;
    const sign = val > 0 ? '+' : '-';
    return {
      text: `${sign}${Math.abs(val).toLocaleString()}${suffix}`,
      cls: isGood
        ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
        : 'text-rose-300 bg-rose-500/15 border-rose-500/30',
    };
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          השוואת יעדים ({locations.length}): עלויות מחיה, מיסוי, FEMA, פשיעה וקהילה
        </h1>
        <p className="text-sm text-slate-400">
          טבלת השוואה (Diff) אינטראקטיבית לכל {locations.length} הערים והפרברים — מציגה הפרשים מדויקים מול עיר הבסיס שתבחרו.
        </p>
      </header>

      {/* Interactive Tax & Runway Simulator */}
      <section className="bg-gradient-to-l from-indigo-950/90 to-slate-900 border border-indigo-500/30 text-white rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
            <Calculator size={18} />
            <span>סימולטור שכר ($100K ברירת מחדל), הון עצמי ועיר בסיס להשוואה</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold">השווה Diff מול:</span>
            <select
              value={baselineSlug}
              onChange={(e) => setBaselineSlug(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-2.5 py-1.5 font-semibold cursor-pointer"
            >
              {locations.map((l) => (
                <option key={l.slug} value={l.slug}>
                  {l.name_he}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">שכר שנתי ברוטו משוער:</span>
              <span className="font-bold text-white">${salaryUsd.toLocaleString()} / שנה</span>
            </div>
            <input
              type="range"
              min={80000}
              max={240000}
              step={5000}
              value={salaryUsd}
              onChange={(e) => setSalaryUsd(Number(e.target.value))}
              className="w-full accent-blue-400 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">הון עצמי התחלתי (ברירת מחדל 500K ₪):</span>
              <span className="font-bold text-white">
                ${capitalUsd.toLocaleString()} (~₪{Math.round(capitalUsd * 3.3).toLocaleString()})
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
              לאחר קיזוז ~$59,000 עלויות הקמה (2 רכבי CarMax, פיקדונות, ריהוט): נותרים{' '}
              <strong className="text-emerald-300">${remainingBuffer.toLocaleString()}</strong> למחיה שוטפת.
            </div>
          </div>
        </div>
      </section>

      {/* City Selector + Presets + View Toggle */}
      <section className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-bold text-slate-300 ml-1">סינון מהיר:</span>
            <button
              onClick={() => setSelectedSlugs(locations.map((l) => l.slug))}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 cursor-pointer"
            >
              כל ה-{locations.length}
            </button>
            <button
              onClick={() =>
                setSelectedSlugs(locations.filter((l) => l.fema_risk_level.includes('נמוך')).map((l) => l.slug))
              }
              className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-semibold cursor-pointer"
            >
              FEMA נמוך בלבד (3)
            </button>
            <button
              onClick={() => setSelectedSlugs(locations.filter((l) => l.tier === 1).map((l) => l.slug))}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 cursor-pointer"
            >
              יעדים ראשיים (3)
            </button>
          </div>

          <div className="flex gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md cursor-pointer transition-colors ${
                viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table2 size={14} />
              <span>טבלת Diff</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md cursor-pointer transition-colors ${
                viewMode === 'cards' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid size={14} />
              <span>כרטיסים</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {locations.map((loc) => {
            const active = selectedSlugs.includes(loc.slug);
            return (
              <button
                key={loc.slug}
                onClick={() => toggleCity(loc.slug)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  active
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-slate-800/70 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                {active && <Check size={12} />}
                <span>{loc.name_he.split('(')[0].trim()}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Logical Diff Comparison Table */}
      {viewMode === 'table' ? (
        <section className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>
              מציג <strong className="text-white">{compared.length}</strong> ערים • הפרשים (Diff) מחושבים מול{' '}
              <strong className="text-blue-400">{baseline.name_he}</strong> • לחץ על כותרת עמודה למיון או על שורה לפירוט מלא
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/60 text-slate-300">
                  <th className="py-3 px-3 font-bold">עיר / פרבר</th>
                  <th className="py-3 px-3 font-bold">
                    <button onClick={() => handleSort('monthly')} className="inline-flex items-center gap-1 cursor-pointer hover:text-white">
                      <span>עלות חודשית (Diff)</span>
                      <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th className="py-3 px-3 font-bold">
                    <button onClick={() => handleSort('rent')} className="inline-flex items-center gap-1 cursor-pointer hover:text-white">
                      <span>שכירות 3–4 חד׳ (Diff)</span>
                      <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th className="py-3 px-3 font-bold">
                    <button onClick={() => handleSort('tax')} className="inline-flex items-center gap-1 cursor-pointer hover:text-white">
                      <span>מס מדינתי/מקומי (Diff)</span>
                      <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th className="py-3 px-3 font-bold">
                    <button onClick={() => handleSort('runway')} className="inline-flex items-center gap-1 cursor-pointer hover:text-white">
                      <span>אורך נשימה (Diff)</span>
                      <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th className="py-3 px-3 font-bold">
                    <button onClick={() => handleSort('fema')} className="inline-flex items-center gap-1 cursor-pointer hover:text-white">
                      <span>סיכון FEMA</span>
                      <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th className="py-3 px-3 font-bold">קהילה וחינוך</th>
                  <th className="py-3 px-3 font-bold">מרכז סוכרת (T1D)</th>
                  <th className="py-3 px-2 font-bold text-center">פירוט</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {compared.map((loc) => {
                  const monthlyAvg = Math.round((loc.total_monthly_min + loc.total_monthly_max) / 2);
                  const rentAvg = Math.round((loc.rent_min + loc.rent_max) / 2);
                  const taxAnnual = Math.round((salaryUsd * loc.state_tax_pct) / 100);
                  const runway = Math.round((remainingBuffer / monthlyAvg) * 10) / 10;

                  const monthlyDiff = formatDiff(monthlyAvg - baseMonthlyAvg, '$');
                  const rentDiff = formatDiff(rentAvg - baseRentAvg, '$');
                  const taxDiff = formatDiff(taxAnnual - baseTaxAnnual, '$');
                  const runwayDiff = formatDiff(Math.round((runway - baseRunway) * 10) / 10, ' ח׳', true);

                  const isLowRisk = loc.fema_risk_level.includes('נמוך');
                  const isModRisk = loc.fema_risk_level.includes('בינוני');
                  const isBase = loc.slug === baseline.slug;
                  const isExpanded = expandedSlug === loc.slug;

                  return (
                    <Fragment key={loc.slug}>
                      <tr
                        onClick={() => setExpandedSlug(isExpanded ? null : loc.slug)}
                        className={`cursor-pointer transition-colors ${
                          isBase ? 'bg-blue-500/5 hover:bg-blue-500/10' : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-3 px-3">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{loc.name_he.split('(')[0].trim()}</span>
                            {isBase && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                בסיס
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{loc.state_he} • {loc.name_en}</div>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-semibold text-white">
                            ${loc.total_monthly_min.toLocaleString()}–${loc.total_monthly_max.toLocaleString()}
                          </div>
                          <span className={`inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${monthlyDiff.cls}`}>
                            {monthlyDiff.text}
                          </span>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-semibold text-slate-200">
                            ${loc.rent_min.toLocaleString()}–${loc.rent_max.toLocaleString()}
                          </div>
                          <span className={`inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${rentDiff.cls}`}>
                            {rentDiff.text}
                          </span>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-semibold text-slate-200">
                            {loc.state_tax_pct}% (${taxAnnual.toLocaleString()}/שנה)
                          </div>
                          <span className={`inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${taxDiff.cls}`}>
                            {taxDiff.text}
                          </span>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-bold text-emerald-400">~{runway} ח׳</div>
                          <span className={`inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${runwayDiff.cls}`}>
                            {runwayDiff.text}
                          </span>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                              isLowRisk
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : isModRisk
                                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                  : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                            }`}
                          >
                            {loc.fema_risk_level.split('(')[0].trim()}
                          </span>
                        </td>

                        <td className="py-3 px-3 max-w-[200px]">
                          <div className="font-semibold text-slate-200 truncate">{loc.jewish_community_level}</div>
                          <div className="text-[11px] text-slate-400 truncate">{loc.schools_rating}</div>
                        </td>

                        <td className="py-3 px-3 max-w-[190px]">
                          <div className="font-semibold text-rose-300 truncate">{loc.diabetes_hospital}</div>
                        </td>

                        <td className="py-3 px-2 text-center text-slate-400">
                          {isExpanded ? <ChevronUp size={16} className="inline" /> : <ChevronDown size={16} className="inline" />}
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-slate-800/30">
                          <td colSpan={9} className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                              <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/70 space-y-1">
                                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                                  <AlertTriangle size={14} />
                                  <span>FEMA וחשמל לאינסולין</span>
                                </div>
                                <p className="text-slate-300 leading-relaxed">{loc.fema_risk_summary}</p>
                                <p className="text-slate-400 pt-1 border-t border-slate-800">{loc.diabetes_power_impact}</p>
                              </div>

                              <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/70 space-y-1">
                                <div className="font-bold text-blue-400 flex items-center gap-1.5">
                                  <ShieldCheck size={14} />
                                  <span>קהילה יהודית, פשיעה ואנטישמיות</span>
                                </div>
                                <p className="text-slate-300 leading-relaxed">{loc.jewish_community_details}</p>
                                <p className="text-slate-400 pt-1 border-t border-slate-800">{loc.antisemitism_summary}</p>
                              </div>

                              <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/70 space-y-1.5">
                                <div className="font-bold text-rose-400 flex items-center gap-1.5">
                                  <HeartPulse size={14} />
                                  <span>{loc.diabetes_hospital} & סיכום</span>
                                </div>
                                <p className="text-slate-300 leading-relaxed">{loc.diabetes_hospital_note}</p>
                                <div className="text-emerald-300"><strong>יתרונות:</strong> {loc.highlights}</div>
                                <div className="text-rose-300"><strong>חסרונות:</strong> {loc.drawbacks}</div>
                                <div className="flex gap-3 pt-1">
                                  <a href={loc.official_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-1">
                                    אתר העיר <ExternalLink size={11} />
                                  </a>
                                  {loc.niche_url && (
                                    <a href={loc.niche_url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline inline-flex items-center gap-1">
                                      Niche <ExternalLink size={11} />
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        /* Side-by-Side Diff Cards */
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
                      <div className="text-slate-400">מס הכנסה (מדינתי/מקומי)</div>
                      <div className={`font-bold text-sm mt-0.5 ${loc.state_tax_pct === 0 ? 'text-emerald-400' : 'text-white'}`}>
                        {loc.state_tax_label}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                      isLowRisk ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'
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
                      <span>קהילה יהודית ({loc.jewish_community_level}) ופשיעה/אנטישמיות</span>
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
      )}

      {/* Detailed Monthly Budget Table */}
      <section className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white">פירוט תקציב חודשי לפי סעיפים: יוסטון מול דאלאס מול אטלנטה</h2>
          <p className="text-xs text-slate-400">
            נתוני מחיה מתוקננים ל-2026 למשפחה בת 4 נפשות בבית פרטי (3–4 חדרים), 2 רכבים וביטוח מעסיק.
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
                  לפני מס מדינתי: 0% בטקסס מול 4.99% בג׳ורג׳יה (~$375/חודש על $100K)
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
