import { useState } from 'react'
import { useStore, CAT_COLORS, CAT_ICONS } from '../store'

const QUOTES = [
  'La disciplina de hoy construye la libertad de mañana.',
  'Sé la persona que quieres ser, un día a la vez.',
  'Consistencia sobre perfección.',
  'Cada hábito es un voto por tu identidad.',
  'El dolor de la disciplina es menor que el del arrepentimiento.',
  'Un día a la vez, una decisión a la vez.',
  'La excelencia no es un acto, es un hábito.',
]

export default function TodayView() {
  const store = useStore()
  const items = store.getTodayItems()
  const { dayName, dateStr, isToday, isYesterday, isFuture } = store.getViewDateLabel()
  const viewDate = store.viewDate

  const done = items.filter(t => store.isDailyDone(t.id, viewDate)).length
  const pct = items.length ? Math.round((done / items.length) * 100) : 0

  const quote = QUOTES[new Date(viewDate + 'T12:00:00').getDay() % QUOTES.length]

  const byCategory = {}
  items.forEach(t => {
    if (!byCategory[t.category]) byCategory[t.category] = []
    byCategory[t.category].push(t)
  })

  const [collapsed, setCollapsed] = useState({})
  const toggleCat = cat => setCollapsed(p => ({ ...p, [cat]: !p[cat] }))

  const C = 2 * Math.PI * 38
  const dash = C - (pct / 100) * C

  const dayLabel = isFuture ? dayName : isToday ? 'HOY' : isYesterday ? 'AYER' : dayName.toUpperCase()

  return (
    <div className="page">
      {/* HEADER */}
      <div className="top-header">
        <div className="app-brand">
          <div className="brand-icon"><i className="ti ti-bolt" aria-hidden="true" /></div>
          <div className="brand-text">
            <div className="brand-sup">Proyecto</div>
            <div className="brand-name">MÁQUINA HUMANA</div>
          </div>
        </div>
        <div className="header-actions">
          <div className="streak-pill">
            <i className="ti ti-flame" aria-hidden="true" />
            <span>Daily Tracker</span>
          </div>
        </div>
      </div>

      {/* HERO CARD */}
      <div className="hero-card">
        <div className="hero-left" style={{flex:1}}>
          {/* DAY NAVIGATION */}
          <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:6}}>
            <button className="week-nav-btn" onClick={() => store.goDay(-1)} aria-label="Día anterior"
              style={{width:28,height:28,fontSize:15}}>
              <i className="ti ti-chevron-left" aria-hidden="true" />
            </button>
            <div>
              <div className="hero-day" style={{fontSize:26}}>{dayLabel}</div>
              <div className="hero-date">{dateStr}</div>
            </div>
            <button className="week-nav-btn" onClick={() => store.goDay(1)}
              disabled={isToday} aria-label="Día siguiente"
              style={{width:28,height:28,fontSize:15,opacity: isToday ? 0.3 : 1}}>
              <i className="ti ti-chevron-right" aria-hidden="true" />
            </button>
          </div>
          {!isFuture && <div className="hero-quote">{quote}</div>}
          {isFuture && <div className="hero-quote" style={{color:'var(--amber)'}}>Aún no llegás a este día</div>}
        </div>
        <div className="ring-wrap">
          <svg viewBox="0 0 90 90" aria-hidden="true">
            <circle className="ring-bg" cx="45" cy="45" r="38" />
            <circle className="ring-fill" cx="45" cy="45" r="38"
              strokeDasharray={C} strokeDashoffset={dash}
              style={{stroke: isFuture ? 'var(--text-muted)' : pct===100 ? 'var(--green)' : 'var(--blue)'}}
            />
          </svg>
          <div className="ring-label">
            <div className="ring-pct">{pct}%</div>
            <div className="ring-sub">PROGRESO</div>
          </div>
        </div>
      </div>

      {/* PROGRESS STRIP */}
      <div className="progress-strip">
        <div className="progress-strip-label" style={{color:'var(--text-secondary)'}}>
          {done} de {items.length} hábitos completados
        </div>
        <div className="progress-strip-track" style={{flex:'0 0 80px'}}>
          <div className="progress-strip-fill" style={{width:`${pct}%`}} />
        </div>
      </div>

      {/* CATEGORIES */}
      {Object.entries(byCategory).map(([cat, trackers]) => {
        const color = CAT_COLORS[cat] || '#8B95A8'
        const icon = CAT_ICONS[cat] || 'ti-circle'
        const isCollapsed = collapsed[cat]
        const catDone = trackers.filter(t => store.isDailyDone(t.id, viewDate)).length

        return (
          <div key={cat} className="cat-block">
            <div className="cat-header-row" onClick={() => toggleCat(cat)}>
              <i className={`ti ${icon} cat-icon`} style={{color}} aria-hidden="true" />
              <span className="cat-title" style={{color}}>{cat.toUpperCase()}</span>
              {isCollapsed && <span style={{fontSize:12,color:'var(--text-muted)'}}>{catDone}/{trackers.length}</span>}
              <i className={`ti ti-chevron-down cat-chevron${isCollapsed ? '' : ' open'}`} aria-hidden="true" />
            </div>
            {!isCollapsed && trackers.map(t => {
              const isDone = store.isDailyDone(t.id, viewDate)
              return (
                <div key={t.id} className={`habit-row${isDone ? ' done' : ''}`}
                  onClick={() => !isFuture && store.toggleDaily(t.id, viewDate)}>
                  <div className={`circ-check${isDone ? ' done' : ''}`}>
                    {isDone && <i className="ti ti-check" aria-hidden="true" />}
                  </div>
                  <i className={`ti ${t.icon || 'ti-circle'} habit-icon`}
                    style={{color: isDone ? 'var(--text-muted)' : color}} aria-hidden="true" />
                  <span className="habit-name">{t.name}</span>
                </div>
              )
            })}
          </div>
        )
      })}

      {items.length === 0 && (
        <div className="empty">
          <i className="ti ti-calendar" style={{fontSize:40,display:'block',marginBottom:12}} aria-hidden="true" />
          No hay hábitos activos
        </div>
      )}
    </div>
  )
}
