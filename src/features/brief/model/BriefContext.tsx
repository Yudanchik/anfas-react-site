import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react'
import { briefServiceOptions, type BriefService } from './brief.form'

type BriefContextValue = {
  isOpen: boolean
  presetService: BriefService
  openBrief: (service?: BriefService) => void
  closeBrief: () => void
}

const BriefContext = createContext<BriefContextValue | null>(null)

function isBriefService(value: unknown): value is BriefService {
  return briefServiceOptions.some((option) => option.value === value)
}

export function BriefProvider({ children }: PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false)
  const [presetService, setPresetService] = useState<BriefService>('general')
  const value = useMemo(
    () => ({
      isOpen,
      presetService,
      openBrief: (service: BriefService = 'general') => {
        setPresetService(isBriefService(service) ? service : 'general')
        setIsOpen(true)
      },
      closeBrief: () => setIsOpen(false),
    }),
    [isOpen, presetService],
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
