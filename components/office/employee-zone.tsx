"use client"

import { useState } from "react"
import { Html } from "@react-three/drei"
import type { ThreeEvent } from "@react-three/fiber"
import type { Employee } from "@/lib/types"
import { useApp } from "@/lib/store"
import { Person } from "./person"
import { Workstation } from "./workstation"

const HAIR_BY_ID: Record<string, string> = {
  valentina: "#8a5a3c",
  carlos: "#3a2b20",
  secretario: "#4a4a4a",
  supervisor: "#5a4230",
}

const TOP_BY_ID: Record<string, string> = {
  valentina: "#2f8f8a", // teal — matches reference avatar
  carlos: "#3c5a8a",
  secretario: "#4a4d55",
  supervisor: "#2c2d31",
}

export function EmployeeZone({ employee, index }: { employee: Employee; index: number }) {
  const { openModule, hoveredEmployee, setHoveredEmployee } = useApp()
  const [x, z] = employee.station
  // Orient the whole station so the seated employee faces the room center.
  const rotationY = Math.atan2(-x, -z)
  const active = hoveredEmployee === employee.id

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

      {/* Interactive hit target wrapping the person + chair */}
      <group
        onPointerOver={handleOver}
        onPointerOut={handleOut}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onClick={handleClick}
      >
        <Person
          color={TOP_BY_ID[employee.id]}
          hair={HAIR_BY_ID[employee.id]}
          active={active}
          phase={index * 1.7}
        />
        {/* invisible larger hitbox so hovering is forgiving */}
        <mesh position={[0, 0.7, 0.1]} visible={false}>
          <boxGeometry args={[0.7, 1.4, 0.9]} />
          <meshBasicMaterial />
        </mesh>
      </group>

      <Workstation accent={employee.accent} />

      {/* Floating label on hover — small, glassy, no large tooltip */}
      {active && (
        <Html position={[0, 1.55, 0.1]} center distanceFactor={7} zIndexRange={[20, 0]}>
          <div className="pointer-events-none -translate-y-2 select-none whitespace-nowrap rounded-xl border border-white/40 bg-white/80 px-3 py-1.5 text-center shadow-soft backdrop-blur-md">
            <div className="text-[13px] font-semibold leading-tight text-neutral-800">
              {employee.name}
            </div>
            <div className="text-[11px] leading-tight text-neutral-500">{employee.role}</div>
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
