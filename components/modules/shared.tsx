"use client"

import { Search } from "lucide-react"
import type { ReactNode } from "react"

export function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <div className="relative mb-4">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-input bg-card/60 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-ring focus:ring-4 focus:ring-ring/10"
      />
    </div>
  )
}

const STATUS_STYLES: Record<string, string> = {
  attending: "bg-accent/10 text-accent border-accent/20",
  resolved: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  "waiting-human": "bg-amber-500/12 text-amber-700 border-amber-500/25",
  "human-attending": "bg-accent/10 text-accent border-accent/20",
}

const STATUS_LABEL: Record<string, string> = {
  attending: "Valentina atendiendo",
  resolved: "Conversación resuelta",
  "waiting-human": "Esperando humano",
  "human-attending": "Humano atendiendo",
}

export function StatusPill({ status, label }: { status: string; label?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
        STATUS_STYLES[status] ?? "border-border bg-secondary text-muted-foreground"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label ?? STATUS_LABEL[status] ?? status}
    </span>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
      {children}
    </div>
  )
}

export function RowCard({
  children,
  onClick,
  active,
}: {
  children: ReactNode
  onClick?: () => void
  active?: boolean
}) {
  const Comp = onClick ? "button" : "div"
  return (
    <Comp
      onClick={onClick}
      className={`w-full rounded-xl border p-3.5 text-left transition ${
        active
          ? "border-accent/40 bg-accent/5"
          : "border-border/70 bg-card/60 hover:border-border hover:bg-card"
      } ${onClick ? "cursor-pointer" : ""}`}
    >
      {children}
    </Comp>
  )
}

export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-[76px] animate-pulse rounded-xl border border-border/60 bg-secondary/50" />
      ))}
    </div>
  )
}

export function ReadOnlyNote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 rounded-lg bg-secondary/70 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
      {children}
    </p>
  )
}
