// Domain types for Recepción Digital IA · Renew
// Read-only visualization layer. No mutations anywhere in the app.

export type ModuleId =
  | "office"
  | "conversations"
  | "agenda"
  | "patients"
  | "metrics"
  | "escalations"
  | "account"

export type EmployeeId = "valentina" | "carlos" | "secretario" | "supervisor"

export interface Employee {
  id: EmployeeId
  name: string
  role: string
  module: ModuleId
  // Position of the workstation in the 3D office (x, z on the floor plane)
  station: [number, number]
  // Rotation of the person/desk in radians around Y
  rotation: number
  accent: string
}

export interface Branch {
  id: string
  name: string
  label: string
}

export type ConversationStatus =
  | "attending" // Valentina atendiendo
  | "resolved" // Conversación resuelta
  | "waiting-human" // Esperando humano

export interface Conversation {
  id: string
  branchId: string
  patientName: string
  messages: number
  status: ConversationStatus
  time: string
  intent: string
}

export interface Appointment {
  id: string
  branchId: string
  patientName: string
  branchLabel: string
  service: string
  date: string
  time: string
}

export interface Patient {
  id: string
  branchId: string
  name: string
  appointments: number
  conversations: number
  lastInteraction: string
  service: string
  phone: string
}

export type EscalationStatus = "waiting-human" | "human-attending" | "resolved"

export interface Escalation {
  id: string
  branchId: string
  conversationId: string
  employee: string
  reason: string
  status: EscalationStatus
  since: string
  priority: "Alta" | "Media" | "Baja"
}

export interface MetricPoint {
  label: string
  value: number
}

export interface BranchMetrics {
  operation: {
    conversationsAttended: number
    messagesProcessed: number
    avgResponseSeconds: number
    conversationsResolved: number
    escalations: number
    trend: MetricPoint[]
  }
  agenda: {
    created: number
    canceled: number
    rescheduled: number
    noShows: number
    trend: MetricPoint[]
  }
  business: {
    conversionRate: number
    newClients: number
    topServices: MetricPoint[]
  }
}
