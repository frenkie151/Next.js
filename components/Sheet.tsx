import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  labelledBy: string
  header?: ReactNode
  footer: ReactNode
  children: ReactNode
}

// Bottom sheet with a grabber. Drag the grabber or header down to dismiss.
export default function Sheet({ open, onClose, labelledBy, header, footer, children }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef<{ y0: number; dy: number } | null>(null)
  const [offset, setOffset] = useState<number | null>(null)

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => ref.current?.querySelector<HTMLElement>('.sheet-foot .btn:not(.ghost)')?.focus({ preventScroll: true }), 420)
    return () => clearTimeout(t)
  }, [open])

  const down = (e: PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return
    drag.current = { y0: e.clientY, dy: 0 }
    setOffset(0)
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    const dy = e.clientY - drag.current.y0
    drag.current.dy = dy
    setOffset(dy > 0 ? dy : dy / 6)
  }
  const up = () => {
    if (!drag.current) return
    const { dy } = drag.current
    drag.current = null
    setOffset(null)
    if (dy > 110) onClose()
  }
  const handlers = { onPointerDown: down, onPointerMove: move, onPointerUp: up, onPointerCancel: up }

  return (
    <div
      ref={ref}
      className={`sheet${open ? ' show' : ''}${offset !== null ? ' dragging' : ''}`}
      style={offset !== null ? { transform: `translateY(${offset}px)` } : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      inert={!open}
    >
      <div className="grab" aria-hidden="true" {...handlers} />
      {header && <div className="sheet-h" {...handlers}>{header}</div>}
      <div className="sheet-body" style={header ? undefined : { paddingTop: 6 }}>{children}</div>
      <div className="sheet-foot">{footer}</div>
    </div>
  )
}
