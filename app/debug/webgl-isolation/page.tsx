"use client"

// TEMPORARY diagnostic route — lives only on test/webgl-context-isolation.
// Does not touch AppProvider/login/AppShell; open directly, no session needed.
import dynamic from "next/dynamic"

const WebglIsolationTest = dynamic(
  () => import("@/components/debug/webgl-isolation-test").then((m) => m.WebglIsolationTest),
  { ssr: false, loading: () => null },
)

export default function WebglIsolationPage() {
  return <WebglIsolationTest />
}
