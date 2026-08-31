"use client"

const FLOOR = "#d9ccb4"
const FLOOR_EDGE = "#c3b291"
const WALL = "#eeebe3"
const WALL_SHADE = "#e4e0d6"

/** Potted plant made from a tapered pot and a few foliage spheres. */
export function Plant({
  position = [0, 0, 0],
  scale = 1,
}: {
  position?: [number, number, number]
  scale?: number
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.12, 0.36, 20]} />
        <meshStandardMaterial color="#f2efe8" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.03, 20]} />
        <meshStandardMaterial color="#5a4632" roughness={0.9} />
      </mesh>
      {[
        [0, 0.62, 0, 0.26],
        [0.14, 0.72, 0.06, 0.2],
        [-0.12, 0.7, -0.08, 0.18],
        [0.02, 0.86, -0.02, 0.16],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <icosahedronGeometry args={[r as number, 0]} />
          <meshStandardMaterial color={i % 2 ? "#5f7d54" : "#6f8a5f"} roughness={0.85} flatShading />
        </mesh>
      ))}
    </group>
  )
}

/**
 * Minimal corner office: warm floor with a border, two soft walls with tall
 * window openings, baseboards and a low credenza. No decorative clutter.
 */
export function Room() {
  return (
    <group>
      {/* Floor */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <boxGeometry args={[9.4, 9.4, 0.001]} />
        <meshStandardMaterial color={FLOOR} roughness={0.9} />
      </mesh>
      {/* Floor slab thickness / edge */}
      <mesh position={[0, -0.12, 0]}>
        <boxGeometry args={[9.4, 0.24, 9.4]} />
        <meshStandardMaterial color={FLOOR_EDGE} roughness={0.9} />
      </mesh>

      {/* Back wall (−z) */}
      <Wall position={[0, 1.7, -4.7]} size={[9.4, 3.4, 0.16]} color={WALL} windows="wide" />
      {/* Left wall (−x) */}
      <Wall
        position={[-4.7, 1.7, 0]}
        size={[0.16, 3.4, 9.4]}
        color={WALL_SHADE}
        rotationY={Math.PI / 2}
        windows="wide"
      />

      {/* Baseboards */}
      <mesh position={[0, 0.06, -4.62]}>
        <boxGeometry args={[9.4, 0.12, 0.04]} />
        <meshStandardMaterial color="#dcd8cd" roughness={0.8} />
      </mesh>
      <mesh position={[-4.62, 0.06, 0]}>
        <boxGeometry args={[0.04, 0.12, 9.4]} />
        <meshStandardMaterial color="#dcd8cd" roughness={0.8} />
      </mesh>

      {/* Low credenza against the back wall */}
      <group position={[3.1, 0, -4.2]}>
        <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 0.84, 0.5]} />
          <meshStandardMaterial color="#d7c39d" roughness={0.6} />
        </mesh>
        {[-0.55, 0.55].map((x, i) => (
          <mesh key={i} position={[x, 0.42, 0.26]}>
            <boxGeometry args={[0.9, 0.5, 0.02]} />
            <meshStandardMaterial color="#c7b184" roughness={0.6} />
          </mesh>
        ))}
        {/* colored folders on top */}
        <mesh position={[0.6, 0.92, 0]} rotation={[0, 0, 0.06]}>
          <boxGeometry args={[0.5, 0.14, 0.34]} />
          <meshStandardMaterial color="#8a9a63" roughness={0.7} />
        </mesh>
      </group>

      {/* A couple of plants for warmth */}
      <Plant position={[-4.1, 0, -4.1]} scale={1.15} />
      <Plant position={[-4.2, 0, 3.6]} scale={1} />
    </group>
  )
}

function Wall({
  position,
  size,
  color,
  rotationY = 0,
  windows,
}: {
  position: [number, number, number]
  size: [number, number, number]
  color: string
  rotationY?: number
  windows?: "wide"
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={rotationY ? [size[2], size[1], size[0]] : size} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      {windows === "wide" &&
        [-2.4, 0.1, 2.6].map((x, i) => (
          <mesh key={i} position={[x, 0.35, 0.09]}>
            <planeGeometry args={[1.5, 2.2]} />
            <meshStandardMaterial
              color="#f7f8fa"
              emissive="#eef3f7"
              emissiveIntensity={0.5}
              roughness={0.2}
            />
          </mesh>
        ))}
    </group>
  )
}
