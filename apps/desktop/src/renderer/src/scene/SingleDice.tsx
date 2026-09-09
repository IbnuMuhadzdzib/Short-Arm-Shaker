import { useRef, useEffect } from 'react'
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

const FACE_ROTATIONS: Record<DiceValue, [number, number, number]> = {
  1: [0, 0, 0],
  2: [0, Math.PI / 2, 0],
  3: [0, 0, -Math.PI / 2],
  4: [0, 0, Math.PI / 2],
  5: [0, -Math.PI / 2, 0],
  6: [Math.PI, 0, 0]
}

export function SingleDice({
  value,
  isHeld,
  isRolling,
  isShaking,
  startPosition,
  onClick,
  handOffset
}: SingleDiceProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const { playImpact } = useDiceImpactSound()
  const prevLinvel = useRef({ x: 0, y: 0, z: 0 })

  useFrame(() => {
    const body = rigidBodyRef.current
    if (!body) return

    // Track velocity for impact detection fallback
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
    const y = THREE.MathUtils.lerp(0.3, startPosition[1], progress)
    const z = THREE.MathUtils.lerp(5.5, startPosition[2], progress)

    body.setNextKinematicTranslation({ x: clusterX, y, z })
  })

  useEffect(() => {
    if (!isRolling || isHeld || !rigidBodyRef.current) return

    const body = rigidBodyRef.current

    body.setTranslation({ x: startPosition[0], y: 5, z: 0 }, true)
    body.setLinvel({ x: 0, y: 0, z: 0 }, true)
    body.setAngvel({ x: 0, y: 0, z: 0 }, true)

    const impulseStrength = 3
    body.applyImpulse(
      {
        x: (Math.random() - 0.5) * impulseStrength,
        y: 2,
        z: (Math.random() - 0.5) * impulseStrength
      },
      true
    )

    const torqueStrength = 5
    body.applyTorqueImpulse(
      {
        x: (Math.random() - 0.5) * torqueStrength,
        y: (Math.random() - 0.5) * torqueStrength,
        z: (Math.random() - 0.5) * torqueStrength
      },
      true
    )
  }, [isRolling])

  useEffect(() => {
    if (!isRolling) return

    const timeout = setTimeout(() => {
      const body = rigidBodyRef.current
      if (!body || isHeld) return

      const [rx, ry, rz] = FACE_ROTATIONS[value]
      const targetQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz))

      body.setRotation(
        { x: targetQuaternion.x, y: targetQuaternion.y, z: targetQuaternion.z, w: targetQuaternion.w },
        true
      )
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
      restitution={0.3}
      friction={0.7}
      ccd={true}
      onCollisionEnter={() => {
        const body = rigidBodyRef.current
        if (!body) return
        // Use current velocity magnitude as impact proxy —
        // more reliable than manifold.maxImpulse() which may not exist
        const vel = prevLinvel.current
        const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y + vel.z * vel.z)
        const intensity = Math.min(1, speed / 8)
        if (intensity > 0.08) {
          playImpact(intensity)
        }
      }}
    >
      <mesh castShadow onClick={onClick}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={isHeld ? '#f4d35e' : '#f5f0e8'}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>
    </RigidBody>
  )
}