"use client"

import { useMemo, useState } from "react"
import { MessageSquare } from "lucide-react"
import { useConversations } from "@/lib/hooks"
import { EmptyState, RowCard, SearchBox, SkeletonList, StatusPill, ReadOnlyNote } from "./shared"

export function ConversationsModule() {
  const { data, isLoading } = useConversations()
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    return q ? data.filter((c) => c.patientName.toLowerCase().includes(q)) : data
  }, [data, query])

  return (
    <div>
      <SearchBox value={query} onChange={setQuery} placeholder="Buscar conversación..." />

      {isLoading && !data ? (
        <SkeletonList />
      ) : filtered.length === 0 ? (
        <EmptyState>Sin conversaciones para esta búsqueda.</EmptyState>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((c) => (
            <RowCard key={c.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{c.patientName}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    {c.messages} mensajes
                  </p>
                </div>
                <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{c.time}</span>
              </div>
              <div className="mt-2.5 flex items-center justify-between gap-2">
                <StatusPill status={c.status} />
                <span className="truncate text-[11px] text-muted-foreground">{c.intent}</span>
              </div>
            </RowCard>
          ))}
        </div>
      )}

      <ReadOnlyNote>
        Vista de solo lectura. Los datos detallados del paciente están en el módulo
        de Secretaría · Datos.
      </ReadOnlyNote>
    </div>
  )
}
