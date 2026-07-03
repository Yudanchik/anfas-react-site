export function PlusIcon({ open }: { open: boolean }) {
  return (
    <span className={`plus-icon ${open ? 'is-open' : ''}`} aria-hidden="true">
      <span />
      <span />
    </span>
  )
}
