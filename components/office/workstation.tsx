"use client"

interface WorkstationProps {
  accent: string
}

const WOOD = "#c9b48d"
const WOOD_DARK = "#b09a72"
const METAL = "#c4c2bb"
const SCREEN = "#1b1c20"

/**
 * A single desk setup: wooden desk, metal legs, office chair, monitor,
 * keyboard and one small desk object. Local layout assumes the employee sits
 * at the origin facing +z, with the desk in front of them.
 */
export function Workstation({ accent }: WorkstationProps) {
  return (
    <group>
      {/* Desk top */}
      <mesh position={[0, 0.72, 0.82]} castShadow receiveShadow>
        <boxGeometry args={[1.34, 0.05, 0.72]} />
        <meshStandardMaterial color={WOOD} roughness={0.55} />
      </mesh>
      {/* Front edge trim */}
      <mesh position={[0, 0.69, 1.16]}>
        <boxGeometry args={[1.34, 0.02, 0.04]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.6} />
      </mesh>

      {/* Metal legs */}
      {[
        [-0.62, 0.5],
        [0.62, 0.5],
        [-0.62, 1.14],
        [0.62, 1.14],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.36, z]} castShadow>
          <boxGeometry args={[0.04, 0.72, 0.04]} />
          <meshStandardMaterial color={METAL} roughness={0.4} metalness={0.35} />
        </mesh>
      ))}

      {/* Monitor */}
      <group position={[0, 0.74, 1.02]}>
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
      <mesh position={[0, 0.745, 0.66]} castShadow>
        <boxGeometry args={[0.44, 0.02, 0.15]} />
        <meshStandardMaterial color="#e8e6e0" roughness={0.6} />
      </mesh>
      {/* Mouse */}
      <mesh position={[0.32, 0.745, 0.66]} castShadow>
        <boxGeometry args={[0.06, 0.02, 0.09]} />
        <meshStandardMaterial color="#e8e6e0" roughness={0.6} />
      </mesh>

      {/* Small desk object: a short stack of documents with an accent tab */}
      <group position={[-0.48, 0.76, 0.9]}>
        <mesh castShadow>
          <boxGeometry args={[0.16, 0.05, 0.22]} />
          <meshStandardMaterial color="#f3f1ea" roughness={0.7} />
        </mesh>
        <mesh position={[0.05, 0.03, 0]}>
          <boxGeometry args={[0.05, 0.008, 0.22]} />
          <meshStandardMaterial color={accent} roughness={0.6} />
        </mesh>
      </group>

      <OfficeChair accent={accent} />
    </group>
  )
}

function OfficeChair({ accent }: { accent: string }) {
  return (
    <group position={[0, 0, 0.02]}>
      {/* seat */}
      <mesh position={[0, 0.46, 0.05]} castShadow>
        <boxGeometry args={[0.42, 0.07, 0.42]} />
        <meshStandardMaterial color="#3a3b40" roughness={0.8} />
      </mesh>
      {/* accent seat cushion trim */}
      <mesh position={[0, 0.5, 0.05]}>
        <boxGeometry args={[0.38, 0.02, 0.38]} />
        <meshStandardMaterial color={accent} roughness={0.7} />
      </mesh>
      {/* backrest */}
      <mesh position={[0, 0.72, -0.18]} rotation={[-0.15, 0, 0]} castShadow>
        <boxGeometry args={[0.4, 0.44, 0.06]} />
        <meshStandardMaterial color="#3a3b40" roughness={0.8} />
      </mesh>
      {/* central column */}
      <mesh position={[0, 0.28, 0.05]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.36, 12]} />
        <meshStandardMaterial color="#2a2b2f" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* 5-star base */}
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[Math.sin(a) * 0.16, 0.06, 0.05 + Math.cos(a) * 0.16]}
            rotation={[0, -a, 0]}
            castShadow
          >
            <boxGeometry args={[0.05, 0.04, 0.3]} />
            <meshStandardMaterial color="#2a2b2f" roughness={0.5} metalness={0.3} />
          </mesh>
        )
      })}
    </group>
  )
}
