// Data access layer.
// Today this returns realistic mock data. To connect real data later, swap the
// bodies of these functions for Supabase queries (read-only) without touching
// any UI component. Every function is scoped by branchId, matching the branch
// selector in the UI.

import {
  getAppointments,
  getConversations,
  getEscalations,
  getMetrics,
  getPatients,
} from "./mock-data"
import type {
  Appointment,
  BranchMetrics,
  Conversation,
  Escalation,
  Patient,
} from "./types"

// Simulate a small async latency so the UI is built against an async contract,
// making the future swap to Supabase transparent.
function delay<T>(value: T, ms = 220): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export const dataService = {
  conversations: (branchId: string): Promise<Conversation[]> =>
    delay(getConversations(branchId)),
  appointments: (branchId: string): Promise<Appointment[]> =>
    delay(getAppointments(branchId)),
  patients: (branchId: string): Promise<Patient[]> => delay(getPatients(branchId)),
  escalations: (branchId: string): Promise<Escalation[]> =>
    delay(getEscalations(branchId)),
  metrics: (branchId: string): Promise<BranchMetrics> => delay(getMetrics(branchId)),
}
