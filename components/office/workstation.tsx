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

/**
 * Desk peripherals only: keyboard, mouse and a small document stack with an
 * accent tab. The desk, legs, chair — and monitor, in the fused GLB models
 * that already include one — come from the fused GLB model, so a separate
 * procedural monitor is intentionally NOT drawn here (it was floating/
 * misaligned relative to each model's real desk surface). Everything is
 * positioned relative to `surface` (the desk-top center of the current
 * model).
 */
export function Workstation({ accent, surface = [0, 0.72, 0.82] }: WorkstationProps) {
  return (
    <group position={surface}>
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
