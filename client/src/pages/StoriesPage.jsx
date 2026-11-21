import { useEffect, useState } from 'react';
import { BookOpen, ExternalLink, Search, Home, GraduationCap, AlertCircle, Sparkles, PlayCircle } from 'lucide-react';
import { api } from '../api/client';

const TAGS = ['all', 'אטלנטה', 'סן דייגו', 'יוסטון', 'הייטק', 'בני נוער', 'מיסוי'];

export default function StoriesPage() {
  const [stories, setStories] = useState([]);
  const [youtubeChannels, setYoutubeChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tag, setTag] = useState('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    api
      .getStories({ tag, q: query })
      .then((res) => {
        setStories(res.stories);
        setYoutubeChannels(res.youtubeChannels || []);
      })
      .finally(() => setLoading(false));
  }, [tag, query]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          עדויות מהשטח וסיפורים אישיים (2024–2026)
        </h1>
        <p className="text-sm text-slate-400">
          שיתופים אמיתיים של משפחות ישראליות שעברו לארה״ב בשלוש השנים האחרונות — כולל לינקים ישירים למקור.
        </p>
      </header>

      {/* Search & Tag Filters */}
      <section className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חיפוש לפי יעד, רקע או אתגר..."
            className="w-full pr-9 pl-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {TAGS.map((t) => (
            <button
              key={t}
              onClick={() => setTag(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                tag === t
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {t === 'all' ? 'כל העדויות' : t}
            </button>
          ))}
        </div>
      </section>

      {/* YouTube Channels Section */}
      {youtubeChannels.length > 0 && (
        <section className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <PlayCircle className="text-rose-500" size={22} />
              <span>ערוצי יוטיוב של משפחות וזוגות שעברו מישראל לארה״ב</span>
            </h2>
            <p className="text-xs text-slate-400">
              ערוצים פרקטיים המתעדים הוצאת רישיון נהיגה, שכירות וקניית בית, רכב, בדיקות שטח והתאקלמות משפחתית.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {youtubeChannels.map((ch) => (
              <div
                key={ch.id}
                className="p-5 rounded-xl bg-slate-800/50 border border-slate-700/80 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="font-extrabold text-base text-white">{ch.name_he}</h3>
                    {ch.is_user_recommended === 1 && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                        מומלץ • הדרכות מעשיות
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">
                    {ch.creators} • <span className="text-slate-300 font-mono">{ch.handle}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{ch.summary}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {ch.topics.split(',').map((topic) => (
                      <span
                        key={topic}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-700"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <a
                  href={ch.channel_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
                >
                  <PlayCircle size={15} />
                  <span>מעבר לערוץ ביוטיוב</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {loading ? (
        <div className="py-16 text-center text-slate-400">טוען סיפורים...</div>
      ) : stories.length === 0 ? (
        <div className="py-12 text-center bg-slate-900/80 rounded-2xl border border-slate-800 text-slate-400 text-sm">
          לא נמצאו עדויות התואמות לסינון הנוכחי.
        </div>
      ) : (
        <div className="space-y-6">
          {stories.map((story) => (
            <article
              key={story.id}
              className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden"
            >
              <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="font-bold text-blue-300 bg-blue-500/15 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                      {story.source_name}
                    </span>
                    <span>•</span>
                    <span>{story.timeframe}</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-200">{story.family_size}</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-white">{story.title}</h2>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  <a
                    href={story.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-lg shadow-blue-600/20"
                  >
                    <BookOpen size={14} />
                    <span>קישור ישיר למקור</span>
                    <ExternalLink size={12} />
                  </a>
                  {story.secondary_url && (
                    <a
                      href={story.secondary_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors"
                    >
                      <span>{story.secondary_label || 'מדריך נוסף'}</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-4 text-sm">
                <p className="text-slate-300 leading-relaxed">{story.background}</p>

                {story.israel_monthly_cost_ils && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
                    <strong className="text-amber-300">השוואה לישראל:</strong> המשפחה שילמה כ-
                    <strong className="text-white">₪{story.israel_monthly_cost_ils.toLocaleString()} בחודש</strong> בראש העין (11,000 ש״ח גנים ל-4 ילדים, 8,000 ש״ח משכנתא וחשבונות עם רכב אחד).
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/70 space-y-1.5">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Home size={15} className="text-blue-400" />
                      <span>דיור ורכב</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{story.housing_and_cars}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/70 space-y-1.5">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <GraduationCap size={15} className="text-indigo-400" />
                      <span>חינוך וקהילה יהודית</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{story.education_and_community}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/70 space-y-1.5">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <AlertCircle size={15} className="text-rose-400" />
                      <span>מציאות וקשיים</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{story.challenges_and_reality}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200 flex items-start gap-2">
                  <Sparkles size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-emerald-300">שורה תחתונה: </strong>
                    {story.key_takeaway}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
