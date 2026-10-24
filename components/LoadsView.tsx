import { useState, type KeyboardEvent } from 'react'
import Icon from './Icon'
import TabView from './TabView'
import { filterLoads, loadStatus, usd, type LoadFilter } from '../lib/detention'

const filters: [LoadFilter, string][] = [['all', 'All'], ['active', 'Active'], ['done', 'Delivered']]

export default function LoadsView({ active, departed, onOpenDetention }: { active: boolean; departed: boolean; onOpenDetention: () => void }) {
  const [filter, setFilter] = useState<LoadFilter>('all')
  const index = filters.findIndex(([f]) => f === filter)

  return (
    <TabView id="v-loads" title="Loads" active={active}>
      <div className="largetitle"><div><div className="date">This week</div><h1>Loads</h1></div></div>
      <div className="seg" role="tablist" aria-label="Filter loads">
        <span className="thumb" style={{ transform: `translateX(${index * 100}%)` }} />
        {filters.map(([f, label]) => (
          <button key={f} role="tab" aria-selected={f === filter} onClick={() => setFilter(f)}>{label}</button>
        ))}
      </div>
      <div className="group">
        {filterLoads(filter).map(l => {
          const [cls, label] = loadStatus(l.state, departed)
          const opens = l.state === 'det'
          return (
            <div key={l.id} className={`item load-row${opens ? ' link' : ''}`}
              {...(opens && {
                tabIndex: 0,
                role: 'button',
                onClick: onOpenDetention,
                onKeyDown: (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenDetention() } },
              })}>
              <span className={`badge ${cls}`}><Icon name="truck" /></span>
              <div className="txt"><div className="ttl">{l.id} · {l.lane}</div><div className="sub">{l.broker}</div></div>
              <div className="right"><span className="amt num">{usd(l.amount)}</span><span className={`status ${cls}`}>{label}</span></div>
            </div>
          )
        })}
      </div>
    </TabView>
  )
}
