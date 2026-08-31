"use client"

import { useMemo, useState } from "react"
import { Clock, MapPin, Stethoscope } from "lucide-react"
import { useAppointments } from "@/lib/hooks"
import { EmptyState, RowCard, SearchBox, SkeletonList, ReadOnlyNote } from "./shared"

export function AgendaModule() {
  const { data, isLoading } = useAppointments()
  const [query, setQuery] = useState("")

  const grouped = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    const rows = q
      ? data.filter(
          (a) =>
            a.patientName.toLowerCase().includes(q) ||
            a.service.toLowerCase().includes(q),
        )
      : data
    const map = new Map<string, typeof rows>()
    for (const a of rows) {
      const list = map.get(a.date) ?? []
      list.push(a)
      map.set(a.date, list)
    }
    return Array.from(map.entries())
  }, [data, query])

  return (
    <div>
      <SearchBox value={query} onChange={setQuery} placeholder="Buscar paciente o servicio..." />

      {isLoading && !data ? (
        <SkeletonList />
      ) : grouped.length === 0 ? (
        <EmptyState>No hay citas para esta búsqueda.</EmptyState>
      ) : (
        <div className="space-y-5">
          {grouped.map(([date, rows]) => (
            <div key={date}>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {date}
              </p>
              <div className="space-y-2.5">
                {rows.map((a) => (
                  <RowCard key={a.id}>
                    <div className="flex items-start justify-between gap-3">
                      <p className="truncate text-sm font-semibold">{a.patientName}</p>
                      <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[11px] text-foreground">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {a.time}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Stethoscope className="h-3 w-3" />
                        {a.service}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {a.branchLabel}
                      </span>
                    </div>
                  </RowCard>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <ReadOnlyNote>
        Consulta de disponibilidad, servicios y sucursales. La aplicación no crea,
        edita ni cancela citas.
      </ReadOnlyNote>
    </div>
  )
}
