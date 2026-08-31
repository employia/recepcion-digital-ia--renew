"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { BRANCHES } from "./mock-data"
import type { ModuleId } from "./types"

interface Session {
  email: string
  name: string
}

interface AppState {
  // auth (mock now, Supabase Auth later)
  session: Session | null
  signIn: (email: string) => void
  signOut: () => void
  // branch context — a filter over data, not a different office
  branchId: string
  setBranchId: (id: string) => void
  // active module panel (null = office view, no panel)
  activeModule: ModuleId | null
  openModule: (m: ModuleId) => void
  closeModule: () => void
  // hovered / selected employee in the 3D office
  hoveredEmployee: string | null
  setHoveredEmployee: (id: string | null) => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [branchId, setBranchId] = useState<string>(BRANCHES[0].id)
  const [activeModule, setActiveModule] = useState<ModuleId | null>(null)
  const [hoveredEmployee, setHoveredEmployee] = useState<string | null>(null)

  const signIn = useCallback((email: string) => {
    const name = email.split("@")[0].replace(/[._]/g, " ")
    setSession({ email, name: name.charAt(0).toUpperCase() + name.slice(1) })
  }, [])

  const signOut = useCallback(() => {
    setSession(null)
    setActiveModule(null)
  }, [])

  const openModule = useCallback((m: ModuleId) => {
    setActiveModule(m === "office" ? null : m)
  }, [])

  const closeModule = useCallback(() => setActiveModule(null), [])

  const value = useMemo<AppState>(
    () => ({
      session,
      signIn,
      signOut,
      branchId,
      setBranchId,
      activeModule,
      openModule,
      closeModule,
      hoveredEmployee,
      setHoveredEmployee,
    }),
    [session, signIn, signOut, branchId, activeModule, openModule, closeModule, hoveredEmployee],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
