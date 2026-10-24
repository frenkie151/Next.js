export default function Toggle({ on, label, onChange }: { on: boolean; label: string; onChange: () => void }) {
  return <button className="toggle" role="switch" aria-checked={on} aria-label={label} onClick={onChange} />
}
