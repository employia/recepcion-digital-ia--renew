"use client"

import { useMemo } from "react"
import { useGLTF } from "@react-three/drei"
import { Box3, Vector3, type Object3D } from "three"
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js"

interface EmployeeModelProps {
  /** Path to the fused GLB (person + chair + desk as one merged piece). */
  model: string
  /** Overall height (in world units) the model is normalized to. */
  targetHeight?: number
  /** Extra Y rotation (radians) to orient the model's desk toward the room center. */
  rotationY?: number
}

/**
 * Loads a fused employee GLB (the person already includes their chair and desk).
 * The geometry is auto-normalized: scaled to a consistent height, dropped onto
 * the floor (min.y = 0) and centered horizontally, so every model — regardless
 * of its original export scale or pivot — lands consistently in the office.
 */
export function EmployeeModel({
  model,
  targetHeight = 1.9,
  rotationY = 0,
}: EmployeeModelProps) {
  const { scene } = useGLTF(model)

  const { object, scale, offset } = useMemo(() => {
    // Plain Object3D.clone(true) does NOT rebind SkinnedMesh.skeleton.bones to
    // the cloned bone hierarchy — it silently keeps pointing at the ORIGINAL
    // scene's bones. For unrigged models (Valentina/Carlos/Elena) this is a
    // no-op and scene.clone(true) is fine. For a fully rigged model (Steven's
    // Sketchfab asset, 76-bone skeleton) it breaks the skin binding: the mesh
    // renders with garbage/blown-up vertex positions, which is what produced
    // the giant, distorted avatar and, downstream, a bounding box computed
    // from that broken geometry (wrong scale/offset for the whole group).
    // SkeletonUtils.clone correctly re-parents skeletons/bones on clone and
    // is a safe drop-in for both rigged and unrigged models.
    const object = cloneSkeleton(scene) as Object3D
    object.traverse((child: Object3D) => {
      // Employees cast shadows onto the floor (visually important), but
      // don't meaningfully shadow each other at this spacing — receiveShadow
      // on every submesh (hair, buttons, accessories) doubled the shadow-pass
      // mesh count on all four avatars for no visible difference.
      child.castShadow = true
      // This model must NOT be part of hover raycasting, and it must not
      // change shape/scale/position as a consequence of hover either — see
      // EmployeeZone, which owns hover/click exclusively via its own fixed
      // hitbox mesh. The avatar is purely visual: nothing here reads
      // `active` or any hover-derived state, so there is no path by which
      // hovering can alter this object's geometry, silhouette, or bounding
      // box. Disabling raycast on every submesh additionally removes the
      // model from hit-testing entirely, so only the hitbox drives
      // hover/click — two independent safeguards against the same class of
      // feedback loop (avatar reacting to hover -> raycast intersection
      // shifts -> hover flickers on/off).
      child.raycast = () => null
    })
    const box = new Box3().setFromObject(object)
    const size = new Vector3()
    const center = new Vector3()
    box.getSize(size)
    box.getCenter(center)
    const scale = targetHeight / (size.y || 1)
    return {
      object,
      scale,
      offset: new Vector3(-center.x, -box.min.y, -center.z),
    }
  }, [scene, targetHeight])

  return (
    <group rotation={[0, rotationY, 0]} scale={scale}>
      <group position={[offset.x, offset.y, offset.z]}>
        <primitive object={object} />
      </group>
    </group>
  )
}

useGLTF.preload("/models/valentina-empleada.glb")
useGLTF.preload("/models/carlos-empleado.glb")
useGLTF.preload("/models/elena-empleada.glb")
useGLTF.preload("/models/steven-empleado.glb")
