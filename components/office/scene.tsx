"use client"

import { ContactShadows, Environment } from "@react-three/drei"
import { EMPLOYEES } from "@/lib/mock-data"
import { EmployeeZone } from "./employee-zone"
import { Room } from "./room"

export function Scene({ lowPower = false }: { lowPower?: boolean }) {
  return (
    <group>
      {/* Warm key light from the window side */}
      <directionalLight
        position={[-6, 9, -4]}
        intensity={2.1}
        color="#fff3e0"
        // castShadow off in low-power mode: a real-time shadow map is one of
        // the three most expensive things in this scene (with ContactShadows
        // and Environment below) on a software rasterizer.
        castShadow={!lowPower}
        // 1024 instead of 2048: at this room scale and isometric distance
        // the extra resolution isn't visually distinguishable, but it's a
        // 4x reduction in shadow-map fill/fragment cost.
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-bias={-0.0004}
      />
      {/* Cool fill from the open side */}
      <directionalLight position={[6, 6, 6]} intensity={0.5} color="#eef2f6" />
      {/* Ambient/hemisphere bumped up in low-power mode to make up for the
          skipped Environment HDRI below — otherwise materials read flat. */}
      <ambientLight intensity={lowPower ? 0.85 : 0.55} />
      <hemisphereLight args={["#fbf7ee", "#cfc6b2", lowPower ? 0.85 : 0.6]} />

      <Room />

      {EMPLOYEES.map((emp, i) => (
        <EmployeeZone key={emp.id} employee={emp} index={i} />
      ))}

      {/* ContactShadows is a soft baked shadow under everyone's feet — on top
          of the real shadow map above, and one of the three costs cut in
          low-power mode. frames left at its default (re-bakes on every
          rendered frame, not "once"): with frameloop="demand" on the Canvas,
          rendered frames now only happen when something actually changes
          (each avatar's async GLB finishing load, hover, zoom) instead of at
          60fps forever — so this now naturally bakes once per real change
          and then goes idle, without going stale before every avatar has
          finished loading (a fixed frames=1 would bake before the last
          Suspense boundary resolves and then never update again). */}
      {!lowPower && (
        <ContactShadows
          position={[0, 0.012, 0]}
          opacity={0.32}
          scale={12}
          blur={2.4}
          far={4}
          resolution={512}
          color="#4a4436"
        />
      )}

      {/* Environment: fetches an HDRI from a third-party CDN and generates a
          PMREM (prefiltered mip-mapped radiance environment map) from it —
          real GPU + network cost, for reflections that are subtle at this
          scale. Skipped entirely in low-power mode; the ambient/hemisphere
          bump above covers most of the difference. */}
      {!lowPower && <Environment preset="apartment" environmentIntensity={0.35} />}
    </group>
  )
}
