"use client"

import { useRef, useState, useEffect, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, ContactShadows } from "@react-three/drei"
import * as THREE from "three"

type ShapeType = "torusKnot" | "icosahedron" | "torus" | "octahedron" | "box" | "sphere" | "cone"

// ── Spinning 3D shape ─────────────────────────────────────────────────────────

function SpinningShape({
  shape, color, hovered,
}: {
  shape: ShapeType
  color: string
  hovered: boolean
}) {
  const meshRef  = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!meshRef.current || !groupRef.current) return
    const t = state.clock.elapsedTime

    // Continuous rotation
    meshRef.current.rotation.y = t * 0.65
    meshRef.current.rotation.x = Math.sin(t * 0.35) * 0.22

    // Float up/down
    groupRef.current.position.y = Math.sin(t * 0.6) * 0.12

    // Scale pulse on hover
    const target = hovered ? 1.18 + Math.sin(t * 4) * 0.025 : 1.0
    meshRef.current.scale.setScalar(
      THREE.MathUtils.lerp(meshRef.current.scale.x, target, 0.07)
    )
  })

  const emissiveIntensity = hovered ? 0.25 : 0.06

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} castShadow receiveShadow>
        {shape === "torusKnot"   && <torusKnotGeometry args={[0.62, 0.21, 160, 16]} />}
        {shape === "icosahedron" && <icosahedronGeometry args={[0.88, 3]} />}
        {shape === "torus"       && <torusGeometry args={[0.62, 0.27, 32, 80]} />}
        {shape === "octahedron"  && <octahedronGeometry args={[0.98, 2]} />}
        {shape === "box"         && <boxGeometry args={[1.25, 1.25, 1.25]} />}
        {shape === "sphere"      && <sphereGeometry args={[0.88, 52, 52]} />}
        {shape === "cone"        && <coneGeometry args={[0.68, 1.45, 32]} />}
        <meshStandardMaterial
          color={color}
          roughness={hovered ? 0.04 : 0.1}
          metalness={0.96}
          envMapIntensity={hovered ? 3.5 : 2.2}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>

      {/* Subtle glow corona on hover */}
      {hovered && (
        <mesh scale={1.15}>
          {shape === "torusKnot"   && <torusKnotGeometry args={[0.62, 0.21, 160, 16]} />}
          {shape === "icosahedron" && <icosahedronGeometry args={[0.88, 3]} />}
          {shape === "torus"       && <torusGeometry args={[0.62, 0.27, 32, 80]} />}
          {shape === "octahedron"  && <octahedronGeometry args={[0.98, 2]} />}
          {shape === "box"         && <boxGeometry args={[1.25, 1.25, 1.25]} />}
          {shape === "sphere"      && <sphereGeometry args={[0.88, 52, 52]} />}
          {shape === "cone"        && <coneGeometry args={[0.68, 1.45, 32]} />}
          <meshBasicMaterial color={color} transparent opacity={0.08} side={THREE.BackSide} />
        </mesh>
      )}

      <ContactShadows
        position={[0, -1.2, 0]}
        opacity={0.4}
        scale={4}
        blur={2}
        color={color}
      />
    </group>
  )
}

// ── Public component ──────────────────────────────────────────────────────────

interface ModelThumb3DProps {
  shape: ShapeType
  color: string
  hovered: boolean
  gradient: string
}

export function ModelThumb3D({ shape, color, hovered, gradient }: ModelThumb3DProps) {
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Mount only when the card enters the viewport (saves resources)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setMounted(true) },
      { threshold: 0.05 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0">
      {/* Gradient fallback while canvas loads */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-80`} />

      {mounted && (
        <Canvas
          camera={{ position: [0, 0.3, 3.0], fov: 42 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          style={{ background: "transparent", position: "absolute", inset: 0 }}
          frameloop="always"
          dpr={[1, 1.5]}
        >
          <ambientLight intensity={0.35} />
          <directionalLight position={[4, 6, 4]} intensity={1.8} castShadow />
          <pointLight position={[-3, 3, 3]}  intensity={1.8} color={color} />
          <pointLight position={[3, -2, -3]} intensity={0.6} color="#ffffff" />
          {hovered && (
            <pointLight position={[0, 0, 3]} intensity={2.5} color={color} distance={8} />
          )}

          <Suspense fallback={null}>
            <SpinningShape shape={shape} color={color} hovered={hovered} />
            <Environment preset="city" />
          </Suspense>
        </Canvas>
      )}
    </div>
  )
}
