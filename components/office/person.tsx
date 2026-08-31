"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group } from "three"

interface PersonProps {
  /** Main clothing color (top). */
  color: string
  /** Hair color. */
  hair?: string
  /** Skin tone. */
  skin?: string
  /** Whether this employee is currently highlighted. */
  active?: boolean
  /** Animation phase offset so employees are not perfectly in sync. */
  phase?: number
}

const SKIN = "#e7c1a0"
const HAIR = "#6b4a34"

/**
 * A stylized, adult, seated office worker built from primitives.
 * Minimal ambient animation only: occasional typing + slight postural sway.
 * The figure never leaves the chair.
 */
export function Person({ color, hair = HAIR, skin = SKIN, active = false, phase = 0 }: PersonProps) {
  const root = useRef<Group>(null)
  const torso = useRef<Group>(null)
  const leftForearm = useRef<Group>(null)
  const rightForearm = useRef<Group>(null)
  const head = useRef<Group>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + phase
    // gentle breathing / postural sway
    if (torso.current) {
      torso.current.rotation.x = Math.sin(t * 0.8) * 0.015
      torso.current.position.y = Math.sin(t * 0.8) * 0.004
    }
    // typing: alternating forearm bob, active in bursts
    const burst = (Math.sin(t * 0.35) + 1) / 2 // 0..1 slow envelope
    const typeAmp = 0.06 + burst * 0.06
    if (leftForearm.current) {
      leftForearm.current.rotation.x = -1.15 + Math.sin(t * 9) * typeAmp
    }
    if (rightForearm.current) {
      rightForearm.current.rotation.x = -1.15 + Math.sin(t * 9 + Math.PI) * typeAmp
    }
    // subtle head glances
    if (head.current) {
      head.current.rotation.y = Math.sin(t * 0.5) * 0.12
      head.current.rotation.x = Math.sin(t * 0.7) * 0.04
    }
  })

  const emissive = active ? color : "#000000"
  const emissiveIntensity = active ? 0.28 : 0

  return (
    <group ref={root} scale={active ? 1.015 : 1}>
      {/* Hips */}
      <mesh position={[0, 0.5, 0.02]} castShadow>
        <boxGeometry args={[0.34, 0.18, 0.28]} />
        <meshStandardMaterial color="#2f3033" roughness={0.85} />
      </mesh>

      {/* Torso (leaning slightly forward toward the desk) */}
      <group ref={torso} position={[0, 0.58, 0.02]}>
        <mesh position={[0, 0.16, 0.01]} rotation={[0.12, 0, 0]} castShadow>
          <boxGeometry args={[0.34, 0.38, 0.24]} />
          <meshStandardMaterial
            color={color}
            roughness={0.7}
            emissive={emissive}
            emissiveIntensity={emissiveIntensity}
          />
        </mesh>
        {/* Shoulders */}
        <mesh position={[0, 0.33, 0.02]} rotation={[0.12, 0, 0]} castShadow>
          <boxGeometry args={[0.4, 0.12, 0.24]} />
          <meshStandardMaterial
            color={color}
            roughness={0.7}
            emissive={emissive}
            emissiveIntensity={emissiveIntensity}
          />
        </mesh>

        {/* Neck + head */}
        <group ref={head} position={[0, 0.44, 0.02]}>
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.05, 0.06, 0.08, 12]} />
            <meshStandardMaterial color={skin} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.15, 0]} castShadow>
            <sphereGeometry args={[0.125, 20, 20]} />
            <meshStandardMaterial color={skin} roughness={0.55} />
          </mesh>
          {/* Hair cap */}
          <mesh position={[0, 0.19, -0.01]} scale={[1.06, 0.9, 1.08]}>
            <sphereGeometry args={[0.125, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
            <meshStandardMaterial color={hair} roughness={0.8} />
          </mesh>
        </group>

        {/* Left arm */}
        <group position={[-0.21, 0.28, 0.04]}>
          {/* upper arm */}
          <mesh position={[0, -0.1, 0.02]} rotation={[0.5, 0, 0.08]} castShadow>
            <boxGeometry args={[0.1, 0.24, 0.12]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
          {/* forearm pivots forward to the keyboard */}
          <group ref={leftForearm} position={[0, -0.2, 0.08]}>
            <mesh position={[0, 0, 0.15]} castShadow>
              <boxGeometry args={[0.09, 0.09, 0.3]} />
              <meshStandardMaterial color={color} roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.01, 0.32]}>
              <boxGeometry args={[0.08, 0.06, 0.08]} />
              <meshStandardMaterial color={skin} roughness={0.6} />
            </mesh>
          </group>
        </group>

        {/* Right arm */}
        <group position={[0.21, 0.28, 0.04]}>
          <mesh position={[0, -0.1, 0.02]} rotation={[0.5, 0, -0.08]} castShadow>
            <boxGeometry args={[0.1, 0.24, 0.12]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
          <group ref={rightForearm} position={[0, -0.2, 0.08]}>
            <mesh position={[0, 0, 0.15]} castShadow>
              <boxGeometry args={[0.09, 0.09, 0.3]} />
              <meshStandardMaterial color={color} roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.01, 0.32]}>
              <boxGeometry args={[0.08, 0.06, 0.08]} />
              <meshStandardMaterial color={skin} roughness={0.6} />
            </mesh>
          </group>
        </group>
      </group>

      {/* Thighs (seated, horizontal forward) */}
      <mesh position={[-0.1, 0.47, 0.22]} rotation={[1.45, 0, 0]} castShadow>
        <boxGeometry args={[0.13, 0.34, 0.15]} />
        <meshStandardMaterial color="#33343a" roughness={0.85} />
      </mesh>
      <mesh position={[0.1, 0.47, 0.22]} rotation={[1.45, 0, 0]} castShadow>
        <boxGeometry args={[0.13, 0.34, 0.15]} />
        <meshStandardMaterial color="#33343a" roughness={0.85} />
      </mesh>

      {/* Shins (down to floor) */}
      <mesh position={[-0.1, 0.26, 0.36]} castShadow>
        <boxGeometry args={[0.12, 0.44, 0.13]} />
        <meshStandardMaterial color="#33343a" roughness={0.85} />
      </mesh>
      <mesh position={[0.1, 0.26, 0.36]} castShadow>
        <boxGeometry args={[0.12, 0.44, 0.13]} />
        <meshStandardMaterial color="#33343a" roughness={0.85} />
      </mesh>

      {/* Shoes */}
      <mesh position={[-0.1, 0.04, 0.42]} castShadow>
        <boxGeometry args={[0.13, 0.08, 0.22]} />
        <meshStandardMaterial color="#1f2023" roughness={0.7} />
      </mesh>
      <mesh position={[0.1, 0.04, 0.42]} castShadow>
        <boxGeometry args={[0.13, 0.08, 0.22]} />
        <meshStandardMaterial color="#1f2023" roughness={0.7} />
      </mesh>
    </group>
  )
}
