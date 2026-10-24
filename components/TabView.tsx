import { useState, type ReactNode } from 'react'

// A tab's scrolling page: large title in the content, compact blurred bar once you scroll past it.
export default function TabView({ id, title, active, children }: { id: string; title: string; active: boolean; children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false)
  return (
    <section
      className={`view tabview${active ? ' active' : ''}`}
      id={id}
      aria-label={title}
      inert={!active}
      onScroll={e => setScrolled(e.currentTarget.scrollTop > 46)}
    >
      <div className={`navbar${scrolled ? ' show' : ''}`} aria-hidden="true"><h2>{title}</h2></div>
      <div className="content">{children}</div>
    </section>
  )
}
