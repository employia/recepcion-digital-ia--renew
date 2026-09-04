"use client"

import { ContactShadows, Environment } from "@react-three/drei"
import { EMPLOYEES } from "@/lib/mock-data"
import { EmployeeZone } from "./employee-zone"
import { Room } from "./room"

export function Scene() {
  return (
    <group>
      {/* Warm key light from the window side */}
      <directionalLight
        position={[-6, 9, -4]}
        intensity={2.1}
        color="#fff3e0"
        castShadow
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
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#fbf7ee", "#cfc6b2", 0.6]} />

      <Room />

      {EMPLOYEES.map((emp, i) => (
        <EmployeeZone key={emp.id} employee={emp} index={i} />
      ))}

      {/* frames left at its default (re-bakes on every rendered frame, not
          "once"): with frameloop="demand" on the Canvas, rendered frames now
          only happen when something actually changes (each avatar's async
          GLB finishing load, hover, zoom) instead of at 60fps forever — so
          this now naturally bakes once per real change and then goes idle,
          without going stale before every avatar has finished loading (a
          fixed frames=1 would bake before the last Suspense boundary
          resolves and then never update again). */}
      <ContactShadows
        position={[0, 0.012, 0]}
        opacity={0.32}
        scale={12}
        blur={2.4}
        far={4}
        resolution={512}
        color="#4a4436"
      />

      <Environment preset="apartment" environmentIntensity={0.35} />
    </group>
  )
}
