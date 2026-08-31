"use client"

import { LogOut, ShieldCheck } from "lucide-react"
import { useApp } from "@/lib/store"
import { BRANCHES } from "@/lib/mock-data"

export function AccountModule() {
  const { session, signOut, branchId } = useApp()
  const branch = BRANCHES.find((b) => b.id === branchId)!

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/70 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
          {session?.name?.charAt(0).toUpperCase() ?? "R"}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{session?.name ?? "Equipo Renew"}</p>
          <p className="truncate text-xs text-muted-foreground">{session?.email}</p>
        </div>
      </div>

      <div className="space-y-2.5">
        <Field label="Organización" value="Renew" />
        <Field label="Sucursal activa" value={branch.name} />
        <Field label="Producto" value="Recepción Digital IA" />
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-secondary/50 p-3 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <p className="leading-relaxed">
          Sesión de demostración. La autenticación con Supabase Auth (correo y
          contraseña) se conecta en un paso posterior.
        </p>
      </div>

      <button
        onClick={signOut}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium transition hover:bg-secondary"
      >
        <LogOut className="h-4 w-4" />
        Cerrar sesión
      </button>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card/70 px-3.5 py-2.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}
