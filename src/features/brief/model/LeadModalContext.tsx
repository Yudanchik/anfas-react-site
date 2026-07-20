import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'

import {
  getLeadModalPreset,
  type LeadModalOpenOptions,
  type LeadModalPreset,
} from './lead-modal'

const defaultModalState: LeadModalOpenOptions = { intent: 'consultation' }

type LeadModalContextValue = {
  isOpen: boolean
  modalState: LeadModalOpenOptions
  preset: LeadModalPreset
  openLeadModal: (options: LeadModalOpenOptions) => void
  closeLeadModal: () => void
}

const LeadModalContext = createContext<LeadModalContextValue | null>(null)

export function LeadModalProvider({ children }: PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false)
  const [modalState, setModalState] = useState<LeadModalOpenOptions>(defaultModalState)

  const openLeadModal = useCallback((options: LeadModalOpenOptions) => {
    setModalState(options)
    setIsOpen(true)
  }, [])

  const closeLeadModal = useCallback(() => setIsOpen(false), [])
  const preset = useMemo(() => getLeadModalPreset(modalState), [modalState])
  const value = useMemo(
    () => ({ isOpen, modalState, preset, openLeadModal, closeLeadModal }),
    [closeLeadModal, isOpen, modalState, openLeadModal, preset],
  )

  return <LeadModalContext.Provider value={value}>{children}</LeadModalContext.Provider>
}

export function useLeadModal() {
  const context = useContext(LeadModalContext)

  if (!context) {
    throw new Error('useLeadModal must be used inside LeadModalProvider')
  }

  return context
}
