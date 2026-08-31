"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts"
import { useMetrics } from "@/lib/hooks"
import { SkeletonList, ReadOnlyNote } from "./shared"

// Recharts renders these as SVG presentation attributes, where CSS custom
// properties (var(--x)) do NOT resolve — so we use explicit theme colors.
const C = {
  accent: "oklch(0.6 0.07 215)",
  chart2: "oklch(0.62 0.09 150)",
  axis: "oklch(0.55 0.008 75)",
  grid: "oklch(0.89 0.006 85)",
}

export function MetricsModule() {
  const { data, isLoading } = useMetrics()

  if (isLoading && !data) return <SkeletonList rows={4} />
  if (!data) return null

  const { operation, agenda, business } = data
  const maxService = Math.max(...business.topServices.map((s) => s.value))

  return (
    <div className="space-y-6">
      {/* Operation */}
      <Section title="Operación">
        <div className="grid grid-cols-2 gap-2.5">
          <Kpi label="Conversaciones atendidas" value={operation.conversationsAttended} />
          <Kpi label="Mensajes procesados" value={operation.messagesProcessed.toLocaleString()} />
          <Kpi label="Tiempo prom. respuesta" value={`${operation.avgResponseSeconds}s`} />
          <Kpi label="Resueltas" value={operation.conversationsResolved} />
        </div>
        <ChartCard label="Conversaciones por hora" hint={`${operation.escalations} escalamientos hoy`}>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={operation.trend} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="opFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.accent} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: C.axis }}
              />
              <Tooltip content={<MiniTooltip suffix=" conv." />} cursor={{ stroke: C.grid }} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={C.accent}
                strokeWidth={2}
                fill="url(#opFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </Section>

      {/* Agenda */}
      <Section title="Agenda">
        <div className="grid grid-cols-4 gap-2">
          <Kpi small label="Creadas" value={agenda.created} />
          <Kpi small label="Cancel." value={agenda.canceled} />
          <Kpi small label="Reprog." value={agenda.rescheduled} />
          <Kpi small label="No-shows" value={agenda.noShows} />
        </div>
        <ChartCard label="Citas creadas · semana">
          <ResponsiveContainer width="100%" height={110}>
            <BarChart data={agenda.trend} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: C.axis }}
              />
              <Tooltip content={<MiniTooltip suffix=" citas" />} cursor={{ fill: "oklch(0.93 0.006 85)" }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} fill={C.chart2} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </Section>

      {/* Business */}
      <Section title="Negocio">
        <div className="grid grid-cols-2 gap-2.5">
          <Kpi
            label="Conversión conv. → cita"
            value={`${Math.round(business.conversionRate * 100)}%`}
          />
          <Kpi label="Clientes nuevos" value={business.newClients} />
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
          <p className="mb-3 text-xs font-medium text-muted-foreground">
            Servicios más solicitados
          </p>
          <div className="space-y-2.5">
            {business.topServices.map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between text-xs">
                  <span>{s.label}</span>
                  <span className="tabular-nums text-muted-foreground">{s.value}</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-accent/70"
                    style={{ width: `${(s.value / maxService) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <ReadOnlyNote>
        Métricas diarias del sistema. Se actualizan automáticamente.
      </ReadOnlyNote>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  )
}

function Kpi({ label, value, small }: { label: string; value: string | number; small?: boolean }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/70 p-3">
      <p className={`${small ? "text-[10px]" : "text-[11px]"} text-muted-foreground`}>{label}</p>
      <p className={`mt-1 font-semibold tabular-nums ${small ? "text-lg" : "text-2xl"}`}>{value}</p>
    </div>
  )
}

function ChartCard({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  )
}

function MiniTooltip({ active, payload, label, suffix }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs shadow-soft">
      <span className="font-mono text-[10px] text-muted-foreground">{label}</span>
      <div className="font-semibold tabular-nums">
        {payload[0].value}
        {suffix}
      </div>
    </div>
  )
}
