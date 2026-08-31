"use client"

import { AppProvider, useApp } from "@/lib/store"
import { LoginScreen } from "@/components/auth/login-screen"
import { AppShell } from "@/components/shell/app-shell"

function Root() {
  const { session } = useApp()
  if (!session) return <LoginScreen />
  return <AppShell />
}

export default function Page() {
  return (
    <AppProvider>
      <Root />
    </AppProvider>
  )
}
