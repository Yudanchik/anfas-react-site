import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react'

type BriefContextValue = {
  isOpen: boolean
  openBrief: () => void
  closeBrief: () => void
}

const BriefContext = createContext<BriefContextValue | null>(null)

export function BriefProvider({ children }: PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false)
  const value = useMemo(
    () => ({
      isOpen,
      openBrief: () => setIsOpen(true),
      closeBrief: () => setIsOpen(false),
    }),
    [isOpen],
  )

  return <BriefContext.Provider value={value}>{children}</BriefContext.Provider>
}

export function useBrief() {
  const context = useContext(BriefContext)

  if (!context) {
    throw new Error('useBrief must be used inside BriefProvider')
  }

  return context
}
