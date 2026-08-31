"use client"

import {
  Building2,
  CalendarDays,
  LayoutGrid,
  LineChart,
  MessageSquare,
  TriangleAlert,
  UserRound,
  Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useApp } from "@/lib/store"
import type { ModuleId } from "@/lib/types"

const NAV: { id: ModuleId; label: string; icon: LucideIcon }[] = [
  { id: "office", label: "Oficina", icon: LayoutGrid },
  { id: "conversations", label: "Conversaciones", icon: MessageSquare },
  { id: "agenda", label: "Citas", icon: CalendarDays },
  { id: "patients", label: "Pacientes", icon: Users },
  { id: "metrics", label: "Métricas", icon: LineChart },
  { id: "escalations", label: "Escalamientos", icon: TriangleAlert },
]

export function Sidebar() {
  const { activeModule, openModule, closeModule } = useApp()

  return (
    <nav
      aria-label="Navegación principal"
      className="pointer-events-auto fixed left-4 top-1/2 z-40 -translate-y-1/2"
    >
      <div className="glass flex flex-col items-stretch gap-1 rounded-2xl border border-border/70 p-2 shadow-float">
        {/* Brand mark */}
        <div className="mb-1 flex items-center gap-2 px-2 py-1.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="h-3.5 w-3.5" />
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground lg:block">
            Renew
          </span>
        </div>

        {NAV.map((item) => {
          const isOffice = item.id === "office"
          const active = isOffice ? activeModule === null : activeModule === item.id
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => (isOffice ? closeModule() : openModule(item.id))}
              className={`group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm transition ${
                active
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="hidden w-28 truncate lg:block">{item.label}</span>
            </button>
          )
        })}

        <div className="my-1 h-px bg-border/70" />

        <button
          onClick={() => openModule("account")}
          className={`group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm transition ${
            activeModule === "account"
              ? "bg-primary text-primary-foreground shadow-soft"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          <UserRound className="h-4 w-4 shrink-0" />
          <span className="hidden w-28 truncate lg:block">Cuenta</span>
        </button>
      </div>
    </nav>
  )
}
