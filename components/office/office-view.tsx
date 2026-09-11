"use client"

import { Suspense, useCallback, useEffect, useRef, useState } from "react"
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
  // Default changed from false to true (Sept 2026): starting in "high
  // quality" and downgrading on detection assumes the first frame survives
  // long enough for onCreated to fire. On a GPU too weak for shadows +
  // ContactShadows + Environment, the browser can instead kill context
  // creation outright and then refuse to recreate it ("Web page caused
  // context loss and was blocked") — onCreated never runs, so the downgrade
  // never happens. Starting cheap and never needing to downgrade is safer
  // than starting expensive and hoping to catch the failure in time.
  // Not state: nothing in this component escalates quality back up, so
  // there's no setter to call. Kept as a named constant (not inlined below)
  // so every prop that reads it below stays self-documenting about why.
  const lowPower = true
  // Set once the browser definitively refuses to (re)create a WebGL context
  // for this canvas — distinct from lowPower, which just means "render
  // cheaply." This means "don't render 3D here at all."
  const [contextUnavailable, setContextUnavailable] = useState(false)

  // frameloop is "demand" by default (see the Canvas prop below for why:
  // static scene, no wasted frames, saves battery/CPU on real GPUs). But on
  // a software rasterizer (SwiftShader/llvmpipe/Mesa), "demand" is itself
  // implicated in the hover-triggered context loss reported after the
  // hitbox/raycast fix (6cec48a) already ruled out every render-cost and
  // React-state path: with no frames being requested while the cursor sits
  // idle, the browser can treat that GL context as inactive and let the
  // (already CPU-bound, no hardware isolation) software backend reclaim it;
  // hover is simply the first `invalidate()` after that idle stretch, so it
  // looks like "hovering causes the crash" when the real trigger is
  // resuming a context the browser already let go dormant. Confirmed
  // against this exact machine: the "[office] Software WebGL renderer
  // detected" log below DOES fire here, and DevTools reports the same
  // software/no-hardware-acceleration GPU status as previously diagnosed —
  // this isn't a new, different failure mode. Switching to "always" only on
  // that detected path keeps a steady trickle of frames so the context
  // never goes idle long enough to be reclaimed, removing the idle→wake
  // transition entirely instead of reacting to it after the fact. Real
  // (hardware-accelerated) GPUs are untouched and keep "demand".
  const [frameloop, setFrameloop] = useState<"demand" | "always">("demand")

  const handleCreated = useCallback((state: { gl: { getContext: () => WebGLRenderingContext | WebGL2RenderingContext } }) => {
    if (isSoftwareRenderer(state.gl.getContext())) {
      console.warn("[office] Software WebGL renderer detected — forcing frameloop='always' to avoid idle-context reclaim on hover")
      setFrameloop("always")
    }
  }, [])

  // Belt-and-suspenders even with lowPower now defaulting to true: a context
  // loss can still happen (OS-level GPU reset, tab backgrounding on some
  // browsers, etc). recentLossesRef is a plain ref, not state — it doesn't
  // need to trigger a render itself, only feed the decision inside the
  // handler, so putting it in state would just be extra re-renders.
  const recentLossesRef = useRef<number[]>([])
  const handleContextLost = useCallback(() => {
    const now = Date.now()
    const recent = recentLossesRef.current.filter((t) => now - t < 10000)
    recent.push(now)
    recentLossesRef.current = recent
    console.warn(`[office] Context lost (${recent.length} time(s) in the last 10s)`)
    // 3+ losses in 10s is the pattern that makes Chrome/Edge itself stop
    // granting new contexts ("Web page caused context loss and was
    // blocked"). Once we see it, stop asking: unmounting the Canvas is a
    // choice we make on purpose, instead of the browser making it for us
    // mid-render and leaving a dead/errored canvas on screen.
    if (recent.length >= 3) {
      setContextUnavailable(true)
    }
  }, [])

  // Covers the case from the Sept 2026 Edge log, distinct from
  // handleContextLost above: when the browser refuses outright to (re)create
  // a context ("Web page caused context loss and was blocked"), THREE throws
  // inside its own async setup, outside React's render cycle — it surfaces
  // as an unhandled promise rejection, not a `webglcontextlost` DOM event on
  // our canvas, and no React error boundary catches it either. This is the
  // narrowest hook available for that specific failure.
  useEffect(() => {
    function handleRejection(event: PromiseRejectionEvent) {
      const message = String(event.reason?.message ?? event.reason ?? "")
      if (message.includes("WebGL context") || message.includes("WebGLRenderer")) {
        console.warn("[office] Unrecoverable WebGL context creation failure:", message)
        setContextUnavailable(true)
      }
    }
    window.addEventListener("unhandledrejection", handleRejection)
    return () => window.removeEventListener("unhandledrejection", handleRejection)
  }, [])

  if (contextUnavailable) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-background">
        <div className="flex max-w-xs flex-col items-center gap-2 text-center text-muted-foreground">
          <p className="text-sm font-medium text-foreground">La oficina 3D no cargó en este dispositivo</p>
          <p className="text-xs">
            El navegador bloqueó la creación del contexto gráfico tras varios intentos fallidos. Recargar la página
            a veces lo resuelve; si persiste, es este equipo/navegador el que no lo soporta.
          </p>
        </div>
      </div>
    )
  }

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
          // in this codebase. "always" (the default R3F behavior) re-renders
          // every frame forever for nothing on hardware-accelerated GPUs, so
          // "demand" is the right default — it only renders when something
          // actually changes (OrbitControls invalidates on its own on zoom,
          // R3F auto-invalidates whenever a prop it manages changes: hover
          // scale/color, tooltip show/hide, model load). handleCreated above
          // flips this to "always" specifically when a software renderer is
          // detected, to prevent the idle-context-reclaim failure described
          // there — hardware GPUs are unaffected and keep "demand".
          frameloop={frameloop}
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
