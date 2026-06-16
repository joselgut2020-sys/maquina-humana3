import { useStore, CAT_COLORS, CAT_ICONS, MULTI_TRACKERS_CFG } from '../store'

function MultiCheckRow({ tracker }) {
  const store = useStore()
  const cfg = MULTI_TRACKERS_CFG[tracker.id] || { count: 2, labels: [] }
  const { done, total } = store.getMultiCount(tracker.id)
  const color = CAT_COLORS[tracker.category] || '#4A90D9'

  return (
    <div className="multi-week-row">
      <div className="multi-week-top">
        <div className={`circ-check${done === total ? ' done' : ''}`} style={{flexShrink:0}}>
          {done === total && <i className="ti ti-check" aria-hidden="true" />}
        </div>
        <i className={`ti ${tracker.icon || 'ti-circle'} habit-icon`} style={{color}} aria-hidden="true" />
        <span className="wtask-name">{tracker.name}</span>
        <span style={{fontSize:12,color: done===total?'var(--green)':'var(--text-secondary)',fontWeight:700,marginLeft:'auto'}}>{done}/{total}</span>
      </div>
      <div className="multi-week-dots">
        {Array.from({length: cfg.count}, (_, i) => {
          const isDone = store.isMultiDone(tracker.id, i)
          return (
            <div key={i} className={`mwd${isDone ? ' done' : ''}`} onClick={() => store.toggleMulti(tracker.id, i)}
              aria-label={`${tracker.name} sesión ${i+1}`}>
              {cfg.labels[i] || i+1}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function WeekView() {
  const store = useStore()
  const { range, weekNum, isCurrent } = store.getViewWeekLabel()
  const score = store.getWeekScore()
  const items = store.getWeeklyItems()
  const cats = store.getCategoryScores()

  const binary = items.filter(t => t.type === 'weekly')
  const multi = items.filter(t => t.type === 'multi')
  const counters = items.filter(t => t.type === 'counter')

  const totalDone = [
    ...binary.filter(t => store.isWeeklyDone(t.id)),
    ...multi.filter(t => { const {done,total} = store.getMultiCount(t.id); return done===total }),
    ...counters.filter(t => store.getCounter(t.id) >= t.goal),
  ].length

  return (
    <div className="page">
      {/* WEEK NAV */}
      <div className="week-nav">
        <button className="week-nav-btn" onClick={() => store.goWeek(-1)} aria-label="Semana anterior">
          <i className="ti ti-chevron-left" aria-hidden="true" />
        </button>
        <div className="week-nav-center">
          <div className="week-nav-title">Semana {weekNum}</div>
          <div className="week-nav-sub">{range}</div>
          {isCurrent && <div className="week-today-badge">Esta semana</div>}
        </div>
        <button className="week-nav-btn" onClick={() => store.goWeek(1)} aria-label="Semana siguiente">
          <i className="ti ti-chevron-right" aria-hidden="true" />
        </button>
      </div>

      {/* SCORE CARD */}
      <div className="week-score-card">
        <div className="wscore-item">
          <div className="wscore-val" style={{color:'var(--blue)'}}>{score}%</div>
          <div className="wscore-lbl">Cumplimiento</div>
        </div>
        <div className="wscore-item">
          <div className="wscore-val">{totalDone}/{items.length}</div>
          <div className="wscore-lbl">Completados</div>
        </div>
        <div className="wscore-item">
          <div className="wscore-val" style={{color: score>=80?'var(--green)':score>=60?'var(--amber)':'var(--coral)'}}>
            {score>=90?'Excelente':score>=75?'Bueno':score>=60?'Aceptable':'Mejorar'}
          </div>
          <div className="wscore-lbl">Estado</div>
        </div>
      </div>

      {/* CATEGORÍAS */}
      <div className="section-lbl">Por categoría</div>
      {cats.map(c => (
        <div key={c.name} className="cat-score-card">
          <div className="cat-score-header">
            <i className={`ti ${CAT_ICONS[c.name]||'ti-circle'}`} style={{fontSize:16,color:c.color}} aria-hidden="true" />
            <span className="cat-score-name">{c.name}</span>
            <span className="cat-score-pct" style={{color: c.pct>=80?'var(--green)':c.pct>=60?'var(--amber)':'var(--coral)'}}>{c.pct}%</span>
          </div>
          <div className="cat-score-track">
            <div className="cat-score-fill" style={{width:`${c.pct}%`, background: c.pct>=80?'var(--green)':c.pct>=60?'var(--amber)':'var(--coral)'}} />
          </div>
        </div>
      ))}

      {/* MULTI-CHECK */}
      {multi.length > 0 && (
        <>
          <div className="section-lbl">Sesiones por semana</div>
          <div className="cat-block">
            {multi.map(t => <MultiCheckRow key={t.id} tracker={t} />)}
          </div>
        </>
      )}

      {/* CONTADORES */}
      {counters.length > 0 && (
        <>
          <div className="section-lbl">Metas con contador</div>
          <div className="cat-block">
            {counters.map(t => {
              const val = store.getCounter(t.id)
              const isDone = val >= t.goal
              const color = CAT_COLORS[t.category] || '#4A90D9'
              return (
                <div key={t.id} className={`wtask-row${isDone ? ' done' : ''}`} style={{cursor:'default'}}>
                  <div className={`circ-check${isDone ? ' done' : ''}`}>
                    {isDone && <i className="ti ti-check" aria-hidden="true" />}
                  </div>
                  <i className={`ti ${t.icon||'ti-circle'} habit-icon`} style={{color: isDone?'var(--text-muted)':color}} aria-hidden="true" />
                  <span className="wtask-name">{t.name}</span>
                  <div className="counter-wrap" onClick={e => e.stopPropagation()}>
                    <button className="counter-btn" onClick={() => store.setCounter(t.id, val-1)}>−</button>
                    <div className={`counter-val${isDone?' done':''}`}>{val}/{t.goal}{t.unit?` ${t.unit}`:''}</div>
                    <button className="counter-btn" onClick={() => store.setCounter(t.id, val+1)}>+</button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* BINARIOS */}
      {binary.length > 0 && (
        <>
          <div className="section-lbl">Objetivos semanales</div>
          <div className="cat-block">
            {binary.map(t => {
              const isDone = store.isWeeklyDone(t.id)
              const color = CAT_COLORS[t.category] || '#4A90D9'
              return (
                <div key={t.id} className={`wtask-row${isDone ? ' done' : ''}`} onClick={() => store.toggleWeekly(t.id)}>
                  <div className={`circ-check${isDone ? ' done' : ''}`}>
                    {isDone && <i className="ti ti-check" aria-hidden="true" />}
                  </div>
                  <i className={`ti ${t.icon||'ti-circle'} habit-icon`} style={{color: isDone?'var(--text-muted)':color}} aria-hidden="true" />
                  <div style={{flex:1}}>
                    <div className="wtask-name">{t.name}</div>
                    <div className="wtask-cat">{t.category}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
      <div style={{height:8}} />
    </div>
  )
}
