"use client"

import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Loader2 } from "lucide-react"
import { Scene } from "./scene"

export function OfficeView() {
  return (
    <div className="absolute inset-0">
      <Canvas
        shadows
        dpr={[1, 2]}
        orthographic
        // near/far tightened to the room's actual depth (camera is ~15 units
        // from center, room half-extent ~4.7). The previous -50..100 range
        // (150 units) starved the depth buffer of precision exactly where the
        // floor, rug and contact-shadow plane sit within 0.012 units of each
        // other (y=0 / 0.006 / 0.012), causing visible z-fighting flicker —
        // worse while zooming, since minZoom/maxZoom re-derives the frustum.
        camera={{ position: [9, 8.5, 9], zoom: 78, near: 1, far: 30 }}
        gl={{ antialias: true, preserveDrawingBuffer: false }}
      >
        <color attach="background" args={["#f2efe9"]} />
        <Suspense fallback={null}>
          <Scene />
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
