"use client"

/**
 * DIAGNOSTIC-ONLY component. Lives on the `test/webgl-context-isolation`
 * branch to answer exactly one question: does a WebGL context lose itself
 * on hover even with the entire Oficina IA scene removed?
 *
 * Deliberately self-contained — does NOT import anything from
 * components/office/* (no GlRecoveryWatcher, no HoverProvider, no
 * production recovery/threshold logic). Nothing here is meant to be
 * merged into main as-is; it exists to isolate the cause, not to fix it.
 *
 * Scene contents, on purpose:
 *   - one <Canvas>
 *   - one basic PerspectiveCamera (R3F default, no OrbitControls)
 *   - one <mesh><boxGeometry/></mesh> with a basic material
 *   - one ambient light + one directional light
 *   - frameloop="always", dpr={1}, antialias off
 *   - onPointerOver/Out on the cube itself (plain R3F raycasting, no
 *     custom hitbox, no hysteresis) so hovering it is the only interaction
 *     available — mirrors "hovering an interactive 3D object" without any
 *     of the office's supporting architecture
 *
 * Explicitly excluded: avatars, GLTF/SkeletonUtils, EmployeeZone, custom
 * raycast overrides, OrbitControls, <Html>, postprocessing, shadows,
 * ContactShadows, Environment, textures, external models, animations.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { Canvas, type ThreeEvent } from "@react-three/fiber"

type WebglStatus = "ok" | "lost" | "restored"

interface RendererInfo {
  vendor: string
  renderer: string
  version: string
  unmaskedVendor: string | null
  unmaskedRenderer: string | null
}

function readRendererInfo(gl: WebGLRenderingContext | WebGL2RenderingContext): RendererInfo {
  const debugInfo = gl.getExtension("WEBGL_debug_renderer_info")
  return {
    vendor: String(gl.getParameter(gl.VENDOR)),
    renderer: String(gl.getParameter(gl.RENDERER)),
    version: String(gl.getParameter(gl.VERSION)),
    unmaskedVendor: debugInfo ? String(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)) : null,
    unmaskedRenderer: debugInfo ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)) : null,
  }
}

/** Plain, uninteractive cube. Hovering it is the only thing this scene lets
 * you do — no custom hitbox, no separate hover state, no hysteresis. Just
 * R3F's default onPointerOver/onPointerOut straight off the mesh. */
function TestCube() {
  const [hovered, setHovered] = useState(false)
  return (
    <mesh
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        setHovered(false)
      }}
    >
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color={hovered ? "#ff6b6b" : "#4a90d9"} />
    </mesh>
  )
}

export function WebglIsolationTest() {
  const [status, setStatus] = useState<WebglStatus>("ok")
  const [rendererInfo, setRendererInfo] = useState<RendererInfo | null>(null)
  const [lossCount, setLossCount] = useState(0)
  const canvasElRef = useRef<HTMLCanvasElement | null>(null)

  const handleCreated = useCallback((state: { gl: { getContext: () => WebGLRenderingContext | WebGL2RenderingContext; domElement: HTMLCanvasElement } }) => {
    const gl = state.gl.getContext()
    const info = readRendererInfo(gl)
    setRendererInfo(info)
    // eslint-disable-next-line no-console
    console.log("[webgl-isolation-test] renderer info", info)

    const canvas = state.gl.domElement
    canvasElRef.current = canvas

    const onLost = (event: Event) => {
      event.preventDefault()
      setStatus("lost")
      setLossCount((n) => n + 1)
      // eslint-disable-next-line no-console
      console.warn("[webgl-isolation-test] WEBGL CONTEXT LOST", { time: Date.now() })
    }
    const onRestored = () => {
      setStatus("restored")
      // eslint-disable-next-line no-console
      console.warn("[webgl-isolation-test] WEBGL CONTEXT RESTORED", { time: Date.now() })
    }

    canvas.addEventListener("webglcontextlost", onLost)
    canvas.addEventListener("webglcontextrestored", onRestored)
  }, [])

  // Cleanup on unmount (dev/HMR safety only — not relevant to the test itself).
  useEffect(() => {
    return () => {
      const canvas = canvasElRef.current
      if (!canvas) return
      canvas.replaceWith(canvas.cloneNode(true)) // drop listeners without needing the original handler refs
    }
  }, [])

  const statusLabel =
    status === "ok" ? "WebGL: OK" : status === "lost" ? "WebGL: CONTEXT LOST" : "WebGL: RESTORED"
  const statusColor = status === "ok" ? "#2e7d32" : status === "lost" ? "#c62828" : "#f9a825"

  return (
    <div style={{ position: "fixed", inset: 0, background: "#111" }}>
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 10,
          fontFamily: "monospace",
          fontSize: 14,
          lineHeight: 1.5,
          color: "#fff",
          background: "rgba(0,0,0,0.65)",
          padding: "12px 16px",
          borderRadius: 8,
          pointerEvents: "none",
          maxWidth: 480,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700, color: statusColor }}>{statusLabel}</div>
        <div style={{ marginTop: 4, opacity: 0.85 }}>Pérdidas de contexto detectadas: {lossCount}</div>
        <div style={{ marginTop: 8, opacity: 0.85 }}>
          Pasa el cursor sobre el cubo repetidamente. Nada más en esta página
          hace nada — sin avatares, sin GLTF, sin hitbox custom, sin
          OrbitControls.
        </div>
        {rendererInfo && (
          <div style={{ marginTop: 8, opacity: 0.7 }}>
            <div>vendor: {rendererInfo.vendor}</div>
            <div>renderer: {rendererInfo.renderer}</div>
            <div>version: {rendererInfo.version}</div>
            <div>unmasked vendor: {rendererInfo.unmaskedVendor ?? "(no disponible)"}</div>
            <div>unmasked renderer: {rendererInfo.unmaskedRenderer ?? "(no disponible)"}</div>
          </div>
        )}
      </div>

      <Canvas
        frameloop="always"
        dpr={1}
        gl={{ antialias: false }}
        onCreated={handleCreated}
        camera={{ position: [3, 2, 4], fov: 50 }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 5, 3]} intensity={1} />
        <TestCube />
      </Canvas>
    </div>
  )
}
