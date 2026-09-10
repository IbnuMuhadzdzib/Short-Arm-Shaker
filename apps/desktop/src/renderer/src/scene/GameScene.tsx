import { Canvas } from '@react-three/fiber'
import { Physics, RigidBody } from '@react-three/rapier'
import { OrbitControls, useTexture } from '@react-three/drei'
import Rex from "../assets/char/char-rex.png"
import { DiceGroup } from './DiceGroup'
import type { Dice } from '@yahtzee/shared'
import * as THREE from 'three'
import { Suspense, useMemo } from 'react'

interface GameSceneProps {
  dice: Dice[]
  isRolling: boolean
  isShaking: boolean
  onDiceClick: (diceId: string) => void
  handOffset: { x: number; progress: number }
  opponentName: string
}

export function GameScene({ dice, isRolling, isShaking, onDiceClick, handOffset, opponentName }: GameSceneProps) {
  return (
    <Canvas
      shadows
      // Camera moved higher and further back so the whole tray is visible
      camera={{ position: [0, 20, 14], fov: 42 }}
      gl={{ alpha: false }}
      onCreated={({ scene }) => {
        scene.background = new THREE.Color('#06070c')
        scene.fog = new THREE.FogExp2('#06070c', 0.028)
      }}
    >
      {/* === LIGHTING === */}
      <ambientLight intensity={0.14} color="#1a1a2e" />

      {/* Main overhead bulb */}
      <pointLight
        position={[0, 7, 0]}
        intensity={140}
        color="#ffcc55"
        distance={22}
        decay={1.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={25}
      />
      {/* Cool blue side fill */}
      <pointLight position={[-9, 4, -2]} intensity={5} color="#3a6eff" distance={14} decay={2} />
      {/* Warm rim */}
      <pointLight position={[9, 3, 2]} intensity={3} color="#ff7733" distance={12} decay={2} />

      {/* === PHYSICS === */}
      <Physics gravity={[0, -30, 0]}>
        <DiceGroup
          dice={dice}
          isRolling={isRolling}
          isShaking={isShaking}
          onDiceClick={onDiceClick}
          handOffset={handOffset}
        />
        <DiceTray />
      </Physics>

      {/* === ROOM DIORAMA === */}
            <ApartmentRoom />
      <Suspense fallback={null}>
        <OpponentSprite name={opponentName} />
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        // Restrict polar angle: only from overhead down to near-horizon
        minPolarAngle={Math.PI / 10}
        maxPolarAngle={Math.PI / 2.2}
        minAzimuthAngle={-Math.PI / 10}
        maxAzimuthAngle={Math.PI / 10}
        target={[0, 1, 0]} // Keep target centered on the table so the board doesn't shift down
      />
    </Canvas>
  )
}

// ── Fancy Dice Tray ────────────────────────────────────────────────────────────
function DiceTray() {
  const trayW = 9
  const trayD = 8
  const visualWallH = 0.55  // lowered visual rim height so it doesn't block the view
  const physWallH = 20.0    // massive invisible physics wall to prevent dice escaping
  const wallT = 0.5         // wall thickness
  const feltY = 0
  const baseH = 1.8

  const feltColor = '#0e5c2a'
  const woodColor = '#3a1f0a'
  const woodRough = 0.85

  return (
    <>
      {/* ── FELT FLOOR (thick physics collider) ── */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, feltY - baseH / 2, 0]}>
          <boxGeometry args={[trayW, baseH, trayD]} />
          <meshStandardMaterial color={feltColor} roughness={0.95} />
        </mesh>
      </RigidBody>

      {/* ── TALL INVISIBLE PHYSICS WALLS ── */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh visible={false} position={[0, physWallH / 2, trayD / 2 + wallT / 2]}>
          <boxGeometry args={[trayW + wallT * 2, physWallH, wallT]} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh visible={false} position={[0, physWallH / 2, -(trayD / 2 + wallT / 2)]}>
          <boxGeometry args={[trayW + wallT * 2, physWallH, wallT]} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh visible={false} position={[-(trayW / 2 + wallT / 2), physWallH / 2, 0]}>
          <boxGeometry args={[wallT, physWallH, trayD]} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh visible={false} position={[trayW / 2 + wallT / 2, physWallH / 2, 0]}>
          <boxGeometry args={[wallT, physWallH, trayD]} />
        </mesh>
      </RigidBody>

      {/* ── INVISIBLE PHYSICS CEILING (prevents hyper-bounces from escaping upward) ── */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh visible={false} position={[0, 12, 0]}>
          <boxGeometry args={[trayW + wallT * 2, 0.5, trayD + wallT * 2]} />
        </mesh>
      </RigidBody>

      {/* ── VISUAL WALLS (Wood Rim, no physics) ── */}
      <mesh castShadow receiveShadow position={[0, visualWallH / 2, trayD / 2 + wallT / 2]}>
        <boxGeometry args={[trayW + wallT * 2, visualWallH, wallT]} />
        <meshStandardMaterial color={woodColor} roughness={woodRough} metalness={0.05} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, visualWallH / 2, -(trayD / 2 + wallT / 2)]}>
        <boxGeometry args={[trayW + wallT * 2, visualWallH, wallT]} />
        <meshStandardMaterial color={woodColor} roughness={woodRough} metalness={0.05} />
      </mesh>
      <mesh castShadow receiveShadow position={[-(trayW / 2 + wallT / 2), visualWallH / 2, 0]}>
        <boxGeometry args={[wallT, visualWallH, trayD]} />
        <meshStandardMaterial color={woodColor} roughness={woodRough} metalness={0.05} />
      </mesh>
      <mesh castShadow receiveShadow position={[trayW / 2 + wallT / 2, visualWallH / 2, 0]}>
        <boxGeometry args={[wallT, visualWallH, trayD]} />
        <meshStandardMaterial color={woodColor} roughness={woodRough} metalness={0.05} />
      </mesh>

      {/* ── RIM CAP (decorative top edge strips) ── */}
      <mesh position={[0, visualWallH + 0.06, trayD / 2 + wallT / 2]}>
        <boxGeometry args={[trayW + wallT * 2 + 0.05, 0.12, wallT + 0.05]} />
        <meshStandardMaterial color="#5a2e0a" roughness={0.5} metalness={0.15} />
      </mesh>
      <mesh position={[0, visualWallH + 0.06, -(trayD / 2 + wallT / 2)]}>
        <boxGeometry args={[trayW + wallT * 2 + 0.05, 0.12, wallT + 0.05]} />
        <meshStandardMaterial color="#5a2e0a" roughness={0.5} metalness={0.15} />
      </mesh>
      <mesh position={[-(trayW / 2 + wallT / 2), visualWallH + 0.06, 0]}>
        <boxGeometry args={[wallT + 0.05, 0.12, trayD + 0.05]} />
        <meshStandardMaterial color="#5a2e0a" roughness={0.5} metalness={0.15} />
      </mesh>
      <mesh position={[trayW / 2 + wallT / 2, visualWallH + 0.06, 0]}>
        <boxGeometry args={[wallT + 0.05, 0.12, trayD + 0.05]} />
        <meshStandardMaterial color="#5a2e0a" roughness={0.5} metalness={0.15} />
      </mesh>

      {/* ── OUTER TABLE SURFACE ── */}
      <mesh receiveShadow position={[0, -1.6, 0]}>
        <boxGeometry args={[14, 0.2, 12]} />
        <meshStandardMaterial color={woodColor} roughness={woodRough} metalness={0.05} />
      </mesh>

      {/* ── TABLE LEGS ── */}
      {(
        [[-5.5, -4, -4.5], [5.5, -4, -4.5], [-5.5, -4, 4.5], [5.5, -4, 4.5]] as [number, number, number][]
      ).map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[0.22, 0.22, 5, 10]} />
          <meshStandardMaterial color="#2a1205" roughness={0.9} metalness={0.05} />
        </mesh>
      ))}
    </>
  )
}

