import styles from './EstimateTabs.module.scss'

export type EstimateTabId = 'floors' | 'walls'

type EstimateTabsProps = {
  activeTab: EstimateTabId
  onChange: (tab: EstimateTabId) => void
}

const TABS: ReadonlyArray<{ id: EstimateTabId; label: string }> = [
  { id: 'floors', label: 'Полы' },
  { id: 'walls', label: 'Стены' },
]

function focusTab(tabId: EstimateTabId) {
  queueMicrotask(() => {
    document.getElementById(`estimate-tab-${tabId}`)?.focus()
  })
}

export function EstimateTabs({ activeTab, onChange }: EstimateTabsProps) {
  return (
    <div className={styles.wrap} role="tablist" aria-label="Разделы сметы">
      {TABS.map((tab) => {
        const selected = tab.id === activeTab
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`estimate-tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`estimate-panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            className={styles.tab}
            data-active={selected ? 'true' : 'false'}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => {
              if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
              event.preventDefault()
              const index = TABS.findIndex((entry) => entry.id === activeTab)
              const next =
                event.key === 'ArrowRight'
                  ? TABS[(index + 1) % TABS.length]
                  : TABS[(index - 1 + TABS.length) % TABS.length]
              if (!next) return
              onChange(next.id)
              focusTab(next.id)
            }}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
