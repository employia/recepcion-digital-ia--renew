"use client"

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
        // castShadow off in low-power mode: a real-time shadow map is the
        // single most expensive thing left in this scene now that
        // ContactShadows and Environment are gone entirely (see below).
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
      {/* Bumped up unconditionally now that Environment HDRI is gone in both
          modes (see removal note below) — otherwise materials read flat. */}
      <ambientLight intensity={0.85} />
      <hemisphereLight args={["#fbf7ee", "#cfc6b2", 0.85]} />

      <Room />

      {EMPLOYEES.map((emp, i) => (
        <EmployeeZone key={emp.id} employee={emp} index={i} />
      ))}

      {/* ContactShadows and Environment removed from BOTH modes (not just
          low-power) as of the Sept 2026 context-loss incident: on a GPU that
          can't sustain them, the browser doesn't just drop frames — it can
          kill and refuse to recreate the WebGL context entirely (Edge:
          "Web page caused context loss and was blocked"), which is a much
          worse failure than the avatars looking slightly flatter. The
          ambient/hemisphere bump below now applies unconditionally to cover
          the lost fill light. If reflections/contact shadows are wanted back
          later, they should return behind an opt-in "high quality" toggle
          the user enables explicitly, never as the default path. */}
    </group>
  )
}
