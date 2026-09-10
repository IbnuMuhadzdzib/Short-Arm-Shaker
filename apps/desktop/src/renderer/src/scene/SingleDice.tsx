import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import type { DiceValue } from '@yahtzee/shared'
import { useDiceImpactSound } from '../hooks/useDiceSounds'

interface SingleDiceProps {
  value: DiceValue
  isHeld: boolean
  isRolling: boolean
  isShaking: boolean
  startPosition: [number, number, number]
  onClick: () => void
  handOffset: { x: number; progress: number }
}

// ── Pip layouts per face ──────────────────────────────────────────────────
// Each entry is [x, y] from -1..1 where 0,0 = center of face
const PIPS: Record<DiceValue, [number, number][]> = {
  1: [[0, 0]],
  2: [[-0.38, -0.38], [0.38, 0.38]],
  3: [[-0.38, -0.38], [0, 0], [0.38, 0.38]],
  4: [[-0.38, -0.38], [0.38, -0.38], [-0.38, 0.38], [0.38, 0.38]],
  5: [[-0.38, -0.38], [0.38, -0.38], [0, 0], [-0.38, 0.38], [0.38, 0.38]],
  6: [[-0.38, -0.38], [0.38, -0.38], [-0.38, 0], [0.38, 0], [-0.38, 0.38], [0.38, 0.38]],
}

// ── Draw one face texture on a canvas ────────────────────────────────────
function buildFaceTexture(pip: DiceValue, isHeld: boolean): THREE.CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!

  // Background
  const bgColor = isHeld ? '#e8c840' : '#f8f4ee'
  ctx.fillStyle = bgColor
  const r = size * 0.1
  ctx.beginPath()
  ctx.moveTo(r, 0)
  ctx.lineTo(size - r, 0)
  ctx.quadraticCurveTo(size, 0, size, r)
  ctx.lineTo(size, size - r)
  ctx.quadraticCurveTo(size, size, size - r, size)
  ctx.lineTo(r, size)
  ctx.quadraticCurveTo(0, size, 0, size - r)
  ctx.lineTo(0, r)
  ctx.quadraticCurveTo(0, 0, r, 0)
  ctx.closePath()
  ctx.fill()

  // Dots
  const dotColor = pip === 1 ? '#cc2222' : '#111111'
  const dotR = size * 0.085
  ctx.fillStyle = dotColor
  for (const [px, py] of PIPS[pip]) {
    const cx = (px * 0.5 + 0.5) * size
    const cy = (py * 0.5 + 0.5) * size
    ctx.beginPath()
    ctx.arc(cx, cy, dotR, 0, Math.PI * 2)
    ctx.fill()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

// Standard die face assignment for BoxGeometry (face order: +x,-x,+y,-y,+z,-z)
// When face value=1 is on top (+y), face value=6 is on bottom (-y), etc.
// Face order for three.js BoxGeometry materials array: right(+x), left(-x), top(+y), bottom(-y), front(+z), back(-z)
const FACE_ORDER: DiceValue[] = [3, 4, 1, 6, 2, 5] // value shown on each face

// Rotation snapping: which rotation aligns value V to be on top (+y)
const FACE_ROTATIONS: Record<DiceValue, [number, number, number]> = {
  1: [0, 0, 0],
  2: [Math.PI / 2, 0, 0],
  3: [0, 0, -Math.PI / 2],
  4: [0, 0, Math.PI / 2],
  5: [-Math.PI / 2, 0, 0],
  6: [Math.PI, 0, 0],
}

export function SingleDice({
  value,
  isHeld,
  isRolling,
  isShaking,
  startPosition,
  onClick,
  handOffset,
}: SingleDiceProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const { playImpact } = useDiceImpactSound()
  const prevLinvel = useRef({ x: 0, y: 0, z: 0 })

  // Build 6 face materials — one canvas texture per face
  const materials = useMemo(() => {
    return FACE_ORDER.map(
      (faceVal) =>
        new THREE.MeshStandardMaterial({
          map: buildFaceTexture(faceVal, isHeld),
          roughness: 0.25,
          metalness: 0.05,
        })
    )
  }, [isHeld])

  // Dispose textures on unmount
  useEffect(() => {
    return () => {
      materials.forEach((m) => {
        m.map?.dispose()
        m.dispose()
      })
    }
  }, [materials])

  useFrame(() => {
    const body = rigidBodyRef.current
    if (!body) return

    if (!isShaking && !isHeld) {
      const vel = body.linvel()
      prevLinvel.current = { x: vel.x, y: vel.y, z: vel.z }
    }

    if (!isShaking || isHeld) return

    const t = Date.now() * 0.01
    const jitter = new THREE.Euler(
      Math.sin(t * 3 + startPosition[0]) * 0.4,
      Math.cos(t * 2.5) * 0.4,
      Math.sin(t * 4 + startPosition[0]) * 0.4
    )
    const q = new THREE.Quaternion().setFromEuler(jitter)
    body.setNextKinematicRotation({ x: q.x, y: q.y, z: q.z, w: q.w })

    const progress = handOffset.progress
    const clusterX = THREE.MathUtils.lerp(0, startPosition[0], progress) + handOffset.x
    const y = THREE.MathUtils.lerp(0.5, startPosition[1], progress)
    const z = THREE.MathUtils.lerp(4.5, startPosition[2], progress)
    body.setNextKinematicTranslation({ x: clusterX, y, z })
  })

  useEffect(() => {
    if (!isRolling || isHeld || !rigidBodyRef.current) return
    const body = rigidBodyRef.current
    body.setTranslation({ x: startPosition[0], y: 2, z: 0 }, true)
    body.setLinvel({ x: 0, y: 0, z: 0 }, true)
    body.setAngvel({ x: 0, y: 0, z: 0 }, true)
    const s = 3
    body.applyImpulse({ x: (Math.random() - 0.5) * s, y: 2, z: (Math.random() - 0.5) * s }, true)
    const t = 6
    body.applyTorqueImpulse(
      { x: (Math.random() - 0.5) * t, y: (Math.random() - 0.5) * t, z: (Math.random() - 0.5) * t },
      true
    )
  }, [isRolling])

  useEffect(() => {
    if (!isRolling) return
    const timeout = setTimeout(() => {
      const body = rigidBodyRef.current
      if (!body || isHeld) return
      const [rx, ry, rz] = FACE_ROTATIONS[value]
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz))
      body.setRotation({ x: q.x, y: q.y, z: q.z, w: q.w }, true)
      body.setLinvel({ x: 0, y: 0, z: 0 }, true)
      body.setAngvel({ x: 0, y: 0, z: 0 }, true)
    }, 1500)
    return () => clearTimeout(timeout)
  }, [isRolling, value])

  const bodyType = isHeld ? 'fixed' : isShaking ? 'kinematicPosition' : 'dynamic'

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={startPosition}
      type={bodyType}
      colliders="cuboid"
      restitution={0.25}
      friction={0.8}
      ccd={true}
      onCollisionEnter={() => {
        const body = rigidBodyRef.current
        if (!body) return
        const vel = prevLinvel.current
        const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y + vel.z * vel.z)
        const intensity = Math.min(1, speed / 8)
        if (intensity > 0.08) playImpact(intensity)
      }}
    >
      <mesh castShadow onClick={onClick} material={materials}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
    </RigidBody>
  )
}