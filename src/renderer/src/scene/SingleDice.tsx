import { useRef, useEffect } from 'react'
import { RigidBody, RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import type { DiceValue } from '@yahtzee/shared'

interface SingleDiceProps {
  value: DiceValue
  isHeld: boolean
  isRolling: boolean
  startPosition: [number, number, number]
}

const FACE_ROTATIONS: Record<DiceValue, [number, number, number]> = {
  1: [0, 0, 0],
  2: [0, Math.PI / 2, 0],
  3: [0, 0, -Math.PI / 2],
  4: [0, 0, Math.PI / 2],
  5: [0, -Math.PI / 2, 0],
  6: [Math.PI, 0, 0]
}

export function SingleDice({ value, isHeld, isRolling, startPosition }: SingleDiceProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null)

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
      const targetQuaternion = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(rx, ry, rz)
      )

      body.setRotation(
        { x: targetQuaternion.x, y: targetQuaternion.y, z: targetQuaternion.z, w: targetQuaternion.w },
        true
      )
      body.setLinvel({ x: 0, y: 0, z: 0 }, true)
      body.setAngvel({ x: 0, y: 0, z: 0 }, true)
    }, 1500)

    return () => clearTimeout(timeout)
  }, [isRolling, value])

    return (
    <RigidBody
      ref={rigidBodyRef}
      position={startPosition}
      type={isHeld ? 'fixed' : 'dynamic'}
      colliders="cuboid"
      restitution={0.4}
      friction={0.5}
    >
      <mesh castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={isHeld ? '#f4d35e' : '#f0f0f0'} />
      </mesh>
    </RigidBody>
  )
}