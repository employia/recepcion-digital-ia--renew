import type {
  Appointment,
  Branch,
  BranchMetrics,
  Conversation,
  Employee,
  Escalation,
  Patient,
} from "./types"

export const BRANCHES: Branch[] = [
  { id: "alma-rosa-1", name: "Alma Rosa 1", label: "Renew · Alma Rosa 1" },
  { id: "san-isidro", name: "San Isidro", label: "Renew · San Isidro" },
  { id: "naco", name: "Naco", label: "Renew · Naco" },
]

export const EMPLOYEES: Employee[] = [
  {
    id: "valentina",
    name: "Valentina",
    role: "Recepción",
    module: "conversations",
    station: [-2.6, -2.2],
    rotation: Math.PI * 0.25,
    accent: "oklch(0.62 0.09 200)",
  },
  {
    id: "carlos",
    name: "Carlos",
    role: "Agenda",
    module: "agenda",
    station: [2.6, -2.2],
    rotation: -Math.PI * 0.25,
    accent: "oklch(0.6 0.1 150)",
  },
  {
    id: "secretario",
    name: "Secretario",
    role: "Secretaría · Datos",
    module: "patients",
    station: [-2.6, 2.2],
    rotation: Math.PI * 0.75,
    accent: "oklch(0.58 0.08 60)",
  },
  {
    id: "supervisor",
    name: "Supervisor",
    role: "Supervisión",
    module: "escalations",
    station: [2.6, 2.2],
    rotation: -Math.PI * 0.75,
    accent: "oklch(0.6 0.12 30)",
  },
]

// --- Deterministic mock generators keyed per branch ---------------------------

const PATIENT_NAMES = [
  "María Rodríguez",
  "Juan Pérez",
  "Laura Gómez",
  "Carlos Martínez",
  "Ana Fernández",
  "Pedro Sánchez",
  "Lucía Ramírez",
  "Diego Torres",
  "Sofía Herrera",
  "Miguel Castillo",
  "Valeria Núñez",
  "Andrés Díaz",
  "Camila Reyes",
  "José Peña",
  "Isabella Cruz",
]

const SERVICES = [
  "Fisioterapia",
  "Rehabilitación",
  "Masaje terapéutico",
  "Evaluación postural",
  "Terapia deportiva",
  "Punción seca",
]

const INTENTS = [
  "Agendar cita",
  "Información sobre servicio",
  "Hablar con una persona",
  "Reprogramar cita",
  "Consultar horario",
  "Precios y cobertura",
]

function seeded(branchId: string) {
  let h = 0
  for (let i = 0; i < branchId.length; i++) h = (h * 31 + branchId.charCodeAt(i)) >>> 0
  return function next() {
    h = (h * 1103515245 + 12345) & 0x7fffffff
    return h / 0x7fffffff
  }
}

function pick<T>(arr: T[], r: number) {
  return arr[Math.floor(r * arr.length) % arr.length]
}

function timeString(hour: number, minute: number) {
  const period = hour >= 12 ? "PM" : "AM"
  const h12 = hour % 12 === 0 ? 12 : hour % 12
  return `${h12}:${minute.toString().padStart(2, "0")} ${period}`
}

export function getConversations(branchId: string): Conversation[] {
  const rand = seeded(branchId + "conv")
  const statuses: Conversation["status"][] = [
    "attending",
    "resolved",
    "waiting-human",
    "attending",
    "resolved",
  ]
  const count = 6 + Math.floor(rand() * 4)
  return Array.from({ length: count }).map((_, i) => {
    const hour = 9 + Math.floor(rand() * 4)
    const minute = Math.floor(rand() * 60)
    return {
      id: `${branchId}-conv-${i}`,
      branchId,
      patientName: pick(PATIENT_NAMES, rand()),
      messages: 4 + Math.floor(rand() * 18),
      status: pick(statuses, rand()),
      time: timeString(hour, minute),
      intent: pick(INTENTS, rand()),
    }
  })
}

