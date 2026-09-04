"use client"

import { useEffect } from "react"
import { useThree } from "@react-three/fiber"

export function GlRecoveryWatcher() {
  const gl = useThree((state) => state.gl)
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    const canvas = gl.domElement

    const handleContextLost = (event: Event) => {
      event.preventDefault()
      console.warn("[office] WebGL context lost")
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
  }, [gl, invalidate])

  return null
}
