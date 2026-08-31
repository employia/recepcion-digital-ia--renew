"use client"

import { useState } from "react"
import { ArrowRight, Building2, Loader2 } from "lucide-react"
import { useApp } from "@/lib/store"

export function LoginScreen() {
  const { signIn } = useApp()
  const [email, setEmail] = useState("equipo@renew.do")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    // Mock authentication. Swap for Supabase Auth (signInWithPassword) later.
    setTimeout(() => signIn(email), 650)
  }

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-6">
      {/* Ambient warm light, very subtle */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 600px at 70% -10%, oklch(0.98 0.02 80 / 0.9), transparent 60%), radial-gradient(900px 500px at 10% 110%, oklch(0.94 0.02 215 / 0.35), transparent 55%)",
        }}
      />

      <div className="relative grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl border border-border bg-card shadow-float lg:grid-cols-2">
        {/* Brand / narrative side */}
        <section className="relative hidden flex-col justify-between p-10 lg:flex">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(155deg, oklch(0.29 0.01 70), oklch(0.22 0.008 70))",
            }}
          />
          <div className="relative flex items-center gap-2.5 text-[oklch(0.95_0.004_85)]">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[oklch(0.98_0.004_85)]/10 ring-1 ring-white/15">
              <Building2 className="h-4 w-4" />
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/70">
              Renew
            </span>
          </div>

          <div className="relative space-y-4">
            <h2 className="text-balance text-3xl font-medium leading-tight text-[oklch(0.97_0.004_85)]">
              La oficina digital de tu Recepción Digital IA.
            </h2>
            <p className="max-w-sm text-pretty text-sm leading-relaxed text-white/60">
              Un espacio donde cada área del sistema toma forma. Entra, observa a
              tu equipo digital trabajando y consulta todo en un solo lugar.
            </p>
          </div>

          <div className="relative flex items-center gap-6 font-mono text-[11px] uppercase tracking-wider text-white/40">
            <span>Recepción</span>
            <span>Agenda</span>
            <span>Datos</span>
            <span>Supervisión</span>
          </div>
        </section>

        {/* Form side */}
        <section className="flex flex-col justify-center p-8 sm:p-12">
          <div className="mb-8">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Recepción Digital IA
            </p>
            <h1 className="mt-2 text-2xl font-medium tracking-tight">Iniciar sesión</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Acceso exclusivo para el equipo de Renew.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-ring focus:ring-4 focus:ring-ring/10"
                placeholder="tu@renew.do"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-ring focus:ring-4 focus:ring-ring/10"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Entrar a la oficina
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            Demo: usa cualquier correo y contraseña para entrar. La autenticación
            real con Supabase Auth se conecta en un paso posterior.
          </p>
        </section>
      </div>
    </main>
  )
}
