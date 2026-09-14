"use client"

import { Suspense } from "react"
import type { ThreeEvent } from "@react-three/fiber"
import type { Employee } from "@/lib/types"
import { useApp } from "@/lib/store"
import { EmployeeModel } from "./person"
import { Workstation } from "./workstation"
import { AvatarErrorBoundary } from "./avatar-error-boundary"

/** Simple stand-in silhouette shown if an employee's GLB fails to load, so
 * the desk/hitbox still work and the rest of the office is unaffected. */
function AvatarFallback({ accent }: { accent: string }) {
  return (
    <group position={[0, 0, 0.15]}>
      <mesh position={[0, 0.95, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.75, 4, 12]} />
        <meshStandardMaterial color={accent} roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.55, 0]} castShadow>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color={accent} roughness={0.85} />
      </mesh>
    </group>
  )
}

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

/**
 * NOTE: this component used to have a full hover subsystem — hoveredEmployee
 * state, a floating <Html> name/role tooltip, a hitbox-forgiving hysteresis
 * timer, and a rug highlight — all removed on explicit request after
 * repeated flicker/canvas-gray-out regressions traced back to that hover
 * machinery (raycast contention, WebGL context loss under frameloop
 * "always", backdrop-filter under a rewritten transform, and permanent
 * per-frame DOM cost from an always-mounted tooltip — see git history on
 * this file and person.tsx for the full chronology). There is now
 * intentionally no hover state anywhere in this component: no
 * onPointerOver/onPointerOut, no useState/useEffect for it, no <Html>. The
 * only interaction is click -> open the employee's module. If hover
 * feedback is wanted again in the future, it needs a fresh, deliberately
 * conservative design (e.g. a static always-rendered indicator with no
 * per-frame DOM work), not a re-add of what was here before.
 */
export function EmployeeZone({ employee, index }: { employee: Employee; index: number }) {
  const { openModule } = useApp()
  const [x, z] = employee.station
  // Orient the whole station so the seated employee faces the room center.
  const rotationY = Math.atan2(-x, -z)
  const cfg = CONFIG_BY_ID[employee.id] ?? {
    targetHeight: 1.95,
    rotationY: 0,
    surface: [0, 0.74, 0.62] as [number, number, number],
  }

  function handleClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation()
    openModule(employee.module)
  }

  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      {/* Static zone rug, no hover-reactive material property. */}
      <mesh
        position={[0, 0.006, 0.45]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        raycast={() => null}
      >
        <circleGeometry args={[1.35, 40]} />
        <meshStandardMaterial color="#e2dbc9" roughness={0.95} transparent opacity={0.9} />
      </mesh>

      {/* The avatar is purely visual: no pointer handlers anywhere on it or
          on its wrapping group. Interaction is owned entirely by the
          invisible hitbox mesh below. */}
      <group>
        <AvatarErrorBoundary employeeId={employee.id} fallback={<AvatarFallback accent={employee.accent} />}>
          <Suspense fallback={null}>
            <EmployeeModel model={employee.model} targetHeight={cfg.targetHeight} rotationY={cfg.rotationY} />
          </Suspense>
        </AvatarErrorBoundary>
      </group>

      {/* Sole owner of interaction: an independent group whose only child is
          the fixed-size invisible hitbox mesh. Click only — no hover
          handlers of any kind. */}
      <group onClick={handleClick}>
        <mesh position={[0, 0.9, 0.2]} visible={false}>
          <boxGeometry args={[1.6, 1.9, 1.6]} />
          <meshBasicMaterial />
        </mesh>
      </group>

      <Workstation accent={employee.accent} surface={cfg.surface} />
    </group>
  )
}
