import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

type TeaSteepValue = {
  steeping: boolean
  setSteeping: (value: boolean) => void
}

const TeaSteepContext = createContext<TeaSteepValue>({
  steeping: false,
  setSteeping: () => {},
})

export function TeaSteepProvider({ children }: { children: ReactNode }) {
  const [steeping, setSteeping] = useState(false)
  const value = useMemo(() => ({ steeping, setSteeping }), [steeping])
  return <TeaSteepContext.Provider value={value}>{children}</TeaSteepContext.Provider>
}

export function useTeaSteep() {
  return useContext(TeaSteepContext)
}
