import { useCallback, useEffect, useRef, useState } from 'react'
import AutomationsView from './AutomationsView'
import DetentionView from './DetentionView'
import Icon from './Icon'
import LoadsView from './LoadsView'
import Sheet from './Sheet'
import TodayView from './TodayView'
import {
  H, automations, buildEmail, calc, clock, hm, initialAutos, needs as allNeeds, usd,
  type AutoKey, type Need,
} from '../lib/detention'

type Tab = 'v-today' | 'v-loads' | 'v-auto'
type SheetName = 'mail' | 'depart' | null

const tabs: { id: Tab; label: string; icon: 'today' | 'loads' | 'switch' }[] = [
  { id: 'v-today', label: 'Today', icon: 'today' },
  { id: 'v-loads', label: 'Loads', icon: 'loads' },
  { id: 'v-auto', label: 'Automations', icon: 'switch' },
]

export default function DetentionApp() {
  // Demo load: the driver checked in a little over 4 hours ago and is still waiting.
  const [arrivedAt] = useState(() => Date.now() - (4 * H + 5000))
  const [now, setNow] = useState(() => Date.now())
  const [departedAt, setDepartedAt] = useState<number | null>(null)
  const [sentAt, setSentAt] = useState<number | null>(null)
  const [autos, setAutos] = useState(initialAutos)
  const [tab, setTab] = useState<Tab>('v-today')
  const [pushed, setPushed] = useState(false)
  const [backLabel, setBackLabel] = useState('Today')
  const [sheet, setSheet] = useState<SheetName>(null)
  const [mailBody, setMailBody] = useState('')
  const [needs, setNeeds] = useState(allNeeds)
  const [gone, setGone] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState({ msg: '', show: false })
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const lastFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('dr-tab') as Tab | null
      if (saved && tabs.some(t => t.id === saved)) setTab(saved)
    } catch {}
  }, [])

  const det = calc(arrivedAt, departedAt, now)
  const stopped = departedAt !== null
  const waiting = needs.length - gone.size

  const say = useCallback((msg: string) => {
    setToast({ msg, show: true })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 2200)
  }, [])

  const showTab = (id: Tab) => {
    if (id === tab) {
      document.getElementById(id)?.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setTab(id)
    try { localStorage.setItem('dr-tab', id) } catch {}
  }

  const openDetention = (from: string) => { setBackLabel(from); setPushed(true) }
  const closeDetention = () => setPushed(false)

  const openSheet = (name: Exclude<SheetName, null>) => {
    lastFocus.current = document.activeElement as HTMLElement | null
    setSheet(name)
  }
  const closeSheet = useCallback(() => {
    setSheet(null)
    lastFocus.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (sheet) closeSheet()
      else if (pushed) setPushed(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [sheet, pushed, closeSheet])

  const resolveNeed = (need: Need, msg?: string) => {
    if (gone.has(need.id)) return
    setGone(g => new Set(g).add(need.id))
    if (msg) say(msg)
    setTimeout(() => {
      setNeeds(ns => ns.filter(n => n.id !== need.id))
      setGone(g => { const next = new Set(g); next.delete(need.id); return next })
    }, 480)
  }

  const toggleAuto = (key: AutoKey) => {
    const on = !autos[key]
    setAutos(a => ({ ...a, [key]: on }))
    const name = automations.find(a => a.key === key)!.title
    say(on ? `${name} on · acts from now` : `${name} off`)
  }

  const departOrUndo = () => {
    if (stopped) {
      setDepartedAt(null)
      say('Clock running again')
    } else openSheet('depart')
  }
  const confirmDepart = () => {
    const t = Date.now()
    setDepartedAt(t)
    setNow(t)
    closeSheet()
    say(`Truck left. ${usd(calc(arrivedAt, t, t).amount)} to bill.`)
  }

  const writeEmail = () => {
    setMailBody(buildEmail(arrivedAt, departedAt, Date.now()))
    openSheet('mail')
  }
  const copyEmail = () => {
    const fallback = () => {
      const ta = document.getElementById('mailBody') as HTMLTextAreaElement | null
      ta?.focus(); ta?.select()
      say('Selected. Press copy on your keyboard.')
    }
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(mailBody).then(() => say('Email copied'), fallback)
    else fallback()
  }
  const markSent = () => {
    setSentAt(Date.now())
    closeSheet()
    say('Marked as sent to Pinecrest')
  }

  return (
    <div className={`device${pushed ? ' pushed' : ''}`}>
      <div className="statusbar" aria-hidden="true">
        <span className="num">{clock(now).replace(/ [AP]M/, '')}</span>
        <span className="island" />
        <span className="sys">
          <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
          <svg width="26" height="12" viewBox="0 0 26 12"><rect x=".5" y=".5" width="22" height="11" rx="3.5" fill="none" stroke="currentColor" opacity=".4" /><rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor" /><rect x="24" y="4" width="1.6" height="4" rx=".8" fill="currentColor" opacity=".4" /></svg>
        </span>
      </div>

      <TodayView
        active={tab === 'v-today'} now={now} det={det} stopped={stopped} needs={needs} gone={gone}
        onOpenDetention={() => openDetention('Today')}
        onResolve={resolveNeed}
        onLumpers={() => say('3 lumper receipts on file · $570')}
        onAlerts={() => { showTab('v-loads'); say('4 loads with something to check') }}
      />
      <LoadsView active={tab === 'v-loads'} departed={stopped} onOpenDetention={() => openDetention('Loads')} />
      <AutomationsView active={tab === 'v-auto'} autos={autos} onToggle={toggleAuto} />

      <DetentionView
        open={pushed} backLabel={backLabel} det={det} arrivedAt={arrivedAt} departedAt={departedAt}
        headsUp={autos.headsup} sentAt={sentAt}
        onBack={closeDetention} onEmail={writeEmail} onDepart={departOrUndo}
      />

      <div className="tabbar" role="tablist" aria-label="Sections">
        {tabs.map(t => (
          <button key={t.id} className="tab" role="tab" aria-selected={tab === t.id} onClick={() => showTab(t.id)}>
            <Icon name={t.icon} />{t.label}
            {t.id === 'v-today' && <span className={`dot num${waiting ? '' : ' zero'}`}>{waiting}</span>}
          </button>
        ))}
      </div>

      <div className={`scrim${sheet ? ' show' : ''}`} onClick={closeSheet} />

      <Sheet
        open={sheet === 'mail'} onClose={closeSheet} labelledBy="mailTitle"
        header={<>
          <button className="back" style={{ paddingLeft: 8 }} onClick={closeSheet}>Cancel</button>
          <h3 id="mailTitle">Detention request</h3>
          <span style={{ width: 64 }} />
        </>}
        footer={<>
          <button className="btn ghost press" onClick={copyEmail}><Icon name="copy" />Copy</button>
          <button className="btn press" onClick={markSent}><Icon name="send" />Mark as sent</button>
        </>}
      >
        <div className="mailhead">
          <div><span>To</span><span>dana@pinecrest-logistics.example</span></div>
          <div><span>Subject</span><span>Detention on DR-2041</span></div>
        </div>
        <label htmlFor="mailBody" className="eyebrow" style={{ margin: '4px 4px -4px' }}>Already written. Edit anything.</label>
        <textarea id="mailBody" spellCheck={false} value={mailBody} onChange={e => setMailBody(e.target.value)} />
      </Sheet>

      <Sheet
        open={sheet === 'depart'} onClose={closeSheet} labelledBy="depTitle"
        footer={<>
          <button className="btn ghost press" onClick={closeSheet}>Cancel</button>
          <button className="btn press" onClick={confirmDepart}>Stop the clock</button>
        </>}
      >
        <div className="confirm-card">
          <b id="depTitle">Truck left the receiver?</b>
          <p>The clock stops at {clock(now)} with {hm(det.elapsed)} at the receiver. {usd(det.amount)} is ready to bill.</p>
        </div>
      </Sheet>

      <div className={`toast${toast.show ? ' show' : ''}`} role="status" aria-live="polite">
        <Icon name="check" /><span>{toast.msg}</span>
      </div>
    </div>
  )
}
