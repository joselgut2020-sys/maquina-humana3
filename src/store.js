import { create } from 'zustand'

function getLocalDateString(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getWeekId(date) {
  const d = new Date(date)
  d.setHours(0,0,0,0)
  const day = d.getDay() || 7
  d.setDate(d.getDate() - day + 1)
  return getLocalDateString(d)
}

function getWeekNumber(date) {
  const d = new Date(date)
  const startOfYear = new Date(d.getFullYear(), 0, 1)
  return Math.ceil((((d - startOfYear) / 86400000) + startOfYear.getDay() + 1) / 7)
}

function getWeekDays(weekId) {
  const days = []
  const monday = new Date(weekId + 'T12:00:00')
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    days.push(getLocalDateString(d))
  }
  return days
}

const MULTI_TRACKERS = {
  'w1': { count: 4, labels: ['U1','L1','U2','L2'] },
  'w2': { count: 2, labels: ['KB1','KB2'] },
  'w3': { count: 2, labels: ['C1','C2'] },
  'w4': { count: 3, labels: ['M1','M2','M3'] },
  'w9': { count: 3, labels: ['C1','C2','C3'] },
  'w10': { count: 3, labels: ['1','2','3'] },
}

const DEFAULT_TRACKERS = [
  { id: 'd1', name: '15,000 pasos', category: 'Salud física', type: 'daily', active: true, icon: 'ti-shoe' },
  { id: 'd2', name: 'Dormir 8–9 horas', category: 'Salud física', type: 'daily', active: true, icon: 'ti-moon' },
  { id: 'd3', name: 'Calorías 2300–2500', category: 'Nutrición', type: 'daily', active: true, icon: 'ti-flame' },
  { id: 'd4', name: 'Hidratación óptima', category: 'Nutrición', type: 'daily', active: true, icon: 'ti-droplet' },
  { id: 'd5', name: 'Rosario', category: 'Espiritualidad', type: 'daily', active: true, icon: 'ti-rosette' },
  { id: 'd6', name: 'Examen de conciencia', category: 'Espiritualidad', type: 'daily', active: true, icon: 'ti-book' },
  { id: 'd7', name: 'Tareas importantes hechas', category: 'Disciplina', type: 'daily', active: true, icon: 'ti-target' },
  { id: 'd8', name: '30+ min sin celular', category: 'Control digital', type: 'daily', active: true, icon: 'ti-device-mobile-off' },
  { id: 'd9', name: 'Monitorear fatiga', category: 'Salud física', type: 'daily', active: true, icon: 'ti-activity' },
  { id: 'w1', name: 'Upper/Lower', category: 'Salud física', type: 'multi', active: true, icon: 'ti-barbell' },
  { id: 'w2', name: 'Kickboxing', category: 'Salud física', type: 'multi', active: true, icon: 'ti-boxing' },
  { id: 'w3', name: 'Carreras', category: 'Salud física', type: 'multi', active: true, icon: 'ti-run' },
  { id: 'w4', name: 'Movilidad', category: 'Salud física', type: 'multi', active: true, icon: 'ti-heart-rate-monitor' },
  { id: 'w5', name: 'Sobrecarga progresiva', category: 'Salud física', type: 'weekly', active: true, icon: 'ti-trending-up' },
  { id: 'w6', name: 'Revisión de misión personal', category: 'Desarrollo personal', type: 'weekly', active: true, icon: 'ti-star' },
  { id: 'w7', name: 'Tareas universitarias al día', category: 'Académico', type: 'weekly', active: true, icon: 'ti-school' },
  { id: 'w8', name: 'Proyecto personal 1h+', category: 'Académico', type: 'weekly', active: true, icon: 'ti-bulb' },
  { id: 'w11', name: 'Misa', category: 'Espiritualidad', type: 'weekly', active: true, icon: 'ti-building-church' },
  { id: 'w12', name: 'Revisar finanzas', category: 'Finanzas', type: 'weekly', active: true, icon: 'ti-coin' },
  { id: 'w13', name: 'Presupuesto actualizado', category: 'Finanzas', type: 'weekly', active: true, icon: 'ti-calculator' },
  { id: 'w14', name: 'Tiempo de pantalla ≤4h/día', category: 'Control digital', type: 'weekly', active: true, icon: 'ti-screen-share-off' },
  { id: 'w9', name: 'Cocinar comidas', category: 'Independencia', type: 'multi', active: true, icon: 'ti-chef-hat' },
  { id: 'w10', name: 'Conversaciones de calidad', category: 'Habilidades sociales', type: 'multi', active: true, icon: 'ti-messages' },
  { id: 'c1', name: 'Estudio profundo', category: 'Académico', type: 'counter', goal: 8, unit: 'h', active: true, icon: 'ti-brain' },
  { id: 'c2', name: 'Alemán', category: 'Idiomas', type: 'counter', goal: 3, unit: 'sesiones', active: true, icon: 'ti-language' },
  { id: 'c3', name: 'Inglés técnico', category: 'Idiomas', type: 'counter', goal: 1, unit: 'h', active: true, icon: 'ti-language' },
  { id: 'c4', name: 'Italiano', category: 'Idiomas', type: 'counter', goal: 1, unit: 'sesión', active: false, icon: 'ti-language' },
  { id: 'c5', name: 'Entrenamiento en seco', category: 'Precisión', type: 'counter', goal: 2, unit: 'sesiones', active: false, icon: 'ti-target' },
]