// ── Dark apartment room ────────────────────────────────────────────────────
function ApartmentRoom() {
  const roomW = 30
  const roomD = 26
  const roomH = 12

  return (
    <>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.8, 0]}>
        <planeGeometry args={[roomW, roomD]} />
        <meshStandardMaterial color="#130d06" roughness={0.9} metalness={0.05} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, roomH, 0]}>
        <planeGeometry args={[roomW, roomD]} />
        <meshStandardMaterial color="#0a0a10" roughness={1} />
      </mesh>
      <mesh position={[0, roomH / 2 - 1, -roomD / 2]}>
        <planeGeometry args={[roomW, roomH]} />
        <meshStandardMaterial color="#0e0c14" roughness={1} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-roomW / 2, roomH / 2 - 1, 0]}>
        <planeGeometry args={[roomD, roomH]} />
        <meshStandardMaterial color="#0c0a12" roughness={1} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[roomW / 2, roomH / 2 - 1, 0]}>
        <planeGeometry args={[roomD, roomH]} />
        <meshStandardMaterial color="#0c0a12" roughness={1} side={THREE.DoubleSide} />
      </mesh>
      {/* Baseboard light leak */}
      <mesh position={[0, -2.6, -roomD / 2 + 0.05]}>
        <planeGeometry args={[roomW, 0.06]} />
        <meshStandardMaterial color="#ff9922" emissive="#ff6600" emissiveIntensity={0.9} />
      </mesh>
    </>
  )
}

function buildNameTexture(name: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 128
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
  const r = 24
  ctx.beginPath()
  ctx.moveTo(r, 0)
  ctx.lineTo(canvas.width - r, 0)
  ctx.quadraticCurveTo(canvas.width, 0, canvas.width, r)
  ctx.lineTo(canvas.width, canvas.height - r)
  ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - r, canvas.height)
  ctx.lineTo(r, canvas.height)
  ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - r)
  ctx.lineTo(0, r)
  ctx.quadraticCurveTo(0, 0, r, 0)
  ctx.closePath()
  ctx.fill()

  ctx.font = 'bold 56px sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(name, canvas.width / 2, canvas.height / 2)

  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

function OpponentSprite({ name }: { name: string }) {
  const rexTexture = useTexture(Rex)
  const nameTexture = useMemo(() => buildNameTexture(name), [name])

  const img = rexTexture.image as HTMLImageElement | undefined
  const aspect = img ? img.width / img.height : 0.75
  const height = 6.5
  const width = height * aspect

  const floorY = -2.8 // matches ApartmentRoom floor level
  const standZ = -5.5 // just behind the tray, so the tray rim occludes his lower body

  return (
    <group position={[0, floorY, standZ]}>
      <mesh castShadow position={[0, height / 2, 0]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          map={rexTexture}
          transparent
          alphaTest={0.1}
          roughness={0.85}
          metalness={0}
        />
      </mesh>
      <mesh position={[0, height + 0.3, 0.01]}>
        <planeGeometry args={[1.6, 0.4]} />
        <meshBasicMaterial map={nameTexture} transparent />
      </mesh>
    </group>
  )
}