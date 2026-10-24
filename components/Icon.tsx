import type { CSSProperties } from 'react'
import { icons, type IconName } from '../lib/detention'

export default function Icon({ name, className = 'i', style }: { name: IconName; className?: string; style?: CSSProperties }) {
  return <svg className={className} style={style} viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: icons[name] }} />
}