function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback }
}
function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)) } catch {} }

const TODAY = getLocalDateString()

export const useStore = create((set, get) => ({
  trackers: load('mh_trackers', DEFAULT_TRACKERS),
  dailyLog: load('mh_daily', {}),
  weeklyLog: load('mh_weekly', {}),
  multiLog: load('mh_multi', {}),
  counterLog: load('mh_counter', {}),

  today: TODAY,
  currentWeekId: getWeekId(TODAY),
  viewWeekId: getWeekId(TODAY),
  viewDate: TODAY,

  goDay(delta) {
    const { viewDate } = get()
    const d = new Date(viewDate + 'T12:00:00')
    d.setDate(d.getDate() + delta)
    set({ viewDate: getLocalDateString(d) })
  },
  getViewDateLabel() {
    const { viewDate, today } = get()
    const d = new Date(viewDate + 'T12:00:00')
    const dayNames = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
    const dayName = dayNames[d.getDay()]
    const dateStr = d.toLocaleDateString('es', { day:'numeric', month:'long' })
    const isToday = viewDate === today
    const yesterday = new Date(today + 'T12:00:00')
    yesterday.setDate(yesterday.getDate() - 1)
    const isYesterday = viewDate === getLocalDateString(yesterday)
    return { dayName, dateStr, isToday, isYesterday, isFuture: viewDate > today }
  },

  goWeek(delta) {
    const { viewWeekId } = get()
    const d = new Date(viewWeekId + 'T12:00:00')
    d.setDate(d.getDate() + delta * 7)
    set({ viewWeekId: getLocalDateString(d) })
  },
  isCurrentWeek() { return get().viewWeekId === get().currentWeekId },
  getViewWeekLabel() {
    const { viewWeekId, currentWeekId } = get()
    const days = getWeekDays(viewWeekId)
    const start = new Date(days[0] + 'T12:00:00')
    const end = new Date(days[6] + 'T12:00:00')
    const fmt = d => d.toLocaleDateString('es', { day:'numeric', month:'short' })
    const weekNum = getWeekNumber(new Date(viewWeekId + 'T12:00:00'))
    return { range: `${fmt(start)} – ${fmt(end)}`, weekNum, isCurrent: viewWeekId === currentWeekId }
  },

  toggleDaily(id, date) {
    const s = get(); const d = date || s.today
    const key = `${d}:${id}`
    const log = { ...s.dailyLog, [key]: !s.dailyLog[key] }
    save('mh_daily', log); set({ dailyLog: log })
  },
  isDailyDone(id, date) {
    const d = date || get().today
    return !!get().dailyLog[`${d}:${id}`]
  },

  toggleWeekly(id, weekId) {
    const s = get(); const w = weekId || s.viewWeekId
    const key = `${w}:${id}`
    const log = { ...s.weeklyLog, [key]: !s.weeklyLog[key] }
    save('mh_weekly', log); set({ weeklyLog: log })
  },
  isWeeklyDone(id, weekId) {
    const w = weekId || get().viewWeekId
    return !!get().weeklyLog[`${w}:${id}`]
  },

  toggleMulti(id, idx, weekId) {
    const s = get(); const w = weekId || s.viewWeekId
    const key = `${w}:${id}:${idx}`
    const log = { ...s.multiLog, [key]: !s.multiLog[key] }
    save('mh_multi', log); set({ multiLog: log })
  },
  isMultiDone(id, idx, weekId) {
    const w = weekId || get().viewWeekId
    return !!get().multiLog[`${w}:${id}:${idx}`]
  },
  getMultiCount(id, weekId) {
    const w = weekId || get().viewWeekId
    const cfg = MULTI_TRACKERS[id] || { count: 1 }
    let done = 0
    for (let i = 0; i < cfg.count; i++) {
      if (get().multiLog[`${w}:${id}:${i}`]) done++
    }
    return { done, total: cfg.count, labels: cfg.labels || [] }
  },

  setCounter(id, val, weekId) {
    const s = get(); const w = weekId || s.viewWeekId
    const key = `${w}:${id}`
    const log = { ...s.counterLog, [key]: Math.max(0, val) }
    save('mh_counter', log); set({ counterLog: log })
  },
  getCounter(id, weekId) {
    const w = weekId || get().viewWeekId
    return get().counterLog[`${w}:${id}`] || 0
  },

  toggleTrackerActive(id) {
    const trackers = get().trackers.map(t => t.id === id ? { ...t, active: !t.active } : t)
    save('mh_trackers', trackers); set({ trackers })
  },
  updateTracker(id, changes) {
    const trackers = get().trackers.map(t => t.id === id ? { ...t, ...changes } : t)
    save('mh_trackers', trackers); set({ trackers })
  },
  addTracker(tracker) {
    const trackers = [...get().trackers, { ...tracker, id: `u${Date.now()}` }]
    save('mh_trackers', trackers); set({ trackers })
  },
  deleteTracker(id) {
    const trackers = get().trackers.filter(t => t.id !== id)
    save('mh_trackers', trackers); set({ trackers })
  },

  getTodayItems() {
    return get().trackers.filter(t => t.active && t.type === 'daily')
  },
  getWeeklyItems() {
    return get().trackers.filter(t => t.active && (t.type === 'weekly' || t.type === 'multi' || t.type === 'counter'))
  },

  getDayScore(date) {
    const s = get()
    const items = s.trackers.filter(t => t.active && t.type === 'daily')
    if (!items.length) return 0
    const done = items.filter(t => s.isDailyDone(t.id, date)).length
    return Math.round((done / items.length) * 100)
  },
  getWeekScore(weekId) {
    const s = get(); const w = weekId || s.viewWeekId
    const items = s.getWeeklyItems()
    if (!items.length) return 0
    let score = 0
    items.forEach(t => {
      if (t.type === 'weekly') { if (s.isWeeklyDone(t.id, w)) score++ }
      else if (t.type === 'multi') {
        const { done, total } = s.getMultiCount(t.id, w)
        score += done / total
      } else if (t.type === 'counter') {
        const val = s.getCounter(t.id, w)
        score += Math.min(val / t.goal, 1)
      }
    })
    return Math.round((score / items.length) * 100)
  },
  getCategoryScores(weekId) {
    const s = get(); const w = weekId || s.viewWeekId
    const cats = {}
    s.trackers.filter(t => t.active).forEach(t => {
      if (!cats[t.category]) cats[t.category] = { total: 0, done: 0, color: CAT_COLORS[t.category] || '#8B95A8' }
      cats[t.category].total++
      if (t.type === 'daily') {
        const days = getWeekDays(w)
        const doneDays = days.filter(d => s.isDailyDone(t.id, d)).length
        cats[t.category].done += doneDays / 7
      } else if (t.type === 'weekly' && s.isWeeklyDone(t.id, w)) {
        cats[t.category].done++
      } else if (t.type === 'multi') {
        const { done, total } = s.getMultiCount(t.id, w)
        cats[t.category].done += done / total
      } else if (t.type === 'counter') {
        const val = s.getCounter(t.id, w)
        cats[t.category].done += Math.min(val / t.goal, 1)
      }
    })
    return Object.entries(cats).map(([name, v]) => ({
      name, color: v.color,
      pct: v.total ? Math.round((v.done / v.total) * 100) : 0
    })).sort((a, b) => b.pct - a.pct)
  },

  exportData() {
    const s = get()
    const blob = new Blob([JSON.stringify({
      trackers: s.trackers, dailyLog: s.dailyLog, weeklyLog: s.weeklyLog,
      multiLog: s.multiLog, counterLog: s.counterLog,
      exportedAt: new Date().toISOString()
    }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `mh-backup-${getLocalDateString()}.json`; a.click()
  }
}))

export const MULTI_TRACKERS_CFG = MULTI_TRACKERS

export const CAT_COLORS = {
  'Salud física': '#4A90D9',
  'Nutrición': '#3DD68C',
  'Espiritualidad': '#F5A623',
  'Disciplina': '#A78BFA',
  'Control digital': '#8B95A8',
  'Académico': '#4A90D9',
  'Idiomas': '#3DD68C',
  'Independencia': '#F5A623',
  'Finanzas': '#3DD68C',
  'Habilidades sociales': '#E8604A',
  'Precisión': '#8B95A8',
  'Desarrollo personal': '#A78BFA',
}

export const CAT_ICONS = {
  'Salud física': 'ti-heart-rate-monitor',
  'Nutrición': 'ti-leaf',
  'Espiritualidad': 'ti-cross',
  'Disciplina': 'ti-brain',
  'Control digital': 'ti-device-mobile-off',
  'Académico': 'ti-school',
  'Idiomas': 'ti-language',
  'Independencia': 'ti-home',
  'Finanzas': 'ti-coin',
  'Habilidades sociales': 'ti-users',
  'Precisión': 'ti-target',
  'Desarrollo personal': 'ti-star',
}

export { getWeekDays, getWeekNumber }