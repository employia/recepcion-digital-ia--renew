"use client"

import { Suspense, useCallback, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Loader2 } from "lucide-react"
import { HoverProvider } from "@/lib/store"
import { GlRecoveryWatcher } from "./gl-recovery-watcher"
import { Scene } from "./scene"

// Known software rasterizers (no real GPU behind WebGL): SwiftShader (Chrome's
// fallback when hardware acceleration is off), llvmpipe/Mesa (Linux software
// fallback), Microsoft Basic Render Driver (Windows fallback). On these,
// real-time shadow maps + ContactShadows + an Environment HDRI are enough
// sustained per-frame cost that the browser can decide the WebGL context is
// unresponsive and reset it — which looks exactly like objects vanishing and
// reappearing while hovering (the extra hover-driven work is what tips it
// over). GlRecoveryWatcher (below) recovers *after* that happens; this
// detects the condition up front and lowers render cost enough that the
// context shouldn't need recovering in the first place.
const SOFTWARE_RENDERER_PATTERNS = [
  "swiftshader",
  "llvmpipe",
  "software",
  "microsoft basic render",
  "mesa offscreen",
]

function isSoftwareRenderer(gl: WebGLRenderingContext | WebGL2RenderingContext) {
  const info = gl.getExtension("WEBGL_debug_renderer_info")
  if (!info) return false
  const renderer = String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL ?? gl.RENDERER)).toLowerCase()
  return SOFTWARE_RENDERER_PATTERNS.some((p) => renderer.includes(p))
}

export function OfficeView() {
  const [lowPower, setLowPower] = useState(false)

  const handleCreated = useCallback((state: { gl: { getContext: () => WebGLRenderingContext | WebGL2RenderingContext } }) => {
    if (isSoftwareRenderer(state.gl.getContext())) {
      console.warn("[office] Software WebGL renderer detected — dropping shadows/environment for stability")
      setLowPower(true)
    }
  }, [])

  // Fallback safety net: if the context is ever lost, downgrade regardless
  // of whether isSoftwareRenderer() caught it up front. setLowPower is
  // referentially stable (useState setter), so this never changes identity
  // and won't cause GlRecoveryWatcher to re-subscribe its listeners.
  const handleContextLost = useCallback(() => {
    setLowPower((prev) => {
      if (!prev) console.warn("[office] Context lost despite passing software-renderer check — downgrading anyway")
      return true
    })
  }, [])

  return (
    <div className="absolute inset-0">
      <HoverProvider>
        <Canvas
          // Shadows are toggled off entirely (not just per-mesh) once a
          // software renderer is detected — this disables the whole
          // shadow-map subsystem, not just individual light/mesh flags.
          shadows={!lowPower}
          onCreated={handleCreated}
          // The scene is fully static: no useFrame/animation exists anywhere
          // in this codebase. "always" (the default) re-renders every frame
          // forever for nothing. "demand" only renders when something
          // actually changes — OrbitControls invalidates on its own on
          // zoom, and R3F auto-invalidates whenever a prop it manages
          // changes (hover scale/color, tooltip show/hide, model load).
          frameloop="demand"
          // 1.5 instead of 2: on high-density (retina/4K) screens, dpr 2
          // roughly doubles pixel count vs 1.5 for a difference that isn't
          // perceptible at this isometric scale, while meaningfully cutting
          // fragment/shadow-pass cost — the main lever on constrained GPUs.
          // Software rendering gets an extra cut to 1, uncapped resolution.
          dpr={lowPower ? 1 : [1, 1.5]}
          orthographic
          // near/far tightened to the room's actual depth (camera is ~15 units
          // from center, room half-extent ~4.7). The previous -50..100 range
          // (150 units) starved the depth buffer of precision exactly where the
          // floor, rug and contact-shadow plane sit within 0.012 units of each
          // other (y=0 / 0.006 / 0.012), causing visible z-fighting flicker —
          // worse while zooming, since minZoom/maxZoom re-derives the frustum.
          camera={{ position: [9, 8.5, 9], zoom: 78, near: 1, far: 30 }}
          gl={{ antialias: !lowPower, preserveDrawingBuffer: false }}
        >
          <GlRecoveryWatcher onContextLost={handleContextLost} />
          <color attach="background" args={["#f2efe9"]} />
          <Suspense fallback={null}>
            <Scene lowPower={lowPower} />
          </Suspense>
          {/* Fixed isometric camera: rotation + pan locked, zoom only. */}
          <OrbitControls
            makeDefault
            enableRotate={false}
            enablePan={false}
            enableZoom
            minZoom={52}
            maxZoom={150}
            target={[0, 0.6, 0]}
          />
        </Canvas>
      </HoverProvider>
    </div>
  )
}

export function OfficeLoading() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <p className="font-mono text-xs uppercase tracking-widest">Entrando a la oficina</p>
      </div>
    </div>
  )
}
