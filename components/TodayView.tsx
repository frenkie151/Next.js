import Icon from './Icon'
import TabView from './TabView'
import useBump from '../lib/useBump'
import { hm, hmPad, longDate, usd, type Detention, type Need } from '../lib/detention'

interface Props {
  active: boolean
  now: number
  det: Detention
  stopped: boolean
  needs: Need[]
  gone: Set<string>
  onOpenDetention: () => void
  onResolve: (need: Need, toast?: string) => void
  onLumpers: () => void
  onAlerts: () => void
}

export default function TodayView({ active, now, det, stopped, needs, gone, onOpenDetention, onResolve, onLumpers, onAlerts }: Props) {
  const money = usd(det.amount)
  const moneyRef = useBump<HTMLSpanElement>(det.amount)
  const waiting = needs.length - gone.size

  return (
    <TabView id="v-today" title="Today" active={active}>
      <div className="largetitle">
        <div>
          <div className="date">{longDate(now)}</div>
          <h1>Today</h1>
        </div>
        <div className="avatar" aria-label="Northbound Freight dispatch">NF</div>
      </div>

      <button className="live press" onClick={onOpenDetention} aria-label="Open detention on load DR-2041">
        <div className="row1">
          <span className={`pulse${stopped ? ' stopped' : ''}`}>{stopped ? 'Detention · truck left' : 'Detention · clock running'}</span>
          <Icon name="chevR" className="i chev" />
        </div>
        <div className="big">
          <span className="t num">{hmPad(det.elapsed)}</span>
          <span className="m num" ref={moneyRef}>{money} to bill</span>
        </div>
        <div className="who">DR-2041 · Maria Ortiz at Lodi Cold Storage</div>
      </button>

      <div className="tiles">
        <button className="tile hot press" onClick={onOpenDetention}>
          <div className="top"><span className="ico"><Icon name="hourglass" /></span></div>
          <div><b>Detention</b><span className="sub num">{money} to bill</span></div>
        </button>
        <button className="tile amber press" onClick={onLumpers}>
          <div className="top"><span className="ico"><Icon name="receipt" /></span></div>
          <div><b>Lumpers</b><span className="sub">$570 to recover</span></div>
        </button>
        <button className="tile blue press" onClick={onAlerts}>
          <div className="top"><span className="ico"><Icon name="alert" /></span></div>
          <div><b>Alerts</b><span className="sub">4 to look at</span></div>
        </button>
      </div>

      <div className="section-h">
        <h3>Needs you <span className="count num" hidden={!waiting}>{waiting}</span></h3>
        <span className="meta">{waiting ? `${waiting} waiting` : 'All clear'}</span>
      </div>
      <div className={`group${waiting ? '' : ' allclear'}`}>
        {needs.map(n => {
          const sub = n.opensDetention ? `${hm(det.elapsed)} at receiver · ${money} to bill` : n.sub
          const body = (
            <>
              <span className={`badge ${n.badge}`}><Icon name={n.icon} /></span>
              <div className="txt">
                <div className="kind">{n.kind}</div>
                <div className="ttl">{n.title}</div>
                <div className="sub num">{sub}</div>
              </div>
            </>
          )
          const cls = `item${gone.has(n.id) ? ' gone' : ''}`
          if (n.opensDetention) {
            return (
              <div key={n.id} className={`${cls} link`} tabIndex={0} role="button" aria-label="Open detention on DR-2041"
                onClick={onOpenDetention}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenDetention() } }}>
                {body}
                <Icon name="chevR" className="i chev" />
              </div>
            )
          }
          return (
            <div key={n.id} className={cls}>
              {body}
              {n.action && <button className="pill-btn press" onClick={() => onResolve(n, n.action!.toast)}>{n.action.label}</button>}
              <button className="x-btn" aria-label="Dismiss" onClick={() => onResolve(n)}><Icon name="x" /></button>
            </div>
          )
        })}
        <div className="empty">You&apos;re all caught up.</div>
      </div>
      <p className="demo-note">Example company and loads. Numbers are demo data.</p>
    </TabView>
  )
}
