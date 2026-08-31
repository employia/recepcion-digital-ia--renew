"use client"

import { ExternalLink, TriangleAlert } from "lucide-react"
import { useEscalations } from "@/lib/hooks"
import { EmptyState, SkeletonList, StatusPill, ReadOnlyNote } from "./shared"

const PRIORITY_STYLE: Record<string, string> = {
  Alta: "text-destructive",
  Media: "text-amber-600",
  Baja: "text-muted-foreground",
}

// Chatwoot lives in the real infrastructure — we only link out to it.
const CHATWOOT_BASE = "https://app.chatwoot.com"

export function EscalationsModule() {
  const { data, isLoading } = useEscalations()

  function openChatwoot(conversationId: string) {
    const url = `${CHATWOOT_BASE}/?ref=renew&conversation=${encodeURIComponent(conversationId)}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <div>
      {isLoading && !data ? (
        <SkeletonList rows={4} />
      ) : !data || data.length === 0 ? (
        <EmptyState>No hay escalamientos activos.</EmptyState>
      ) : (
        <div className="space-y-3">
          {data.map((e) => (
            <div
              key={e.id}
              className="rounded-2xl border border-border/70 bg-card/70 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-destructive">
                  <TriangleAlert className="h-3.5 w-3.5" />
                  Escalamiento
                </span>
                <span className={`text-[11px] font-medium ${PRIORITY_STYLE[e.priority]}`}>
                  Prioridad {e.priority}
                </span>
              </div>

              <div className="mt-2.5 flex items-baseline gap-2">
                <p className="text-sm font-semibold">{e.employee}</p>
                <span className="font-mono text-xs text-muted-foreground">
                  Conversación {e.conversationId}
                </span>
              </div>

              <p className="mt-2 text-sm text-foreground/90">{e.reason}</p>

              <div className="mt-3 flex items-center justify-between">
                <StatusPill status={e.status} />
                <span className="font-mono text-[11px] text-muted-foreground">
                  Desde {e.since}
                </span>
              </div>

              {e.status !== "resolved" && (
                <button
                  onClick={() => openChatwoot(e.conversationId)}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                >
                  Abrir en Chatwoot
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <ReadOnlyNote>
        La intervención humana ocurre en Chatwoot. Esta vista solo visualiza el
        estado y abre la conversación para que una persona atienda.
      </ReadOnlyNote>
    </div>
  )
}
