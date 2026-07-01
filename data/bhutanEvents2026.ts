export interface FestivalEvent {
  id: string;
  title: string;
  location: string;
  type: 'holiday' | 'festival';
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
  color: string; // hex
}

// Color palette by region/type:
// Public Holidays : #16A34A  (green)
// Punakha         : #3B82F6  (blue)
// Paro            : #D97706  (amber)
// Thimphu         : #7C3AED  (violet)
// Bumthang        : #0D9488  (teal)
// East Bhutan     : #EA580C  (orange)
// Phobjikha       : #0EA5E9  (sky)
// Other           : #E11D48  (rose)

export const allEvents2026: FestivalEvent[] = [

  // ── FESTIVALS ─────────────────────────────────────────────────────────────

  { id: 'punakha-drubchen',    title: 'Punakha Drubchen',           location: 'Punakha Dzong',                    type: 'festival', start: '2026-02-22', end: '2026-02-24', color: '#3B82F6' },
  { id: 'punakha-tshechu',     title: 'Punakha Tshechu',            location: 'Punakha Dzong',                    type: 'festival', start: '2026-02-26', end: '2026-02-28', color: '#3B82F6' },
  { id: 'chhorten-kora-1',     title: 'Chhorten Kora Festival',     location: 'Trashiyangtse',                    type: 'festival', start: '2026-03-03', end: '2026-03-03', color: '#E11D48' },
  { id: 'chhorten-kora-2',     title: 'Chhorten Kora Festival',     location: 'Trashiyangtse',                    type: 'festival', start: '2026-03-19', end: '2026-03-19', color: '#E11D48' },
  { id: 'paro-tshechu',        title: 'Paro Tshechu',               location: 'Rinpung Dzong, Paro',              type: 'festival', start: '2026-03-29', end: '2026-04-02', color: '#D97706' },
  { id: 'rhododendron',        title: 'Rhododendron Festival',      location: 'Lamperi Botanical Park, Thimphu',  type: 'festival', start: '2026-04-13', end: '2026-04-13', color: '#E11D48' },
  { id: 'ura-yakchoe',         title: 'Ura Yakchoe',                location: 'Ura Lhakhang, Bumthang',           type: 'festival', start: '2026-04-28', end: '2026-05-02', color: '#0D9488' },
  { id: 'nimalung-tshechu',    title: 'Nimalung Tshechu',           location: 'Nimalung Dratshang, Bumthang',     type: 'festival', start: '2026-06-22', end: '2026-06-24', color: '#0D9488' },
  { id: 'kurjey-tshechu',      title: 'Kurjey Tshechu',             location: 'Kurjey Lhakhang, Bumthang',        type: 'festival', start: '2026-06-24', end: '2026-06-24', color: '#10B981' },
  { id: 'thimphu-drubchen',    title: 'Thimphu Drubchen',           location: 'Tashichho Dzong, Thimphu',         type: 'festival', start: '2026-09-17', end: '2026-09-17', color: '#7C3AED' },
  { id: 'wangdue-tshechu',     title: 'Wangdue Tshechu',            location: 'Wangduephodrang',                  type: 'festival', start: '2026-09-19', end: '2026-09-21', color: '#6366F1' },
  { id: 'thimphu-tshechu',     title: 'Thimphu Tshechu',            location: 'Tashichho Dzong, Thimphu',         type: 'festival', start: '2026-09-21', end: '2026-09-23', color: '#7C3AED' },
  { id: 'gangtey-tshechu',     title: 'Gangtey Tshechu',            location: 'Gangtey Gonpa, Phobjikha',         type: 'festival', start: '2026-09-24', end: '2026-09-26', color: '#0EA5E9' },
  { id: 'jambay-lhakhang',     title: 'Jambay Lhakhang Drup',       location: 'Jambay Lhakhang, Bumthang',        type: 'festival', start: '2026-10-26', end: '2026-10-29', color: '#0D9488' },
  { id: 'black-necked-crane',  title: 'Black-Necked Crane Festival',location: 'Phobjikha Valley',                 type: 'festival', start: '2026-11-11', end: '2026-11-11', color: '#0EA5E9' },
  { id: 'trashigang-tshechu',  title: 'Trashigang Tshechu',         location: 'Trashigang Dzong',                 type: 'festival', start: '2026-11-18', end: '2026-11-20', color: '#EA580C' },
  { id: 'trongsa-tshechu',     title: 'Trongsa Tshechu',            location: 'Trongsa Dzong',                    type: 'festival', start: '2026-12-17', end: '2026-12-21', color: '#EA580C' },

  // ── PUBLIC HOLIDAYS ───────────────────────────────────────────────────────

  { id: 'nyilo',               title: 'Winter Solstice (Nyilo)',            location: '', type: 'holiday', start: '2026-01-02', end: '2026-01-02', color: '#16A34A' },
  { id: 'offerings-day',       title: 'Traditional Day of Offerings',       location: '', type: 'holiday', start: '2026-01-19', end: '2026-01-19', color: '#16A34A' },
  { id: 'losar',               title: 'Losar (Bhutanese New Year)',          location: '', type: 'holiday', start: '2026-02-18', end: '2026-02-19', color: '#16A34A' },
  { id: 'king-birthday',       title: "HM The King's Birthday",              location: '', type: 'holiday', start: '2026-02-21', end: '2026-02-21', color: '#16A34A' },
  { id: 'zhabdrung',           title: 'Zhabdrung Kuchoe',                   location: '', type: 'holiday', start: '2026-04-26', end: '2026-04-26', color: '#16A34A' },
  { id: '3rd-king',            title: 'Birth Anniversary of 3rd King',       location: '', type: 'holiday', start: '2026-05-02', end: '2026-05-02', color: '#16A34A' },
  { id: 'saga-dawa',           title: 'Saga Dawa — Buddha Parinirvana',      location: '', type: 'holiday', start: '2026-05-31', end: '2026-05-31', color: '#16A34A' },
  { id: 'guru-rinpoche',       title: 'Guru Rinpoche Birthday',              location: '', type: 'holiday', start: '2026-06-24', end: '2026-06-24', color: '#16A34A' },
  { id: 'first-sermon',        title: 'First Sermon of Lord Buddha',         location: '', type: 'holiday', start: '2026-07-18', end: '2026-07-18', color: '#16A34A' },
  { id: 'blessed-rainy',       title: 'Blessed Rainy Day',                   location: '', type: 'holiday', start: '2026-09-23', end: '2026-09-23', color: '#16A34A' },
  { id: 'dashain',             title: 'Dashain',                             location: '', type: 'holiday', start: '2026-10-21', end: '2026-10-21', color: '#16A34A' },
  { id: 'coronation',          title: 'Coronation Day / Descending of Buddha', location: '', type: 'holiday', start: '2026-11-01', end: '2026-11-01', color: '#16A34A' },
  { id: '4th-king',            title: "4th King's Birthday / GNH Day",       location: '', type: 'holiday', start: '2026-11-11', end: '2026-11-11', color: '#16A34A' },
  { id: 'national-day',        title: 'National Day of Bhutan',              location: '', type: 'holiday', start: '2026-12-17', end: '2026-12-17', color: '#16A34A' },
];
