"use client"

import { ContactShadows, Environment, SoftShadows } from "@react-three/drei"
import { EMPLOYEES } from "@/lib/mock-data"
import { EmployeeZone } from "./employee-zone"
import { Room } from "./room"

export function Scene() {
  return (
    <group>
      <SoftShadows size={26} samples={12} focus={0.7} />

      {/* Warm key light from the window side */}
      <directionalLight
        position={[-6, 9, -4]}
        intensity={2.1}
        color="#fff3e0"
        castShadow
        shadow-mapSize={[2048, 2048]}
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

      <ContactShadows
        position={[0, 0.012, 0]}
        opacity={0.32}
        scale={12}
        blur={2.4}
        far={4}
        resolution={1024}
        color="#4a4436"
      />

      <Environment preset="apartment" environmentIntensity={0.35} />
    </group>
  )
}
