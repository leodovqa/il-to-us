import { useEffect, useMemo, useState } from 'react';
import {
  ShieldCheck,
  GraduationCap,
  HeartPulse,
  Zap,
  Car,
  Briefcase,
  Home,
  ExternalLink,
  Search,
  Sparkles,
  AlertTriangle,
  Users,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Database,
  X,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { api } from '../api/client';

function GradeBadge({ label, grade, accent = 'emerald' }) {
  const colors =
    accent === 'emerald'
      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
      : accent === 'blue'
      ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
      : 'bg-amber-500/15 text-amber-300 border-amber-500/30';

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${colors}`}>
      <span className="opacity-80">{label}:</span>
      <span className="font-bold">{grade}</span>
    </div>
  );
}

function PlaceDossierContent({ place, surplus }) {
  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-100">{place.name_he}</h2>
            <span className="text-xs text-slate-400">({place.name_en})</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
              ציון שקט נפשי: {place.peace_of_mind_score}/100
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {place.county_he} · {place.metro_he} · מס מדינתי {place.state_income_tax_pct}%
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <GradeBadge label="Niche כללי" grade={place.niche_overall_grade} accent="emerald" />
            <GradeBadge label="פשיעה ובטיחות" grade={place.niche_crime_grade} accent="emerald" />
            <GradeBadge label="בתי ספר ציבוריים" grade={place.niche_schools_grade} accent="blue" />
            <GradeBadge label="משפחות" grade={place.niche_family_grade} accent="blue" />
            <GradeBadge label="יוקר מחיה" grade={place.niche_col_grade} accent="amber" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href={place.niche_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            <span>Niche</span>
            <ExternalLink size={12} />
          </a>
          <a
            href={place.zillow_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            <span>Zillow</span>
            <ExternalLink size={12} />
          </a>
          <a
            href={place.fema_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            <span>FEMA NRI</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* 6-Domain Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {/* 1. Housing & Monthly Budget */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-blue-300">
            <Home size={16} />
            <span>דיור, היצע ועלות מחיה</span>
          </div>
          <div className="text-xs space-y-1 text-slate-300">
            <div>
              <span className="text-slate-400">שכירות 3 חדרי שינה: </span>
              <span className="font-bold text-slate-100">
                ${place.rent_3br_min.toLocaleString()}–${place.rent_3br_max.toLocaleString()}/חודש
              </span>
            </div>
            <div>
              <span className="text-slate-400">קניית בית (חציון): </span>
              <span className="font-bold text-slate-100">${place.home_buy_median.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-400">תקציב משפחתי כולל: </span>
              <span className="font-bold text-slate-100">
                ${place.total_monthly_min.toLocaleString()}–${place.total_monthly_max.toLocaleString()}/חודש
              </span>
            </div>
            <div>
              <span className="text-slate-400">הערכת עודף בסימולטור: </span>
              <span className={`font-bold ${surplus >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {surplus >= 0 ? '+' : ''}${surplus.toLocaleString()}/חודש
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed pt-1">{place.housing_supply_note}</p>
        </div>

        {/* 2. FEMA & Power Grid */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 space-y-2 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
              <Zap size={16} />
              <span>FEMA, אסונות טבע וחשמל</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded-md text-xs font-bold border ${
                place.fema_combined_severity <= 52
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : place.fema_combined_severity <= 62
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
              }`}
            >
              חומרה משולבת: {place.fema_combined_severity}/100
            </span>
          </div>
          <div className="text-xs space-y-1 text-slate-300">
            <div className="grid grid-cols-2 gap-2 py-1">
              <div className="bg-slate-900/60 border border-slate-700/70 rounded-lg px-2.5 py-1.5">
                <div className="text-[10px] text-slate-400">אזור ספציפי (פרבר)</div>
                <div className="font-bold text-emerald-300">{place.fema_area_rating}</div>
              </div>
              <div className="bg-slate-900/60 border border-slate-700/70 rounded-lg px-2.5 py-1.5">
                <div className="text-[10px] text-slate-400">מחוז סובב (County)</div>
                <div
                  className={`font-bold ${
                    place.fema_county_rating === 'Relatively Low'
                      ? 'text-emerald-300'
                      : place.fema_county_rating === 'Relatively Moderate'
                      ? 'text-amber-300'
                      : 'text-rose-300'
                  }`}
                >
                  {place.fema_county_rating} ({place.fema_county_score})
                </div>
              </div>
            </div>
            <div>
              <span className="text-slate-400">הכרזות פדרליות היסטוריות: </span>
              <span className="font-bold text-slate-100">{place.fema_total_declarations}</span>
            </div>
            <div>
              <span className="text-slate-400">הכרזה אחרונה: </span>
              <span className="text-slate-200">{place.fema_last_declaration}</span>
            </div>
            <div>
              <span className="text-slate-400">ספק חשמל: </span>
              <span className="font-semibold text-slate-100">{place.power_grid_operator}</span>
            </div>
          </div>
          {(() => {
            let h = null;
            try {
              h = JSON.parse(place.fema_hazard_breakdown || '{}');
            } catch {
              h = null;
            }
            if (!h || !h.flood) return null;
            const rows = [
              { key: 'hurricane', label: 'הוריקן' },
              { key: 'wildfire', label: 'שריפות יער' },
              { key: 'tornado', label: 'טורנדו' },
              { key: 'flood', label: 'הצפות' },
              { key: 'winter_ice', label: 'שלג/קרח' },
              { key: 'earthquake', label: 'רעידות אדמה' },
            ];
            return (
              <div className="mt-2 border border-slate-700/80 rounded-lg overflow-hidden">
                <table className="w-full text-[11px] text-right">
                  <thead className="bg-slate-800 text-slate-400">
                    <tr>
                      <th className="py-1 px-2">קטגוריה</th>
                      <th className="py-1 px-2 text-center">הכרזות</th>
                      <th className="py-1 px-2">אחרון</th>
                      <th className="py-1 px-2 text-left">NRI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {rows.map((r) => {
                      const item = h[r.key];
                      if (!item) return null;
                      return (
                        <tr key={r.key} className="bg-slate-900/40">
                          <td className="py-1 px-2 font-medium text-slate-200">{r.label}</td>
                          <td className="py-1 px-2 text-center font-bold text-slate-100">{item.count}</td>
                          <td className="py-1 px-2 text-slate-400 truncate max-w-[95px]" title={item.last}>
                            {item.last}
                          </td>
                          <td className="py-1 px-2 text-left font-semibold text-slate-300">{item.score}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
          <p className="text-xs text-slate-300 leading-relaxed pt-1">{place.fema_hazards_note}</p>
          <p className="text-xs text-slate-400 leading-relaxed">{place.power_grid_reliability}</p>
        </div>

        {/* 3. Type 1 Diabetes Care */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-rose-300">
            <HeartPulse size={16} />
            <span>רפואה וסוכרת סוג 1 (T1D)</span>
          </div>
          <div className="text-xs space-y-1 text-slate-300">
            <div>
              <span className="text-slate-400">מרכז רפואי: </span>
              <span className="font-bold text-slate-100">{place.t1d_hospital_name}</span>
            </div>
            <div>
              <span className="text-slate-400">זמן נסיעה: </span>
              <span className="font-bold text-emerald-300">{place.t1d_hospital_drive_min} דקות</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed pt-1">{place.t1d_supplies_access}</p>
        </div>

        {/* 4. Work: Senior QA + Spouse Part-Time */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
            <Briefcase size={16} />
            <span>תעסוקה: QA בכיר + בת זוג</span>
          </div>
          <div className="text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-slate-100">QA בכיר: </span>
            {place.qa_remote_and_local_jobs}
          </div>
          <div className="text-xs text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-200">בת זוג (אנגלית בסיסית, שעות גמישות): </span>
            {place.spouse_parttime_jobs}
          </div>
        </div>

        {/* 5. 1 Solid Low-Cost Car */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-cyan-300">
            <Car size={16} />
            <span>רכב משפחתי אחד אמין וזול</span>
          </div>
          <div className="text-xs space-y-1 text-slate-300">
            <div>
              <span className="text-slate-400">דגם מומלץ: </span>
              <span className="font-bold text-slate-100">{place.recommended_car_model}</span>
            </div>
            <div>
              <span className="text-slate-400">תקציב קנייה משוער: </span>
              <span className="font-bold text-slate-100">${place.car_buy_budget_usd.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-400">ביטוח רכב חודשי: </span>
              <span className="font-bold text-emerald-300">
                ${place.car_insurance_monthly_min}–${place.car_insurance_monthly_max}/חודש
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed pt-1">{place.car_notes}</p>
        </div>

        {/* 6. Community + Highlights/Watchouts */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-purple-300">
            <Users size={16} />
            <span>קהילה, יתרונות ונקודות לבדיקה</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{place.jewish_israeli_community}</p>
          <div className="flex items-start gap-1.5 text-xs text-emerald-300 pt-1">
            <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
            <span>{place.highlights}</span>
          </div>
          <div className="flex items-start gap-1.5 text-xs text-amber-300">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>{place.watchouts}</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default function NicheDbPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [femaFilter, setFemaFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('score');
  const [qaSalaryAnnual, setQaSalaryAnnual] = useState(120000);
  const [spouseMonthlyNet, setSpouseMonthlyNet] = useState(1400);
  const [modalSlug, setModalSlug] = useState(null);
  const [showAllCards, setShowAllCards] = useState(false);

  useEffect(() => {
    api
      .getNicheDb()
      .then((res) => setData(res))
      .finally(() => setLoading(false));
  }, []);

  const filteredPlaces = useMemo(() => {
    if (!data?.places) return [];
    let list = [...data.places];

    if (stateFilter !== 'ALL') {
      list = list.filter((p) => p.state_code === stateFilter);
    }
    if (femaFilter === 'LOW') {
      list = list.filter((p) => p.fema_nri_rating === 'Relatively Low' || p.fema_nri_rating === 'Very Low');
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name_he.toLowerCase().includes(q) ||
          p.name_en.toLowerCase().includes(q) ||
          p.metro_he.toLowerCase().includes(q) ||
          p.t1d_hospital_name.toLowerCase().includes(q) ||
          p.qa_remote_and_local_jobs.toLowerCase().includes(q) ||
          p.spouse_parttime_jobs.toLowerCase().includes(q) ||
          p.recommended_car_model.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'score') return b.peace_of_mind_score - a.peace_of_mind_score;
      if (sortBy === 'fema_severity') return a.fema_combined_severity - b.fema_combined_severity;
      if (sortBy === 'monthly') return a.total_monthly_min - b.total_monthly_min;
      if (sortBy === 'rent') return a.rent_3br_min - b.rent_3br_min;
      if (sortBy === 'buy') return a.home_buy_median - b.home_buy_median;
      if (sortBy === 'hospital') return a.t1d_hospital_drive_min - b.t1d_hospital_drive_min;
      return 0;
    });

    return list;
  }, [data, stateFilter, femaFilter, query, sortBy]);

  const modalIndex = useMemo(
    () => (modalSlug ? filteredPlaces.findIndex((p) => p.slug === modalSlug) : -1),
    [filteredPlaces, modalSlug]
  );
  const modalPlace = modalIndex >= 0 ? filteredPlaces[modalIndex] : null;

  useEffect(() => {
    if (!modalPlace) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setModalSlug(null);
      } else if (e.key === 'ArrowLeft' && filteredPlaces.length > 1) {
        // RTL: Left arrow goes to next
        const nextIdx = (modalIndex + 1) % filteredPlaces.length;
        setModalSlug(filteredPlaces[nextIdx].slug);
      } else if (e.key === 'ArrowRight' && filteredPlaces.length > 1) {
        // RTL: Right arrow goes to previous
        const prevIdx = (modalIndex - 1 + filteredPlaces.length) % filteredPlaces.length;
        setModalSlug(filteredPlaces[prevIdx].slug);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalPlace, modalIndex, filteredPlaces]);

  if (loading || !data) {
    return <div className="py-16 text-center text-slate-400">טוען מאגר Niche DB...</div>;
  }

  const estimateNetMonthly = (place) => {
    const effectiveTaxRate = 0.21 + place.state_income_tax_pct / 100;
    const qaNetMonthly = Math.round((qaSalaryAnnual * (1 - effectiveTaxRate)) / 12);
    return qaNetMonthly + spouseMonthlyNet;
  };

  const getSurplus = (place) => {
    const netMonthly = estimateNetMonthly(place);
    const avgCost = Math.round((place.total_monthly_min + place.total_monthly_max) / 2);
    return netMonthly - avgCost;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Database size={14} />
              <span>מאגר Niche DB · נשמר ב-SQLite (niche_db_places)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
              מאגר הערים והפרברים השקטים (Niche DB)
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              מחקר ממוקד עבור משפחה ברילוקיישן עם 2 ילדים (אחד עם סוכרת סוג 1), משרת Senior QA (עבודה מהבית + גיבוי מקומי),
              עבודה חלקית גמישה לבת הזוג, ורכב משפחתי אחד אמין וזול — רק מקומות שעומדים בסינון הקשיח:
            </p>
          </div>
          <div className="bg-slate-800/70 border border-slate-700 rounded-xl px-4 py-3 text-center shrink-0">
            <div className="text-2xl font-bold text-emerald-400">{data.places.length}</div>
            <div className="text-xs text-slate-400">ערים מאומתות במאגר</div>
          </div>
        </div>

        {/* Strict Criteria Pills */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3 flex items-start gap-2.5">
            <ShieldCheck size={18} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-slate-200">פשיעה ובטיחות: A ומעלה</div>
              <div className="text-[11px] text-slate-400">רק Niche Crime & Safety בדירוג A- / A (ללא B)</div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3 flex items-start gap-2.5">
            <GraduationCap size={18} className="text-blue-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-slate-200">בתי ספר ציבוריים: A / A+</div>
              <div className="text-[11px] text-slate-400">חינוך ציבורי חינמי ברמה הגבוהה ביותר</div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3 flex items-start gap-2.5">
            <Zap size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-slate-200">FEMA נמוך + חשמל יציב</div>
              <div className="text-[11px] text-slate-400">0 שריפות, 0 הוריקנים, 0 צונאמי, רשת PJM (לא טקסס)</div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3 flex items-start gap-2.5">
            <HeartPulse size={18} className="text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-slate-200">סוכרת סוג 1 + תקציב שפוי</div>
              <div className="text-[11px] text-slate-400">אנדוקרינולוגיית ילדים ≤15 דק׳ + פודים וסנסורים</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Income Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Filter size={14} className="text-blue-400" />
            <span>סינון ומיון המאגר</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="חיפוש עיר, בית חולים, מעסיק, רכב..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpDown size={15} className="text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="score">מיון: ציון שקט נפשי (גבוה ← נמוך)</option>
                <option value="fema_severity">מיון: חומרת FEMA משולבת (נמוך ← גבוה)</option>
                <option value="monthly">מיון: עלות חודשית (נמוך ← גבוה)</option>
                <option value="rent">מיון: שכירות 3 חדרי שינה (נמוך ← גבוה)</option>
                <option value="buy">מיון: מחיר קניית בית (נמוך ← גבוה)</option>
                <option value="hospital">מיון: קרבה למרכז סוכרת (דקות)</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'ALL', label: 'כל המדינות' },
              { id: 'OH', label: 'אוהיו (OH)' },
              { id: 'PA', label: 'פנסילבניה (PA)' },
              { id: 'MI', label: 'מישיגן (MI)' },
              { id: 'WI', label: 'ויסקונסין (WI)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStateFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  stateFilter === tab.id
                    ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
            <button
              onClick={() => setFemaFilter((prev) => (prev === 'ALL' ? 'LOW' : 'ALL'))}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                femaFilter === 'LOW'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              {femaFilter === 'LOW' ? '✓ FEMA Relatively Low בלבד' : 'סנן: FEMA Relatively Low בלבד'}
            </button>
          </div>
        </div>

        {/* Household Income vs Cost Simulator */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">סימולטור הכנסה חודשית (QA + בת זוג)</span>
            <span className="text-[11px] text-slate-500">לחישוב עודף חודשי משוער</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">שכר שנתי QA (ברוטו $)</label>
              <input
                type="number"
                step={5000}
                min={60000}
                max={250000}
                value={qaSalaryAnnual}
                onChange={(e) => setQaSalaryAnnual(Number(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">הכנסה חלקית בת זוג (נטו/חודש $)</label>
              <input
                type="number"
                step={100}
                min={0}
                max={5000}
                value={spouseMonthlyNet}
                onChange={(e) => setSpouseMonthlyNet(Number(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-slate-100"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            * משקף ~15–22 שעות שבועיות גמישות לבת הזוג ($1,200–$1,800/חודש) להשלמת שכירות, מזון ורכב.
          </p>
        </div>
      </div>

      {/* Desktop Comparison Table */}
      <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-4 py-2.5 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>לחץ על כל שורה לפתיחת התיק המלא במודאל</span>
          <span>מציג {filteredPlaces.length} מתוך {data.places.length} ערים</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-800/80 text-xs text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">עיר / פרבר</th>
                <th className="py-3 px-3 font-semibold">פשיעה</th>
                <th className="py-3 px-3 font-semibold">בתי ספר</th>
                <th className="py-3 px-3 font-semibold">שכירות 3BR</th>
                <th className="py-3 px-3 font-semibold">קנייה חציון</th>
                <th className="py-3 px-3 font-semibold">FEMA (חומרה משולבת)</th>
                <th className="py-3 px-3 font-semibold">מרכז סוכרת</th>
                <th className="py-3 px-3 font-semibold">יתרה חודשית משוערת</th>
                <th className="py-3 px-3 font-semibold">ציון שקט</th>
                <th className="py-3 px-3 font-semibold text-center">תיק מלא</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredPlaces.map((p) => {
                const surplus = getSurplus(p);
                const isSelected = modalSlug === p.slug;
                return (
                  <tr
                    key={p.slug}
                    onClick={() => setModalSlug(p.slug)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-600/15' : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-100">{p.name_he}</div>
                      <div className="text-xs text-slate-400">{p.metro_he}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold text-xs">
                        {p.niche_crime_grade}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 font-bold text-xs">
                        {p.niche_schools_grade}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-200 font-medium">
                      ${p.rent_3br_min.toLocaleString()}–${p.rent_3br_max.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-slate-200 font-medium">
                      ${p.home_buy_median.toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <div
                        className={`text-xs font-bold ${
                          p.fema_combined_severity <= 52
                            ? 'text-emerald-400'
                            : p.fema_combined_severity <= 62
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {p.fema_combined_severity}/100 ({p.fema_total_declarations} הכרזות)
                      </div>
                      <div className="text-[11px] text-slate-300">
                        פרבר: <span className="text-emerald-400 font-semibold">{p.fema_area_rating}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        מחוז: {p.fema_county_rating} ({p.fema_county_score})
                      </div>
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-300">{p.t1d_hospital_drive_min} דק׳</td>
                    <td className="py-3 px-3">
                      <span className={`font-bold text-xs ${surplus >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {surplus >= 0 ? '+' : ''}${surplus.toLocaleString()}/חודש
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-300">
                        <Sparkles size={13} />
                        {p.peace_of_mind_score}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-blue-300">
                        <Maximize2 size={12} />
                        <span>פתח</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Compact Cards (tap to open modal) */}
      <div className="md:hidden space-y-3">
        <div className="text-xs text-slate-400 px-1">
          לחץ על כל עיר לפתיחת התיק המלא ({filteredPlaces.length} ערים)
        </div>
        {filteredPlaces.map((p) => {
          const surplus = getSurplus(p);
          return (
            <button
              key={p.slug}
              type="button"
              onClick={() => setModalSlug(p.slug)}
              className="w-full text-right bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-4 space-y-3 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-base text-slate-100">{p.name_he}</div>
                  <div className="text-xs text-slate-400">{p.metro_he}</div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold shrink-0">
                  <Sparkles size={12} />
                  {p.peace_of_mind_score}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <GradeBadge label="פשיעה" grade={p.niche_crime_grade} accent="emerald" />
                <GradeBadge label="חינוך" grade={p.niche_schools_grade} accent="blue" />
                <span
                  className={`px-2 py-1 rounded-lg border text-xs font-semibold ${
                    p.fema_nri_rating === 'Relatively Low'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  }`}
                >
                  FEMA: {p.fema_nri_rating}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-800/40 rounded-xl p-2.5">
                <div>
                  <span className="text-slate-400">שכירות 3BR: </span>
                  <span className="font-bold text-slate-100">
                    ${p.rent_3br_min.toLocaleString()}–${p.rent_3br_max.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">קנייה: </span>
                  <span className="font-bold text-slate-100">${p.home_buy_median.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400">סוכרת: </span>
                  <span className="font-semibold text-slate-200">{p.t1d_hospital_drive_min} דק׳</span>
                </div>
                <div>
                  <span className="text-slate-400">יתרה: </span>
                  <span className={`font-bold ${surplus >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {surplus >= 0 ? '+' : ''}${surplus.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-blue-300 pt-0.5">
                <span>פתח תיק מלא (עבודה, רכב, חשמל וקהילה)</span>
                <ChevronLeft size={15} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Optional Collapsible Full List */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowAllCards((prev) => !prev)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
        >
          {showAllCards ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          <span>
            {showAllCards
              ? 'הסתר את רשימת כל התיקים המלאים'
              : `הצג את כל ${filteredPlaces.length} התיקים המלאים ברצף (לגלילה/הדפסה)`}
          </span>
        </button>

        {showAllCards && (
          <div className="space-y-4 mt-4">
            {filteredPlaces.map((p) => (
              <div key={p.slug} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6">
                <PlaceDossierContent place={p} surplus={getSurplus(p)} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dossier Modal */}
      {modalPlace && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4"
          onClick={() => setModalSlug(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Bar with Prev/Next & Close */}
            <div className="px-4 sm:px-6 py-3 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const prevIdx = (modalIndex - 1 + filteredPlaces.length) % filteredPlaces.length;
                    setModalSlug(filteredPlaces[prevIdx].slug);
                  }}
                  disabled={filteredPlaces.length <= 1}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight size={14} />
                  <span>הקודם</span>
                </button>
                <span className="text-xs text-slate-400 font-medium px-1">
                  {modalIndex + 1} / {filteredPlaces.length}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const nextIdx = (modalIndex + 1) % filteredPlaces.length;
                    setModalSlug(filteredPlaces[nextIdx].slug);
                  }}
                  disabled={filteredPlaces.length <= 1}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 disabled:opacity-40 cursor-pointer"
                >
                  <span>הבא</span>
                  <ChevronLeft size={14} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setModalSlug(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/40 text-xs font-semibold text-slate-200 cursor-pointer transition-colors"
                aria-label="סגור"
              >
                <span>סגור (Esc)</span>
                <X size={14} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 sm:p-6 overflow-y-auto">
              <PlaceDossierContent place={modalPlace} surplus={getSurplus(modalPlace)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
