import { useStore, CAT_COLORS, CAT_ICONS, getWeekNumber } from '../store'

function getColor(pct) {
  if (pct == null) return 'rgba(255,255,255,.07)'
  if (pct >= 90) return '#3DD68C'
  if (pct >= 75) return '#4A90D9'
  if (pct >= 60) return '#F5A623'
  return '#E8604A'
}

export default function ProgressView() {
  const store = useStore()
  const score = store.getWeekScore()
  const cats = store.getCategoryScores()
  const weekNum = getWeekNumber(new Date())

  const strongCat = cats[0]
  const weakCat = [...cats].reverse().find(c => c.pct < 100) || cats[cats.length - 1]

  // Build week history dynamically from actual logs
  const allKeys = [
    ...Object.keys(store.dailyLog),
    ...Object.keys(store.weeklyLog),
    ...Object.keys(store.multiLog),
    ...Object.keys(store.counterLog),
  ]
  const weekIds = [...new Set(allKeys.map(k => {
    const date = k.split(':')[0]
    if (date.length !== 10) return null
    const d = new Date(date + 'T12:00:00')
    d.setDate(d.getDate() - (d.getDay() || 7) + 1)
    return d.toISOString().split('T')[0]
  }).filter(Boolean))].sort()

  // Always include current week
  const currentWeekId = store.currentWeekId
  if (!weekIds.includes(currentWeekId)) weekIds.push(currentWeekId)

  const weekHistory = weekIds.map(wid => {
    const wn = getWeekNumber(new Date(wid + 'T12:00:00'))
    const score = store.getWeekScore(wid)
    const isCurrent = wid === currentWeekId
    const d = new Date(wid + 'T12:00:00')
    const end = new Date(d); end.setDate(d.getDate() + 6)
    const fmt = x => x.toLocaleDateString('es', { day:'numeric', month:'short' })
    return { wid, wn, score, isCurrent, range: `${fmt(d)}–${fmt(end)}` }
  })

  return (
    <div className="page">
      <div className="top-header">
        <div>
          <div style={{fontSize:22,fontWeight:800,color:'var(--text-primary)'}}>Progreso</div>
          <div style={{fontSize:13,color:'var(--text-secondary)'}}>Tu historial completo</div>
        </div>
        <div className="streak-pill" style={{background:'var(--blue-dim)',borderColor:'rgba(74,144,217,.25)',color:'var(--blue)'}}>
          <i className="ti ti-calendar-stats" aria-hidden="true" />
          <span>Sem. {weekNum}</span>
        </div>
      </div>

      <div style={{height:8}} />

      {/* STATS */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-val" style={{color:'var(--blue)'}}>{score}%</div>
          <div className="stat-lbl">Esta semana</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{weekHistory.length}</div>
          <div className="stat-lbl">Semanas registradas</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{color:'var(--green)',fontSize:15,lineHeight:1.2,paddingTop:2}}>
            {strongCat?.name || '—'}
          </div>
          <div className="stat-lbl">Más fuerte · {strongCat?.pct||0}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{color:'var(--amber)',fontSize:15,lineHeight:1.2,paddingTop:2}}>
            {weakCat?.name || '—'}
          </div>
          <div className="stat-lbl">A mejorar · {weakCat?.pct||0}%</div>
        </div>
      </div>

      {/* CATEGORIES THIS WEEK */}
      <div className="section-lbl">Por categoría — esta semana</div>
      {cats.map(c => (
        <div key={c.name} className="cat-score-card">
          <div className="cat-score-header">
            <i className={`ti ${CAT_ICONS[c.name]||'ti-circle'}`} style={{fontSize:16,color:c.color}} aria-hidden="true" />
            <span className="cat-score-name">{c.name}</span>
            <span className="cat-score-pct" style={{color: getColor(c.pct)}}>{c.pct}%</span>
          </div>
          <div className="cat-score-track">
            <div className="cat-score-fill" style={{width:`${c.pct}%`, background: getColor(c.pct)}} />
          </div>
        </div>
      ))}

      {/* WEEK HISTORY */}
      {weekHistory.length > 0 && (
        <>
          <div className="section-lbl">Historial semanal</div>
          {[...weekHistory].reverse().map(({ wn, score, isCurrent, range }) => (
            <div key={wn} className="long-row">
              <div className={`long-week${isCurrent?' current':''}`} style={{width:48}}>S{wn}</div>
              <div style={{flex:1}}>
                <div className="long-track">
                  <div className="long-fill" style={{width:`${score}%`, background: getColor(score)}} />
                </div>
                <div style={{fontSize:10,color:'var(--text-muted)',marginTop:3}}>{range}</div>
              </div>
              <div className="long-pct" style={{color: isCurrent?'var(--text-primary)':'var(--text-muted)'}}>{score}%</div>
            </div>
          ))}
        </>
      )}

      <div style={{padding:'20px 16px 8px'}}>
        <button onClick={() => store.exportData()} style={{
          width:'100%', padding:'14px', borderRadius:12,
          border:'1px solid var(--border-bright)', background:'var(--bg-card)',
          fontSize:14, color:'var(--blue)', fontWeight:700, cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center', gap:8
        }}>
          <i className="ti ti-download" aria-hidden="true" />
          Exportar datos (JSON)
        </button>
      </div>
      <div style={{height:8}} />
    </div>
  )
}
