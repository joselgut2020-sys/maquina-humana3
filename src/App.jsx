import { useState } from 'react'
import TodayView from './components/TodayView'
import WeekView from './components/WeekView'
import ProgressView from './components/ProgressView'
import ManageView from './components/ManageView'
import './index.css'

const TABS = [
  { id: 'today', label: 'Hoy', icon: 'ti-sun' },
  { id: 'week', label: 'Semana', icon: 'ti-calendar-week' },
  { id: 'progress', label: 'Progreso', icon: 'ti-chart-line' },
  { id: 'manage', label: 'Gestionar', icon: 'ti-settings' },
]

export default function App() {
  const [tab, setTab] = useState('today')
  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.19.0/dist/tabler-icons.min.css" />
      {tab === 'today' && <TodayView />}
      {tab === 'week' && <WeekView />}
      {tab === 'progress' && <ProgressView />}
      {tab === 'manage' && <ManageView />}
      <nav className="bottom-nav" role="navigation" aria-label="Navegación principal">
        {TABS.map(t => (
          <button key={t.id} className={`nav-btn${tab===t.id?' active':''}`}
            onClick={() => setTab(t.id)} aria-current={tab===t.id?'page':undefined}>
            <i className={`ti ${t.icon}`} aria-hidden="true" />
            {t.label}
          </button>
        ))}
      </nav>
    </>
  )
}
