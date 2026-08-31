"use client"

import useSWR from "swr"
import { dataService } from "./data-service"
import { useApp } from "./store"

// Auto-refresh roughly once a minute, per the blueprint's real-time guidance.
const REFRESH_MS = 60_000

export function useConversations() {
  const { branchId } = useApp()
  return useSWR(["conversations", branchId], () => dataService.conversations(branchId), {
    refreshInterval: REFRESH_MS,
    keepPreviousData: true,
  })
}

export function useAppointments() {
  const { branchId } = useApp()
  return useSWR(["appointments", branchId], () => dataService.appointments(branchId), {
    refreshInterval: REFRESH_MS,
    keepPreviousData: true,
  })
}

export function usePatients() {
  const { branchId } = useApp()
  return useSWR(["patients", branchId], () => dataService.patients(branchId), {
    refreshInterval: REFRESH_MS,
    keepPreviousData: true,
  })
}

export function useEscalations() {
  const { branchId } = useApp()
  return useSWR(["escalations", branchId], () => dataService.escalations(branchId), {
    refreshInterval: REFRESH_MS,
    keepPreviousData: true,
  })
}

export function useMetrics() {
  const { branchId } = useApp()
  return useSWR(["metrics", branchId], () => dataService.metrics(branchId), {
    refreshInterval: REFRESH_MS,
    keepPreviousData: true,
  })
}
