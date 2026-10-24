import { useEffect, useRef } from 'react'

// Plays the springy "bump" animation on an element whenever `value` changes.
export default function useBump<T extends HTMLElement>(value: unknown) {
  const ref = useRef<T>(null)
  const prev = useRef(value)
  useEffect(() => {
    const el = ref.current
    if (el && prev.current !== value) {
      el.classList.remove('bump')
      void el.offsetWidth
      el.classList.add('bump')
    }
    prev.current = value
  }, [value])
  return ref
}
