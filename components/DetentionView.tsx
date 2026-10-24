import { useEffect, useRef, useState, type PointerEvent } from 'react'
import Icon from './Icon'
import useBump from '../lib/useBump'
import { FREE, H, STEP, STEP_USD, clock, countdown, hm, hmPad, secs, usd, type Detention } from '../lib/detention'

interface Props {
  open: boolean
  backLabel: string
  det: Detention
  arrivedAt: number
  departedAt: number | null
  headsUp: boolean
  sentAt: number | null
  onBack: () => void
  onEmail: () => void
  onDepart: () => void
}

const RING = 56.55

export default function DetentionView({ open, backLabel, det, arrivedAt, departedAt, headsUp, sentAt, onBack, onEmail, onDepart }: Props) {
  const stopped = departedAt !== null
  const viewRef = useRef<HTMLElement>(null)
  const backRef = useRef<HTMLButtonElement>(null)
  const moneyRef = useBump<HTMLElement>(det.amount)

  // Let the timeline grow from zero each time the screen slides in.
  const [grown, setGrown] = useState(false)
  useEffect(() => {
    if (!open) { setGrown(false); return }
    viewRef.current?.scrollTo(0, 0)
    let r2 = 0
    const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => setGrown(true)) })
    const t = setTimeout(() => backRef.current?.focus({ preventScroll: true }), 450)
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); clearTimeout(t) }
  }, [open])
  const free = det.elapsed ? Math.min(det.elapsed, FREE) / det.elapsed : 1

  // Swipe from the left edge to go back, like iOS.
  const swipe = useRef<{ x0: number; dx: number; w: number } | null>(null)
  const underlay = () => document.querySelector<HTMLElement>('.tabview.active')
  const device = () => viewRef.current?.closest<HTMLElement>('.device')
  const down = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    if (!open || e.pointerType === 'mouse' || e.clientX - r.left > 28) return
    swipe.current = { x0: e.clientX, dx: 0, w: r.width }
    e.currentTarget.classList.add('dragging')
    device()?.classList.add('dragging')
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const move = (e: PointerEvent<HTMLElement>) => {
    const s = swipe.current
    if (!s) return
    s.dx = Math.max(0, e.clientX - s.x0)
    e.currentTarget.style.transform = `translateX(${s.dx}px)`
    const u = underlay()
    if (u) u.style.transform = `translateX(${-28 + (s.dx / s.w) * 28}%)`
  }
  const up = (e: PointerEvent<HTMLElement>) => {
    const s = swipe.current
    if (!s) return
    swipe.current = null
    e.currentTarget.classList.remove('dragging')
    device()?.classList.remove('dragging')
    e.currentTarget.style.transform = ''
    const u = underlay()
    if (u) u.style.transform = ''
    if (s.dx > s.w * 0.33) onBack()
  }

  return (
    <section ref={viewRef} className="view push" aria-label="Detention on DR-2041" aria-hidden={!open} inert={!open}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
      <div className="pushbar">
        <button className="back" ref={backRef} onClick={onBack}><Icon name="chevL" />{backLabel}</button>
        <h2>Detention</h2>
      </div>
      <div className="dcontent">
        <div className={`hero${stopped ? ' stopped' : ''}`}>
          <span className={`pulse${stopped ? ' stopped' : ''}`}>{stopped ? `Truck left · ${clock(departedAt)}` : 'Elapsed · and counting'}</span>
          <div className="clock num"><span>{hmPad(det.elapsed)}</span><small>{secs(det.elapsed)}</small></div>
          <div className="accrue num">
            <strong ref={moneyRef}>{usd(det.amount)}</strong>{stopped ? ' to bill · clock stopped' : ' accruing · after 2 hrs free'}
          </div>
          <div className="timeline">
            <div className="track">
              <span className="free" style={{ width: grown ? `${(free * 100).toFixed(2)}%` : 0 }} />
              <span className="bill" style={{ width: grown ? `${((1 - free) * 100).toFixed(2)}%` : 0 }} />
            </div>
            <div className="marks num">
              <div><b>{clock(arrivedAt)}</b>Arrived</div>
              <div><b>{clock(arrivedAt + FREE)}</b>Free time up</div>
              <div><b>{stopped ? clock(departedAt) : 'now'}</b>{stopped ? 'Departed' : hm(det.elapsed)}</div>
            </div>
          </div>
        </div>

        {headsUp ? (
          <div className="notice b-green"><Icon name="bell" /><span>Broker heads-up sent at {clock(arrivedAt + H)}, before the notice deadline.</span></div>
        ) : (
          <div className="notice b-amber"><Icon name="bell" /><span>Heads-up automation is off. Turn it on in Automations to notify brokers for you.</span></div>
        )}

        <div className="chips">
          <div className="chip"><span className="avatar">MO</span><div><div className="k">Driver</div><div className="v">Maria Ortiz</div></div></div>
          <div className="chip"><span className="avatar pin"><Icon name="pin" style={{ width: 18, height: 18 }} /></span><div><div className="k">Receiver</div><div className="v">Lodi Cold Storage</div></div></div>
        </div>

        <div className="figured">
          <h4>How it was figured</h4>
          <p>Receiver detention on DR-2041. Two free hours from the rate con, then $75 an hour, billed in 15-minute steps.</p>
          <div className="kv"><span>Time at receiver</span><span className="num">{hm(det.elapsed)}</span></div>
          <div className="kv"><span>Free time</span><span className="num">2h 0m</span></div>
          <div className="kv"><span>Billable</span><span className="num">{hm(det.billable)} · {det.steps} steps</span></div>
          <div className="kv"><span>Rate</span><span className="num">$75 / hr · {usd(STEP_USD, true)} a step</span></div>
          <div className="kv" hidden={stopped}>
            <span>Next step</span>
            <span className="ring num">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle className="bgc" cx="12" cy="12" r="9" />
                <circle className="fgc" cx="12" cy="12" r="9" strokeDasharray={RING} strokeDashoffset={(RING * (det.toNext / STEP)).toFixed(2)} />
              </svg>
              <span>+{usd(STEP_USD, true)} in {countdown(det.toNext)}</span>
            </span>
          </div>
          <div className="kv total"><span>To bill</span><span className="num">{usd(det.amount, true)}</span></div>
        </div>

        <div className="figured">
          <h4>Broker</h4>
          <div className="kv"><span>Pinecrest Logistics</span><span>Dana Whitfield</span></div>
          <div className="kv"><span>Rate con</span><span className="num">$2,100 line haul</span></div>
          <div className="kv"><span>Request</span><span style={sentAt ? { color: 'var(--ok)' } : undefined}>{sentAt ? `Sent ${clock(sentAt)}` : 'Not sent yet'}</span></div>
        </div>
      </div>
      <div className="actions">
        <button className="btn secondary press" onClick={onDepart}><Icon name="flag" /><span>{stopped ? 'Undo' : 'Truck left'}</span></button>
        <button className="btn press" onClick={onEmail}><Icon name="mail" />Write email</button>
      </div>
    </section>
  )
}
