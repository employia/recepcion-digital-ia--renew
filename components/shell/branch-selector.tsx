"use client"

import { useEffect, useRef, useState } from "react"
import { Check, ChevronDown, MapPin } from "lucide-react"
import { ALL_BRANCHES_BRANCH, BRANCHES } from "@/lib/mock-data"
import { useApp } from "@/lib/store"

// The selector lists every real branch plus a combined "Todas las sucursales" view.
const OPTIONS = [...BRANCHES, ALL_BRANCHES_BRANCH]

export function BranchSelector() {
  const { branchId, setBranchId } = useApp()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = OPTIONS.find((b) => b.id === branchId) ?? OPTIONS[0]

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  return (
    <div ref={ref} className="pointer-events-auto fixed left-1/2 top-4 z-40 -translate-x-1/2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="glass flex items-center gap-2 rounded-xl border border-border/70 px-3.5 py-2 shadow-float transition hover:bg-card"
      >
        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-sm font-medium">{current.label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="glass-strong absolute left-1/2 mt-2 w-64 -translate-x-1/2 overflow-hidden rounded-xl border border-border/70 p-1 shadow-float animate-in fade-in slide-in-from-top-1 duration-150">
          <p className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Sucursal
          </p>
          {BRANCHES.map((b) => (
            <button
              key={b.id}
              onClick={() => {
                setBranchId(b.id)
                setOpen(false)
              }}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-secondary"
            >
              <span className={b.id === branchId ? "font-medium" : ""}>{b.name}</span>
              {b.id === branchId && <Check className="h-3.5 w-3.5 text-accent" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
