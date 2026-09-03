"use client"

interface WorkstationProps {
  accent: string
  /**
   * World position of the desk-top surface center for THIS model's fused desk.
   * The peripherals below are laid out relative to this origin, so it can be
   * tuned per GLB (each model's desk sits at a slightly different height/depth).
   */
  surface?: [number, number, number]
}

const SCREEN = "#1b1c20"

/**
 * Desk peripherals only: monitor, keyboard, mouse and a small document stack
 * with an accent tab. The desk, legs and chair now come from the fused GLB
 * model, so they are intentionally NOT drawn here. Everything is positioned
 * relative to `surface` (the desk-top center of the current model).
 */
export function Workstation({ accent, surface = [0, 0.72, 0.82] }: WorkstationProps) {
  return (
    <group position={surface}>
      {/* Monitor */}
      <group position={[0, 0.02, 0.2]}>
        {/* stand */}
        <mesh position={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[0.05, 0.16, 0.05]} />
          <meshStandardMaterial color="#3a3b40" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.02, 0.02]}>
          <boxGeometry args={[0.22, 0.02, 0.14]} />
          <meshStandardMaterial color="#3a3b40" roughness={0.5} />
        </mesh>
        {/* body */}
        <mesh position={[0, 0.3, 0]} rotation={[-0.08, 0, 0]} castShadow>
          <boxGeometry args={[0.52, 0.34, 0.03]} />
          <meshStandardMaterial color="#26272b" roughness={0.5} />
        </mesh>
        {/* screen glow, faintly tinted with the employee accent */}
        <mesh position={[0, 0.3, -0.016]} rotation={[-0.08, 0, 0]}>
          <planeGeometry args={[0.48, 0.3]} />
          <meshStandardMaterial
            color={SCREEN}
            emissive={accent}
            emissiveIntensity={0.35}
            roughness={0.3}
          />
        </mesh>
      </group>

      {/* Keyboard */}
      <mesh position={[0, 0.025, -0.16]} castShadow>
        <boxGeometry args={[0.44, 0.02, 0.15]} />
        <meshStandardMaterial color="#e8e6e0" roughness={0.6} />
      </mesh>
      {/* Mouse */}
      <mesh position={[0.32, 0.025, -0.16]} castShadow>
        <boxGeometry args={[0.06, 0.02, 0.09]} />
        <meshStandardMaterial color="#e8e6e0" roughness={0.6} />
      </mesh>

      {/* Small desk object: a short stack of documents with an accent tab */}
      <group position={[-0.48, 0.04, 0.08]}>
        <mesh castShadow>
          <boxGeometry args={[0.16, 0.05, 0.22]} />
          <meshStandardMaterial color="#f3f1ea" roughness={0.7} />
        </mesh>
        <mesh position={[0.05, 0.03, 0]}>
          <boxGeometry args={[0.05, 0.008, 0.22]} />
          <meshStandardMaterial color={accent} roughness={0.6} />
        </mesh>
      </group>
    </group>
  )
}
