"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import { useApp } from "@/lib/store"
import { BRANCHES } from "@/lib/mock-data"
import type { ModuleId } from "@/lib/types"
import { ConversationsModule } from "@/components/modules/conversations"
import { AgendaModule } from "@/components/modules/agenda"
import { PatientsModule } from "@/components/modules/patients"
import { MetricsModule } from "@/components/modules/metrics"
import { EscalationsModule } from "@/components/modules/escalations"
import { AccountModule } from "@/components/modules/account"

const META: Record<Exclude<ModuleId, "office">, { title: string; subtitle: string; employee?: string }> = {
  conversations: { title: "Conversaciones", subtitle: "Atención de Valentina", employee: "Valentina · Recepción" },
  agenda: { title: "Agenda", subtitle: "Citas gestionadas por Carlos", employee: "Carlos · Agenda" },
  patients: { title: "Pacientes", subtitle: "Datos y CRM de Elena", employee: "Elena · Datos" },
  metrics: { title: "Métricas", subtitle: "Rendimiento diario del sistema" },
  escalations: { title: "Escalamientos", subtitle: "Casos en supervisión", employee: "Steven · Supervisión" },
  account: { title: "Cuenta", subtitle: "Sesión y preferencias" },
}

export function ModulePanel() {
  const { activeModule, closeModule, branchId } = useApp()
  const branch = BRANCHES.find((b) => b.id === branchId)
  const branchName = branch?.name ?? "Todas las sucursales"

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModule()
    }
    if (activeModule) document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [activeModule, closeModule])

  const open = activeModule !== null && activeModule !== "office"
  const meta = open ? META[activeModule as Exclude<ModuleId, "office">] : null

  return (
    <>
      {/* Background scrim — dims/blurs lightly but keeps the office visible */}
      <div
        onClick={closeModule}
        aria-hidden={!open}
        className={`fixed inset-0 z-30 transition-all duration-300 ${
          open
            ? "pointer-events-auto bg-neutral-900/10 backdrop-blur-[2px]"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Sliding panel */}
      <aside
        aria-hidden={!open}
        className={`fixed right-0 top-0 z-40 flex h-full w-full max-w-[440px] flex-col border-l border-border/70 shadow-float transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="glass-strong flex h-full flex-col">
          {meta && (
            <>
              <header className="flex items-start justify-between gap-3 border-b border-border/60 px-5 py-4">
                <div className="min-w-0">
                  {meta.employee && (
                    <p className="font-mono text-[10px] uppercase tracking-wider text-accent">
                      {meta.employee}
                    </p>
                  )}
                  <h2 className="mt-0.5 truncate text-lg font-semibold tracking-tight">
                    {meta.title}
                  </h2>
                  <p className="truncate text-xs text-muted-foreground">
                    {meta.subtitle} · {branchName}
                  </p>
                </div>
                <button
                  onClick={closeModule}
                  aria-label="Cerrar panel"
                  className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </header>

              <div className="scroll-slim flex-1 overflow-y-auto px-5 py-4">
                {activeModule === "conversations" && <ConversationsModule />}
                {activeModule === "agenda" && <AgendaModule />}
                {activeModule === "patients" && <PatientsModule />}
                {activeModule === "metrics" && <MetricsModule />}
                {activeModule === "escalations" && <EscalationsModule />}
                {activeModule === "account" && <AccountModule />}
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  )
}
