import { useState } from 'react'
import Icon from './Icon'
import TabView from './TabView'
import Toggle from './Toggle'
import { automations, type AutoKey } from '../lib/detention'

interface Props {
  active: boolean
  autos: Record<AutoKey, boolean>
  onToggle: (key: AutoKey) => void
}

export default function AutomationsView({ active, autos, onToggle }: Props) {
  const [open, setOpen] = useState<AutoKey | null>(null)

  return (
    <TabView id="v-auto" title="Automations" active={active}>
      <div className="largetitle"><div><div className="date">Sent for you</div><h1>Automations</h1></div></div>

      <div className="feature">
        <div className="row">
          <span className="badge b-amber"><Icon name="hourglass" /></span>
          <b>Detention heads-up</b>
          <Toggle on={autos.headsup} label="Detention heads-up" onChange={() => onToggle('headsup')} />
        </div>
        <p>Tells the broker before their notice deadline, or the moment detention starts when no advance notice is required.</p>
      </div>

      <div className="section-h"><h3>All automations</h3></div>
      <div className="group">
        {automations.map(a => (
          <div key={a.key} className="item auto-row">
            <span className="badge b-amber"><Icon name={a.icon} /></span>
            <div className="txt">
              <div className="ttl">
                {a.title}
                <button className="info" aria-expanded={open === a.key} aria-controls={`ex-${a.key}`} aria-label={`About ${a.title}`}
                  onClick={() => setOpen(open === a.key ? null : a.key)}>
                  <Icon name="info" />
                </button>
              </div>
            </div>
            <Toggle on={autos[a.key]} label={a.title} onChange={() => onToggle(a.key)} />
            <div className={`explain${open === a.key ? ' open' : ''}`} id={`ex-${a.key}`}><div>{a.detail}</div></div>
          </div>
        ))}
      </div>
      <p className="footnote">Each switch acts only from the moment you turn it on.</p>
    </TabView>
  )
}
