"use client"

import { useEffect } from "react"
import { useThree } from "@react-three/fiber"

export function GlRecoveryWatcher({ onContextLost }: { onContextLost?: () => void }) {
  const gl = useThree((state) => state.gl)
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    const canvas = gl.domElement

    const handleContextLost = (event: Event) => {
      event.preventDefault()
      console.warn("[office] WebGL context lost")
      // Belt-and-suspenders: a lost context is proof the current render cost
      // is too high for this GPU, regardless of whether the upfront
      // isSoftwareRenderer() check in office-view.tsx caught it (it may not,
      // e.g. when WEBGL_debug_renderer_info is unavailable or the renderer
      // string doesn't match our known patterns). Without this, a failed
      // detection means no fallback ever engages and the tab loses/restores
      // context repeatedly under identical load.
      onContextLost?.()
    }

    const handleContextRestored = () => {
      console.warn("[office] WebGL context restored")
      invalidate()
    }

    canvas.addEventListener("webglcontextlost", handleContextLost)
    canvas.addEventListener("webglcontextrestored", handleContextRestored)

    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost)
      canvas.removeEventListener("webglcontextrestored", handleContextRestored)
    }
  }, [gl, invalidate, onContextLost])

  return null
}
