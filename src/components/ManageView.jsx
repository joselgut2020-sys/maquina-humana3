import { useState } from 'react'
import { useStore, CAT_COLORS, CAT_ICONS } from '../store'

const CATEGORIES = ['Salud física','Nutrición','Espiritualidad','Disciplina','Control digital','Académico','Idiomas','Independencia','Finanzas','Habilidades sociales','Desarrollo personal','Precisión']
const TYPES = [
  { id: 'daily', label: 'Diario' },
  { id: 'weekly', label: 'Semanal' },
  { id: 'counter', label: 'Con meta' },
]

function TrackerModal({ tracker, onClose }) {
  const store = useStore()
  const isEdit = !!tracker?.id
  const [name, setName] = useState(tracker?.name || '')
  const [type, setType] = useState(tracker?.type === 'multi' ? 'weekly' : (tracker?.type || 'weekly'))
  const [cat, setCat] = useState(tracker?.category || 'Salud física')
  const [goal, setGoal] = useState(tracker?.goal || 3)
  const [unit, setUnit] = useState(tracker?.unit || 'sesiones')

  const handleSave = () => {
    if (!name.trim()) return
    const data = { name: name.trim(), type, category: cat, goal: +goal, unit, active: true, icon: tracker?.icon || 'ti-circle' }
    if (isEdit) store.updateTracker(tracker.id, data)
    else store.addTracker(data)
    onClose()
  }

  const handleDelete = () => {
    if (confirm('¿Eliminar este tracker?')) { store.deleteTracker(tracker.id); onClose() }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{isEdit ? 'Editar tracker' : 'Nuevo tracker'}</h2>
        <div className="field">
          <label>Nombre</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="ej. Meditación 10 min" autoFocus />
        </div>
        <div className="field">
          <label>Tipo</label>
          <div className="pills">
            {TYPES.map(t => (
              <button key={t.id} className={`pill${type===t.id?' sel':''}`} onClick={() => setType(t.id)}>{t.label}</button>
            ))}
          </div>
        </div>
        {type === 'counter' && (
          <div className="field" style={{display:'flex',gap:12}}>
            <div style={{flex:1}}>
              <label>Meta</label>
              <input type="number" value={goal} onChange={e => setGoal(e.target.value)} min={1} />
            </div>
            <div style={{flex:2}}>
              <label>Unidad</label>
              <input value={unit} onChange={e => setUnit(e.target.value)} placeholder="sesiones, horas..." />
            </div>
          </div>
        )}
        <div className="field">
          <label>Categoría</label>
          <div className="pills">
            {CATEGORIES.map(c => (
              <button key={c} className={`pill${cat===c?' sel':''}`} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
        </div>
        <div className="modal-actions">
          {isEdit && <button className="danger" onClick={handleDelete}>Eliminar</button>}
          <button onClick={onClose}>Cancelar</button>
          <button className="primary" onClick={handleSave}>Guardar</button>
        </div>
      </div>
    </div>
  )
}

export default function ManageView() {
  const store = useStore()
  const [modal, setModal] = useState(null) // null | 'new' | tracker object
  const [filter, setFilter] = useState('all')

  const trackers = store.trackers.filter(t =>
    filter === 'all' ? true : filter === 'active' ? t.active : !t.active
  )

  const byCategory = {}
  trackers.forEach(t => {
    if (!byCategory[t.category]) byCategory[t.category] = []
    byCategory[t.category].push(t)
  })

  const activeCount = store.trackers.filter(t => t.active).length

  return (
    <div className="page">
      <div className="top-header">
        <div>
          <div style={{fontSize:22,fontWeight:800,color:'var(--text-primary)'}}>Gestionar</div>
          <div style={{fontSize:13,color:'var(--text-secondary)'}}>{activeCount} trackers activos</div>
        </div>
      </div>

      <div style={{padding:'4px 16px 12px',display:'flex',gap:8}}>
        {[['all','Todos'],['active','Activos'],['inactive','Inactivos']].map(([f,l]) => (
          <button key={f} className={`pill${filter===f?' sel':''}`} onClick={() => setFilter(f)}>{l}</button>
        ))}
      </div>

      {Object.entries(byCategory).map(([cat, trackers]) => (
        <div key={cat}>
          <div className="section-lbl" style={{color:CAT_COLORS[cat]||'var(--text-muted)'}}>
            <i className={`ti ${CAT_ICONS[cat]||'ti-circle'}`} style={{marginRight:6,verticalAlign:-2}} aria-hidden="true" />
            {cat}
          </div>
          <div className="cat-block">
            {trackers.map(t => (
              <div key={t.id} className={`tracker-manage-row${t.active?'':' inactive'}`}>
                <i className={`ti ${t.icon||CAT_ICONS[t.category]||'ti-circle'}`}
                  style={{fontSize:18,color:CAT_COLORS[t.category]||'#8B95A8',width:22,textAlign:'center',flexShrink:0}} aria-hidden="true" />
                <div className="t-info">
                  <div className="t-name-cfg">{t.name}</div>
                  <div className="t-meta">
                    {t.type==='daily'?'Diario':t.type==='multi'?'Multi-sesión':t.type==='counter'?`Meta: ${t.goal} ${t.unit}`:'Semanal'}
                  </div>
                </div>
                <button className="edit-btn" onClick={() => setModal(t)} aria-label={`Editar ${t.name}`}>
                  <i className="ti ti-pencil" aria-hidden="true" />
                </button>
                <button className={`toggle ${t.active?'on':'off'}`}
                  onClick={() => store.toggleTrackerActive(t.id)}
                  aria-label={t.active?'Desactivar':'Activar'} />
              </div>
            ))}
          </div>
        </div>
      ))}

      <button className="add-btn" onClick={() => setModal('new')}>
        <i className="ti ti-plus" aria-hidden="true" />
        Agregar tracker
      </button>

      {modal && (
        <TrackerModal
          tracker={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
        />
      )}
      <div style={{height:8}} />
    </div>
  )
}
