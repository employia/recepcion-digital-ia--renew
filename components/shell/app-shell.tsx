"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { MousePointerClick } from "lucide-react"
import { useApp } from "@/lib/store"
import { OfficeLoading } from "@/components/office/office-view"
import { Sidebar } from "./sidebar"
import { BranchSelector } from "./branch-selector"
import { ModulePanel } from "./module-panel"

// The 3D office is client-only; avoid SSR of the WebGL canvas.
const OfficeView = dynamic(
  () => import("@/components/office/office-view").then((m) => m.OfficeView),
  { ssr: false, loading: () => <OfficeLoading /> },
)

export function AppShell() {
  const { activeModule } = useApp()
  const [showHint, setShowHint] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 6000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (activeModule) setShowHint(false)
  }, [activeModule])

  return (
    <main className="relative h-screen w-full overflow-hidden bg-background">
      <OfficeView />

      {/* Floating UI layer */}
      <BranchSelector />
      <Sidebar />
      <ModulePanel />

      {/* Onboarding hint — appears briefly, unobtrusive */}
      <div
        className={`pointer-events-none fixed bottom-6 left-1/2 z-30 -translate-x-1/2 transition-all duration-500 ${
          showHint ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
      >
        <div className="glass flex items-center gap-2 rounded-full border border-border/70 px-4 py-2 text-xs text-muted-foreground shadow-float">
          <MousePointerClick className="h-3.5 w-3.5 text-accent" />
          Haz clic en un empleado para abrir su módulo
        </div>
      </div>
    </main>
  )
}
