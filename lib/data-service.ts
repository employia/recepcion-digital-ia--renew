// Data access layer.
// Today this returns realistic mock data. To connect real data later, swap the
// bodies of these functions for Supabase queries (read-only) without touching
// any UI component. Every function is scoped by branchId, matching the branch
// selector in the UI.

import {
  ALL_BRANCHES_ID,
  BRANCHES,
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
  MetricPoint,
  Patient,
} from "./types"

// Simulate a small async latency so the UI is built against an async contract,
// making the future swap to Supabase transparent.
function delay<T>(value: T, ms = 220): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

const isAll = (branchId: string) => branchId === ALL_BRANCHES_ID

// Combine list data from every branch into one flat array.
function everyBranch<T>(fn: (id: string) => T[]): T[] {
  return BRANCHES.flatMap((b) => fn(b.id))
}

// Merge metric trends by label, summing values across branches.
function mergeTrend(trends: MetricPoint[][]): MetricPoint[] {
  const map = new Map<string, number>()
  const order: string[] = []
  for (const trend of trends) {
    for (const point of trend) {
      if (!map.has(point.label)) order.push(point.label)
      map.set(point.label, (map.get(point.label) ?? 0) + point.value)
    }
  }
  return order.map((label) => ({ label, value: map.get(label)! }))
}

const sum = (nums: number[]) => nums.reduce((a, b) => a + b, 0)
const avg = (nums: number[]) => (nums.length ? sum(nums) / nums.length : 0)

// Aggregate metrics across every branch for the "Todas las sucursales" view.
function getCombinedMetrics(): BranchMetrics {
  const all = BRANCHES.map((b) => getMetrics(b.id))
  return {
    operation: {
      conversationsAttended: sum(all.map((m) => m.operation.conversationsAttended)),
      messagesProcessed: sum(all.map((m) => m.operation.messagesProcessed)),
      avgResponseSeconds: Math.round(avg(all.map((m) => m.operation.avgResponseSeconds))),
      conversationsResolved: sum(all.map((m) => m.operation.conversationsResolved)),
      escalations: sum(all.map((m) => m.operation.escalations)),
      trend: mergeTrend(all.map((m) => m.operation.trend)),
    },
    agenda: {
      created: sum(all.map((m) => m.agenda.created)),
      canceled: sum(all.map((m) => m.agenda.canceled)),
      rescheduled: sum(all.map((m) => m.agenda.rescheduled)),
      noShows: sum(all.map((m) => m.agenda.noShows)),
      trend: mergeTrend(all.map((m) => m.agenda.trend)),
    },
    business: {
      conversionRate: avg(all.map((m) => m.business.conversionRate)),
      newClients: sum(all.map((m) => m.business.newClients)),
      topServices: mergeTrend(all.map((m) => m.business.topServices)).sort(
        (a, b) => b.value - a.value,
      ),
    },
  }
}

export const dataService = {
  conversations: (branchId: string): Promise<Conversation[]> =>
    delay(isAll(branchId) ? everyBranch(getConversations) : getConversations(branchId)),
  appointments: (branchId: string): Promise<Appointment[]> =>
    delay(isAll(branchId) ? everyBranch(getAppointments) : getAppointments(branchId)),
  patients: (branchId: string): Promise<Patient[]> =>
    delay(isAll(branchId) ? everyBranch(getPatients) : getPatients(branchId)),
  escalations: (branchId: string): Promise<Escalation[]> =>
    delay(isAll(branchId) ? everyBranch(getEscalations) : getEscalations(branchId)),
  metrics: (branchId: string): Promise<BranchMetrics> =>
    delay(isAll(branchId) ? getCombinedMetrics() : getMetrics(branchId)),
}
