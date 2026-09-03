"use client"

import { Suspense, useState } from "react"
import { Html } from "@react-three/drei"
import type { ThreeEvent } from "@react-three/fiber"
import type { Employee } from "@/lib/types"
import { useApp } from "@/lib/store"
import { EmployeeModel } from "./person"
import { Workstation } from "./workstation"

// Per-model tuning. Each fused GLB has a different original scale, pivot and
// facing, so we tune height / rotation and where its desk surface sits (for
// placing the monitor, keyboard, mouse and documents on top of it).
interface ModelConfig {
  targetHeight: number
  rotationY: number
  surface: [number, number, number]
}

// Surfaces tuned against each model's real (normalized) bounding box: all four
// are ~1.95 tall with desk depth 1.11–1.29, so the desk-top sits near y≈0.75
// and the usable front area is pulled toward +z proportional to each depth.
const CONFIG_BY_ID: Record<string, ModelConfig> = {
  valentina: { targetHeight: 1.95, rotationY: 0, surface: [0, 0.75, 0.42] },
  carlos: { targetHeight: 1.95, rotationY: 0, surface: [0, 0.75, 0.4] },
  elena: { targetHeight: 1.95, rotationY: 0, surface: [0, 0.75, 0.41] },
  steven: { targetHeight: 1.95, rotationY: 0, surface: [0, 0.75, 0.47] },
}

const STATUS_META = {
  working: { color: "#3fb950", label: "Trabajando" },
  resting: { color: "#b7b1a3", label: "Descansando" },
} as const

export function EmployeeZone({ employee, index }: { employee: Employee; index: number }) {
  const { openModule, hoveredEmployee, setHoveredEmployee } = useApp()
  const [x, z] = employee.station
  // Orient the whole station so the seated employee faces the room center.
  const rotationY = Math.atan2(-x, -z)
  const active = hoveredEmployee === employee.id
  const cfg = CONFIG_BY_ID[employee.id] ?? {
    targetHeight: 1.95,
    rotationY: 0,
    surface: [0, 0.74, 0.62] as [number, number, number],
  }
  const status = STATUS_META[employee.status]

  const [pressed, setPressed] = useState(false)

  function handleOver(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation()
    setHoveredEmployee(employee.id)
    document.body.style.cursor = "pointer"
  }
  function handleOut(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation()
    setHoveredEmployee(null)
    document.body.style.cursor = "default"
  }
  function handleClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation()
    openModule(employee.module)
  }

  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      {/* Soft zone rug to ground each workstation */}
      <mesh position={[0, 0.006, 0.45]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.35, 40]} />
        <meshStandardMaterial
          color={active ? "#e9e2d2" : "#e2dbc9"}
          roughness={0.95}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Interactive hit target wrapping the fused model */}
      <group
        onPointerOver={handleOver}
        onPointerOut={handleOut}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onClick={handleClick}
      >
        <Suspense fallback={null}>
          <EmployeeModel
            model={employee.model}
            targetHeight={cfg.targetHeight}
            rotationY={cfg.rotationY}
            active={active}
          />
        </Suspense>
        {/* invisible larger hitbox so hovering is forgiving */}
        <mesh position={[0, 0.9, 0.2]} visible={false}>
          <boxGeometry args={[1.6, 1.9, 1.6]} />
          <meshBasicMaterial />
        </mesh>
      </group>

      <Workstation accent={employee.accent} surface={cfg.surface} />

      {/* Discreet presence indicator floating above the avatar */}
      <mesh position={[0, 2.05, 0]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial
          color={status.color}
          emissive={status.color}
          emissiveIntensity={employee.status === "working" ? 0.6 : 0.15}
          roughness={0.4}
        />
      </mesh>

      {/* Floating label on hover — small, glassy, no large tooltip */}
      {active && (
        <Html position={[0, 2.25, 0]} center distanceFactor={7} zIndexRange={[20, 0]}>
          <div className="pointer-events-none -translate-y-2 select-none whitespace-nowrap rounded-xl border border-white/40 bg-white/80 px-3 py-1.5 text-center shadow-soft backdrop-blur-md">
            <div className="text-[13px] font-semibold leading-tight text-neutral-800">
              {employee.name}
            </div>
            <div className="text-[11px] leading-tight text-neutral-500">{employee.role}</div>
            <div className="mt-1 flex items-center justify-center gap-1.5">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: status.color }}
                aria-hidden
              />
              <span className="text-[10px] font-medium leading-tight text-neutral-600">
                {status.label}
              </span>
            </div>
          </div>
        </Html>
      )}

      {/* subtle press feedback ring */}
      {pressed && (
        <mesh position={[0, 0.02, 0.45]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.3, 1.4, 48]} />
          <meshBasicMaterial color={employee.accent} transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  )
}
