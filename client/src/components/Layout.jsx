import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FileCheck2,
  MapPin,
  HeartPulse,
  Compass,
  Menu,
  X,
  Database,
  Sun,
  Moon,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'תמונת מצב משולבת', sub: 'פרופיל משפחתי ויעדים', icon: LayoutDashboard },
  { to: '/locations', label: 'השוואת ערים ופרברים', sub: 'עלויות, FEMA, אנטישמיות', icon: MapPin },
  { to: '/visas', label: 'ויזות, גרין קארד ומשפחה', sub: 'L-1, DV, פיטורים ואיחוד', icon: FileCheck2 },
  { to: '/diabetes', label: 'סוכרת סוג 1 וביטוחים', sub: 'Omnipod, Libre, קצבאות', icon: HeartPulse },
  { to: '/stories', label: 'עדויות מהשטח וערוצי יוטיוב', sub: 'סיפורים, וולוגים ולינקים', icon: BookOpen },
  { to: '/practical', label: 'מדריך נחיתה ותקציב', sub: '500K ₪, קרדיט ומסמכים', icon: Compass },
];

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('il-to-us-theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('il-to-us-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950 text-slate-100">
      {/* Mobile Header */}
      <header className="lg:hidden bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div>
          <div className="font-bold text-sm leading-tight text-slate-100">רילוקיישן ישראל–ארה״ב</div>
          <div className="text-[11px] text-slate-400">מאגר נתונים והשוואות · IMOH</div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="החלף ערכת נושא"
            title={theme === 'dark' ? 'מצב בהיר' : 'מצב כהה'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="תפריט"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 z-40 w-72 bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 text-slate-100 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 shrink-0 ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-slate-800 hidden lg:flex items-center justify-between gap-2">
          <div>
            <h1 className="font-bold text-base leading-snug text-slate-100">רילוקיישן ישראל–ארה״ב</h1>
            <p className="text-xs text-slate-400">מערכת השוואה ותכנון (2023–2026)</p>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 hover:border-blue-500 transition-colors cursor-pointer shrink-0"
            aria-label="החלף ערכת נושא"
            title={theme === 'dark' ? 'מצב בהיר' : 'מצב כהה'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all border ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-300 border-blue-500/40 shadow-sm shadow-blue-500/10'
                      : 'text-slate-400 border-transparent hover:bg-slate-800/70 hover:text-slate-100'
                  }`
                }
              >
                <Icon size={19} className="shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold leading-tight truncate">{item.label}</div>
                  <div className="text-[11px] opacity-75 truncate">{item.sub}</div>
                </div>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 text-xs text-slate-400 space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <Database size={14} />
            <span>מחובר ל-SQLite (relocation.db)</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500">
            כל הנתונים מבוססים על עדויות 2023–2026 ומאגרים רשמיים (USCIS, FEMA, ADL, Zillow, Insulet).
          </p>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