export function getAppointments(branchId: string): Appointment[] {
  const rand = seeded(branchId + "appt")
  const branch = BRANCHES.find((b) => b.id === branchId)!
  const days = ["29 agosto", "30 agosto", "31 agosto", "1 septiembre", "2 septiembre"]
  const count = 7 + Math.floor(rand() * 4)
  return Array.from({ length: count }).map((_, i) => {
    const hour = 8 + Math.floor(rand() * 9)
    const minute = pick([0, 15, 30, 45], rand())
    return {
      id: `${branchId}-appt-${i}`,
      branchId,
      patientName: pick(PATIENT_NAMES, rand()),
      branchLabel: branch.name,
      service: pick(SERVICES, rand()),
      date: pick(days, rand()),
      time: timeString(hour, minute as number),
    }
  })
}

export function getPatients(branchId: string): Patient[] {
  const rand = seeded(branchId + "pat")
  return PATIENT_NAMES.map((name, i) => ({
    id: `${branchId}-pat-${i}`,
    branchId,
    name,
    appointments: 1 + Math.floor(rand() * 12),
    conversations: 2 + Math.floor(rand() * 20),
    lastInteraction: pick(["Hoy · 10:42 AM", "Hoy · 9:15 AM", "Ayer · 4:30 PM", "Ayer · 11:20 AM"], rand()),
    service: pick(SERVICES, rand()),
    phone: `+1 809 ${100 + Math.floor(rand() * 899)} ${1000 + Math.floor(rand() * 8999)}`,
  }))
}

export function getEscalations(branchId: string): Escalation[] {
  const rand = seeded(branchId + "esc")
  const statuses: Escalation["status"][] = ["waiting-human", "human-attending", "resolved"]
  const reasons = [
    "Paciente solicita hablar con una persona.",
    "Consulta fuera del alcance del asistente.",
    "Reclamo sobre una cita previa.",
    "Solicitud de información médica específica.",
  ]
  const count = 3 + Math.floor(rand() * 3)
  return Array.from({ length: count }).map((_, i) => {
    const hour = 9 + Math.floor(rand() * 4)
    const minute = Math.floor(rand() * 60)
    return {
      id: `${branchId}-esc-${i}`,
      branchId,
      conversationId: `#${2800 + Math.floor(rand() * 200)}`,
      employee: "Valentina",
      reason: pick(reasons, rand()),
      status: pick(statuses, rand()),
      since: timeString(hour, minute),
      priority: pick(["Alta", "Media", "Baja"] as const, rand()),
    }
  })
}

export function getMetrics(branchId: string): BranchMetrics {
  const rand = seeded(branchId + "met")
  const hours = ["8", "9", "10", "11", "12", "13", "14", "15", "16", "17"]
  const opTrend = hours.map((label) => ({ label, value: 4 + Math.floor(rand() * 22) }))
  const agendaTrend = ["L", "M", "M", "J", "V", "S"].map((label) => ({
    label,
    value: 3 + Math.floor(rand() * 14),
  }))
  const topServices = SERVICES.slice(0, 5)
    .map((label) => ({ label, value: 8 + Math.floor(rand() * 40) }))
    .sort((a, b) => b.value - a.value)

  const conversationsAttended = opTrend.reduce((s, p) => s + p.value, 0)
  return {
    operation: {
      conversationsAttended,
      messagesProcessed: conversationsAttended * (6 + Math.floor(rand() * 6)),
      avgResponseSeconds: 8 + Math.floor(rand() * 20),
      conversationsResolved: Math.floor(conversationsAttended * (0.6 + rand() * 0.25)),
      escalations: 2 + Math.floor(rand() * 6),
      trend: opTrend,
    },
    agenda: {
      created: agendaTrend.reduce((s, p) => s + p.value, 0),
      canceled: 2 + Math.floor(rand() * 8),
      rescheduled: 1 + Math.floor(rand() * 6),
      noShows: 1 + Math.floor(rand() * 5),
      trend: agendaTrend,
    },
    business: {
      conversionRate: 0.32 + rand() * 0.28,
      newClients: 6 + Math.floor(rand() * 20),
      topServices,
    },
  }
}
