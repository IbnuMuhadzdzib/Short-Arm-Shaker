import { Canvas } from '@react-three/fiber'
import { Physics, RigidBody } from '@react-three/rapier'
import { OrbitControls, Environment, Lightformer } from '@react-three/drei'
import { DiceGroup } from './DiceGroup'
import type { Dice } from '@yahtzee/shared'

interface GameSceneProps {
  dice: Dice[]
  isRolling: boolean
}

export function GameScene({ dice, isRolling }: GameSceneProps) {
  return (
    <Canvas camera={{ position: [0, 8, 6], fov: 50 }}>
  <ambientLight intensity={0.5} />
  <directionalLight position={[5, 10, 5]} intensity={1} castShadow />

  <Environment resolution={256}>
    <Lightformer
      form="rect"
      intensity={2}
      position={[0, 5, -5]}
      scale={[10, 10, 1]}
      color="white"
    />
    <Lightformer
      form="rect"
      intensity={1}
      position={[-5, 3, 5]}
      scale={[5, 5, 1]}
      rotation={[0, Math.PI / 2, 0]}
      color="#aabbff"
    />
    <Lightformer
      form="rect"
      intensity={1}
      position={[5, 3, 5]}
      scale={[5, 5, 1]}
      rotation={[0, -Math.PI / 2, 0]}
      color="#ffddaa"
    />
  </Environment>

  <Physics gravity={[0, -20, 0]}>
    <DiceGroup dice={dice} isRolling={isRolling} />
    <Table />
  </Physics>

  <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.2} />
</Canvas>
  )
}

function Table() {
  return (
    <RigidBody type="fixed" colliders="cuboid">
      <mesh receiveShadow position={[0, -0.5, 0]}>
        <boxGeometry args={[10, 1, 10]} />
        <meshStandardMaterial color="#1a5c38" />
      </mesh>
    </RigidBody>
  )
}