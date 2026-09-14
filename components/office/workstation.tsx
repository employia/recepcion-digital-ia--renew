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
 * No procedural desk peripherals are drawn here anymore. The desk, legs,
 * chair, monitor, keyboard and mouse all come from each fused GLB model,
 * which already includes a full, model-specific set of desk props (phone,
 * notepad, plant, lamp — see each employee's actual model). Every
 * procedural addition tried here (monitor, then keyboard/mouse, then this
 * document stack) hit the same failure mode: it renders relative to
 * `surface`, a hand-tuned per-model guess at the desk-top origin, and
 * — critically — it renders immediately, before the GLB (loaded async via
 * Suspense) has streamed in. So on first paint it floats with nothing
 * under it, and once the real desk geometry loads, any surface-height
 * mismatch leaves it clipping through the desk's front panel instead of
 * sitting flush on top (confirmed visually on Valentina's desk). Kept as a
 * no-op stub, not deleted outright, so `surface` tuning and the call site
 * in EmployeeZone don't need to change if a future prop is added here —
 * any new addition should be baked into the GLB itself instead of drawn
 * procedurally against a guessed `surface` origin.
 */
export function Workstation(_props: WorkstationProps) {
  return null
}
