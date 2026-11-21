const API_BASE = '/api';
const LS_KEY = 'relocation_checklist_overrides';

function getOverrides() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '{}');
  } catch {
    return {};
  }
}

function setOverride(id, isCompleted) {
  const map = getOverrides();
  map[String(id)] = isCompleted ? 1 : 0;
  localStorage.setItem(LS_KEY, JSON.stringify(map));
}

function applyChecklistOverrides(items) {
  const map = getOverrides();
  return items.map((item) =>
    Object.prototype.hasOwnProperty.call(map, String(item.id))
      ? { ...item, is_completed: map[String(item.id)] }
      : item
  );
}

async function fetchApiOrStatic(apiPath, staticFile) {
  try {
    const res = await fetch(`${API_BASE}${apiPath}`);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return { data: await res.json(), isStatic: false };
    }
  } catch {
    // Fallback to static JSON bundle
  }
  const staticRes = await fetch(`/data/${staticFile}`);
  if (!staticRes.ok) {
    throw new Error(`Failed to load /data/${staticFile}`);
  }
  return { data: await staticRes.json(), isStatic: true };
}

export const api = {
  getOverview: async () => {
    const { data, isStatic } = await fetchApiOrStatic('/overview', 'overview.json');
    if (isStatic) {
      const [diab, prac] = await Promise.all([
        fetch('/data/diabetes.json').then((r) => r.json()),
        fetch('/data/practical.json').then((r) => r.json()),
      ]);
      const all = applyChecklistOverrides([...diab.checklist, ...prac.checklists]);
      const statsMap = {};
      for (const item of all) {
        if (!statsMap[item.group_name]) {
          statsMap[item.group_name] = { group_name: item.group_name, total: 0, completed: 0 };
        }
        statsMap[item.group_name].total += 1;
        statsMap[item.group_name].completed += item.is_completed ? 1 : 0;
      }
      data.checklistStats = Object.values(statsMap);
    }
    return data;
  },

  getStories: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const { data, isStatic } = await fetchApiOrStatic(`/stories${qs ? `?${qs}` : ''}`, 'stories.json');
    if (isStatic) {
      let stories = data.stories || [];
      if (params.tag && params.tag !== 'all') {
        stories = stories.filter((s) => s.tags.split(',').includes(params.tag));
      }
      if (params.q && params.q.trim()) {
        const needle = params.q.trim().toLowerCase();
        stories = stories.filter(
          (s) =>
            s.title.toLowerCase().includes(needle) ||
            s.destination.toLowerCase().includes(needle) ||
            s.background.toLowerCase().includes(needle) ||
            s.challenges_and_reality.toLowerCase().includes(needle)
        );
      }
      return { ...data, stories };
    }
    return data;
  },

  getVisas: async () => (await fetchApiOrStatic('/visas', 'visas.json')).data,

  getLocations: async () => (await fetchApiOrStatic('/locations', 'locations.json')).data,

  getDiabetes: async () => {
    const { data, isStatic } = await fetchApiOrStatic('/diabetes', 'diabetes.json');
    if (isStatic) {
      data.checklist = applyChecklistOverrides(data.checklist);
    }
    return data;
  },

  getPractical: async () => {
    const { data, isStatic } = await fetchApiOrStatic('/practical', 'practical.json');
    if (isStatic) {
      data.checklists = applyChecklistOverrides(data.checklists);
    }
    return data;
  },

  toggleChecklist: async (id, is_completed) => {
    try {
      const res = await fetch(`${API_BASE}/checklists/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_completed }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return res.json();
      }
    } catch {
      // Static fallback below
    }
    setOverride(id, is_completed);
    return { item: { id, is_completed: is_completed ? 1 : 0 } };
  },
};
