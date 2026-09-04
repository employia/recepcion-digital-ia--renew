"use client"

import { useMemo } from "react"
import { useGLTF } from "@react-three/drei"
import { Box3, Vector3, type Object3D } from "three"

interface EmployeeModelProps {
  /** Path to the fused GLB (person + chair + desk as one merged piece). */
  model: string
  /** Overall height (in world units) the model is normalized to. */
  targetHeight?: number
  /** Extra Y rotation (radians) to orient the model's desk toward the room center. */
  rotationY?: number
  /** Whether this employee is currently highlighted. */
  active?: boolean
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
  active = false,
}: EmployeeModelProps) {
  const { scene } = useGLTF(model)

  const { object, scale, offset } = useMemo(() => {
    const object = scene.clone(true)
    object.traverse((child: Object3D) => {
      // Employees cast shadows onto the floor (visually important), but
      // don't meaningfully shadow each other at this spacing — receiveShadow
      // on every submesh (hair, buttons, accessories) doubled the shadow-pass
      // mesh count on all four avatars for no visible difference.
      child.castShadow = true
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
    <group rotation={[0, rotationY, 0]} scale={active ? scale * 1.01 : scale}>
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
