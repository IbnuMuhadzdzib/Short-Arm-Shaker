import { Canvas } from '@react-three/fiber'
import { Physics, RigidBody } from '@react-three/rapier'
import { OrbitControls } from '@react-three/drei'
import { DiceGroup } from './DiceGroup'
import type { Dice } from '@yahtzee/shared'
import * as THREE from 'three'

interface GameSceneProps {
  dice: Dice[]
  isRolling: boolean
  isShaking: boolean
  onDiceClick: (diceId: string) => void
  handOffset: { x: number; progress: number }
}

export function GameScene({ dice, isRolling, isShaking, onDiceClick, handOffset }: GameSceneProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 6, 7], fov: 55 }}
      gl={{ alpha: false }}
      onCreated={({ scene }) => {
        scene.background = new THREE.Color('#06070c')
        scene.fog = new THREE.FogExp2('#06070c', 0.035)
      }}
    >
      {/* === LIGHTING: Dark apartment gambling den === */}

      {/* Minimal ambient — almost pitch black */}
      <ambientLight intensity={0.12} color="#1a1a2e" />

      {/* Main overhead bulb — warm filament glow */}
      <pointLight
        position={[0, 5.5, 0]}
        intensity={120}
        color="#ffcc55"
        distance={18}
        decay={1.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.1}
        shadow-camera-far={20}
      />

      {/* Secondary fill — cool blue light leaking from a window to the left */}
      <pointLight position={[-8, 3, -2]} intensity={4} color="#3a6eff" distance={12} decay={2} />

      {/* Subtle warm rim from the right (cigarette-adjacent) */}
      <pointLight position={[8, 2, 1]} intensity={2} color="#ff7733" distance={10} decay={2} />

      {/* === PHYSICS SCENE === */}
      <Physics gravity={[0, -25, 0]}>
        <DiceGroup
          dice={dice}
          isRolling={isRolling}
          isShaking={isShaking}
          onDiceClick={onDiceClick}
          handOffset={handOffset}
        />
        <GamblingTable />
      </Physics>

      {/* === ROOM DIORAMA (no physics — just visuals) === */}
      <ApartmentRoom />

      {/* Overhead lamp fixture prop */}
      <LampFixture />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        maxPolarAngle={Math.PI / 2.1}
        minPolarAngle={Math.PI / 6}
      />
    </Canvas>
  )
}

// ── Gambling table with thick collider + 4 invisible walls ─────────────────
function GamblingTable() {
  // Table center Y=-1, height=2 → top surface at Y=0 ✓
  // Walls go from Y=0 upward so dice can't escape the edges
  const wallThickness = 0.3
  const tableW = 10
  const tableD = 10
  const wallH = 2.5

  return (
    <>
      {/* ── Table surface ── */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -1, 0]}>
          <boxGeometry args={[tableW, 2, tableD]} />
          <meshStandardMaterial
            color="#0c4a20"
            roughness={0.95}
            metalness={0}
          />
        </mesh>
      </RigidBody>

      {/* ── Table legs (visual only) ── */}
      {(
        [
          [-4.2, -3.5, -4.2],
          [4.2, -3.5, -4.2],
          [-4.2, -3.5, 4.2],
          [4.2, -3.5, 4.2]
        ] as [number, number, number][]
      ).map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[0.18, 0.18, 5, 8]} />
          <meshStandardMaterial color="#3a2210" roughness={0.9} metalness={0.1} />
        </mesh>
      ))}

      {/* ── Invisible boundary walls (prevent dice escape) ── */}
      {/* Front */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh visible={false} position={[0, wallH / 2, tableD / 2]}>
          <boxGeometry args={[tableW, wallH, wallThickness]} />
        </mesh>
      </RigidBody>
      {/* Back */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh visible={false} position={[0, wallH / 2, -tableD / 2]}>
          <boxGeometry args={[tableW, wallH, wallThickness]} />
        </mesh>
      </RigidBody>
      {/* Left */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh visible={false} position={[-tableW / 2, wallH / 2, 0]}>
          <boxGeometry args={[wallThickness, wallH, tableD]} />
        </mesh>
      </RigidBody>
      {/* Right */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh visible={false} position={[tableW / 2, wallH / 2, 0]}>
          <boxGeometry args={[wallThickness, wallH, tableD]} />
        </mesh>
      </RigidBody>
    </>
  )
}

// ── Dark apartment room geometry ───────────────────────────────────────────
function ApartmentRoom() {
  const roomW = 26
  const roomD = 22
  const roomH = 10

  return (
    <>
      {/* Floor — dark wood parquet */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.05, 0]}>
        <planeGeometry args={[roomW, roomD]} />
        <meshStandardMaterial color="#1a0e07" roughness={0.85} metalness={0.05} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, roomH, 0]}>
        <planeGeometry args={[roomW, roomD]} />
        <meshStandardMaterial color="#0a0a10" roughness={1} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, roomH / 2 - 1, -roomD / 2]}>
        <planeGeometry args={[roomW, roomH]} />
        <meshStandardMaterial color="#0f0d14" roughness={1} side={THREE.DoubleSide} />
      </mesh>

      {/* Left wall */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-roomW / 2, roomH / 2 - 1, 0]}>
        <planeGeometry args={[roomD, roomH]} />
        <meshStandardMaterial color="#0d0b12" roughness={1} side={THREE.DoubleSide} />
      </mesh>

      {/* Right wall */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[roomW / 2, roomH / 2 - 1, 0]}>
        <planeGeometry args={[roomD, roomH]} />
        <meshStandardMaterial color="#0d0b12" roughness={1} side={THREE.DoubleSide} />
      </mesh>

      {/* Dirty light-leak strip along back wall base (ambiance) */}
      <mesh position={[0, -1.8, -roomD / 2 + 0.05]}>
        <planeGeometry args={[roomW, 0.06]} />
        <meshStandardMaterial color="#ff9922" emissive="#ff6600" emissiveIntensity={0.8} />
      </mesh>
    </>
  )
}

// ── Hanging lamp fixture prop ──────────────────────────────────────────────
function LampFixture() {
  return (
    <group position={[0, 5.6, 0]}>
      {/* Cord */}
      <mesh position={[0, 2.2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 4.4, 6]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Shade */}
      <mesh position={[0, 0, 0]}>
        <coneGeometry args={[0.6, 0.5, 16, 1, true]} />
        <meshStandardMaterial
          color="#2a1a0a"
          side={THREE.DoubleSide}
          roughness={0.9}
        />
      </mesh>
      {/* Bulb glow */}
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshStandardMaterial
          color="#ffeeaa"
          emissive="#ffcc44"
          emissiveIntensity={5}
        />
      </mesh>
    </group>
  )
}