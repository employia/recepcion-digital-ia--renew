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
  // Every mesh here sits physically inside EmployeeZone's invisible hover
  // hitbox (the box wraps the whole seated figure, desk-top and all). These
  // props have no pointer handlers of their own, but by default every mesh
  // still participates in raycasting — so whenever the cursor lands on a
  // pixel where the keyboard/mouse/documents happen to be the nearest hit,
  // they silently win over the hitbox behind them and the "hover" turns off,
  // then back on the instant the ray clears them again. With a mouse that's
  // never perfectly still (OS-level sub-pixel jitter), that's a hover
  // on/off/on flicker every time the cursor rests near one of these props —
  // exactly the "avatars flicker on hover" symptom, and independent of GPU
  // or renderer, since it's a hit-testing order issue, not a rendering one.
  // Disabling raycast on each one (same treatment already applied to the
  // avatar model itself in person.tsx, for the same class of problem) removes
  // them from hit-testing entirely, leaving the fixed hitbox as the sole,
  // stable interactive surface.
  const noRaycast = () => null

  return (
    <group position={surface}>
      {/* Keyboard */}
      <mesh position={[0, 0.025, -0.16]} castShadow raycast={noRaycast}>
        <boxGeometry args={[0.44, 0.02, 0.15]} />
        <meshStandardMaterial color="#e8e6e0" roughness={0.6} />
      </mesh>
      {/* Mouse */}
      <mesh position={[0.32, 0.025, -0.16]} castShadow raycast={noRaycast}>
        <boxGeometry args={[0.06, 0.02, 0.09]} />
        <meshStandardMaterial color="#e8e6e0" roughness={0.6} />
      </mesh>

      {/* Small desk object: a short stack of documents with an accent tab */}
      <group position={[-0.48, 0.04, 0.08]}>
        <mesh castShadow raycast={noRaycast}>
          <boxGeometry args={[0.16, 0.05, 0.22]} />
          <meshStandardMaterial color="#f3f1ea" roughness={0.7} />
        </mesh>
        <mesh position={[0.05, 0.03, 0]} raycast={noRaycast}>
          <boxGeometry args={[0.05, 0.008, 0.22]} />
          <meshStandardMaterial color={accent} roughness={0.6} />
        </mesh>
      </group>
    </group>
  )
}
