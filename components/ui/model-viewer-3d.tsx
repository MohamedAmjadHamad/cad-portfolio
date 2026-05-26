"use client"

import { Suspense, useRef, useState, useEffect } from "react"
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber"
import { OrbitControls, Environment, Grid, PerspectiveCamera, Html, useProgress } from "@react-three/drei"
import * as THREE from "three"
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { RotateCcw, Grid3x3, Layers, Maximize2, Minimize2 } from "lucide-react"
import { type ModelFormat } from "@/lib/models"

// ─── Loaders ────────────────────────────────────────────────────────────────

function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--accent) transparent var(--accent) var(--accent)" }}
        />
        <span className="text-white/60 text-sm">{Math.round(progress)}%</span>
      </div>
    </Html>
  )
}

// ─── Placeholder shapes (no file provided) ──────────────────────────────────

type ShapeType = "torusKnot" | "icosahedron" | "torus" | "octahedron" | "box" | "sphere" | "cone"

function PlaceholderMesh({ shape, color, wireframe }: { shape: ShapeType; color: string; wireframe: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.4
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.25) * 0.15
  })

  const geometryProps: Record<ShapeType, React.ReactNode> = {
    torusKnot: <torusKnotGeometry args={[1, 0.32, 200, 16]} />,
    icosahedron: <icosahedronGeometry args={[1.6, 2]} />,
    torus: <torusGeometry args={[1.2, 0.45, 32, 100]} />,
    octahedron: <octahedronGeometry args={[1.7, 2]} />,
    box: <boxGeometry args={[2.2, 2.2, 2.2]} />,
    sphere: <sphereGeometry args={[1.6, 64, 64]} />,
    cone: <coneGeometry args={[1.2, 2.5, 32, 1]} />,
  }

  return (
    <mesh ref={meshRef} castShadow>
      {geometryProps[shape]}
      <meshStandardMaterial
        color={color}
        roughness={0.25}
        metalness={0.85}
        wireframe={wireframe}
        envMapIntensity={1.5}
      />
    </mesh>
  )
}

// ─── STL model ───────────────────────────────────────────────────────────────

function STLModel({ url, color, wireframe }: { url: string; color: string; wireframe: boolean }) {
  const geometry = useLoader(STLLoader, url)
  const meshRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    if (!geometry) return
    geometry.computeBoundingBox()
    const bbox = geometry.boundingBox!
    const center = new THREE.Vector3()
    bbox.getCenter(center)
    geometry.translate(-center.x, -center.y, -center.z)
    // Normalise scale to fit ~3 units
    const size = new THREE.Vector3()
    bbox.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 3 / maxDim
    if (meshRef.current) meshRef.current.scale.setScalar(scale)
  }, [geometry])

  return (
    <mesh ref={meshRef} castShadow receiveShadow geometry={geometry}>
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} wireframe={wireframe} />
    </mesh>
  )
}

// ─── OBJ model ───────────────────────────────────────────────────────────────

function OBJModel({ url, color, wireframe }: { url: string; color: string; wireframe: boolean }) {
  const obj = useLoader(OBJLoader, url)
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (!groupRef.current) return
    const box = new THREE.Box3().setFromObject(groupRef.current)
    const center = new THREE.Vector3()
    box.getCenter(center)
    groupRef.current.position.sub(center)
    const size = new THREE.Vector3()
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z)
    groupRef.current.scale.setScalar(3 / maxDim)
  })

  useEffect(() => {
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({
          color,
          roughness: 0.3,
          metalness: 0.7,
          wireframe,
        })
      }
    })
  }, [obj, color, wireframe])

  return <primitive ref={groupRef} object={obj} castShadow />
}

// ─── GLB/GLTF model ──────────────────────────────────────────────────────────

function GLBModel({ url, wireframe }: { url: string; wireframe: boolean }) {
  const { scene } = useLoader(GLTFLoader, url) as { scene: THREE.Group }
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (!groupRef.current) return
    const box = new THREE.Box3().setFromObject(groupRef.current)
    const center = new THREE.Vector3()
    box.getCenter(center)
    groupRef.current.position.sub(center)
    const size = new THREE.Vector3()
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z)
    groupRef.current.scale.setScalar(3 / maxDim)
    if (wireframe) {
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          ;(child.material as THREE.MeshStandardMaterial).wireframe = wireframe
        }
      })
    }
  })

  return <primitive ref={groupRef} object={scene} castShadow />
}

// ─── Scene wrapper ───────────────────────────────────────────────────────────

function SceneContent({
  fileUrl,
  fileFormat,
  placeholderShape,
  accentColor,
  wireframe,
  showGrid,
}: {
  fileUrl: string
  fileFormat: ModelFormat
  placeholderShape: ShapeType
  accentColor: string
  wireframe: boolean
  showGrid: boolean
}) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 6]} fov={45} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        dampingFactor={0.08}
        enableDamping
        minDistance={1.5}
        maxDistance={20}
      />
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-5, 3, -5]} intensity={0.5} color={accentColor} />
      <pointLight position={[0, 5, 0]} intensity={0.5} color={accentColor} distance={15} />

      <Suspense fallback={<Loader />}>
        {fileUrl ? (
          fileFormat === "stl" ? (
            <STLModel url={fileUrl} color={accentColor} wireframe={wireframe} />
          ) : fileFormat === "obj" ? (
            <OBJModel url={fileUrl} color={accentColor} wireframe={wireframe} />
          ) : (
            <GLBModel url={fileUrl} wireframe={wireframe} />
          )
        ) : (
          <PlaceholderMesh shape={placeholderShape} color={accentColor} wireframe={wireframe} />
        )}
        <Environment preset="city" />
      </Suspense>

      {showGrid && (
        <Grid
          args={[20, 20]}
          position={[0, -2, 0]}
          cellColor="rgba(255,255,255,0.1)"
          sectionColor="rgba(255,255,255,0.05)"
          cellSize={0.5}
          sectionSize={2}
          fadeDistance={15}
          infiniteGrid
        />
      )}
    </>
  )
}

// ─── Public component ─────────────────────────────────────────────────────────

interface ModelViewer3DProps {
  fileUrl: string
  fileFormat: ModelFormat
  placeholderShape: ShapeType
  accentColor: string
  className?: string
}

export function ModelViewer3D({
  fileUrl,
  fileFormat,
  placeholderShape,
  accentColor,
  className = "",
}: ModelViewer3DProps) {
  const [wireframe, setWireframe] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setFullscreen(true)
    } else {
      document.exitFullscreen()
      setFullscreen(false)
    }
  }

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", handler)
    return () => document.removeEventListener("fullscreenchange", handler)
  }, [])

  return (
    <div
      ref={containerRef}
      className={`relative rounded-2xl overflow-hidden bg-[#080810] ${className}`}
      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
      >
        <SceneContent
          fileUrl={fileUrl}
          fileFormat={fileFormat}
          placeholderShape={placeholderShape}
          accentColor={accentColor}
          wireframe={wireframe}
          showGrid={showGrid}
        />
      </Canvas>

      {/* Controls overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <ViewerButton
          icon={<Layers className="w-4 h-4" />}
          label="Wireframe"
          active={wireframe}
          onClick={() => setWireframe((v) => !v)}
        />
        <ViewerButton
          icon={<Grid3x3 className="w-4 h-4" />}
          label="Grid"
          active={showGrid}
          onClick={() => setShowGrid((v) => !v)}
        />
        <ViewerButton
          icon={fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
          onClick={toggleFullscreen}
        />
      </div>

      {/* Drag hint */}
      {!fileUrl && (
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs text-white/30 bg-black/30 border border-white/[0.06]">
          Placeholder · Add your STL to /public/models/
        </div>
      )}

      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs text-white/30 bg-black/30 border border-white/[0.06]">
        Drag to rotate · Scroll to zoom
      </div>
    </div>
  )
}

function ViewerButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer backdrop-blur-sm border"
      style={{
        background: active ? "var(--accent)" : "rgba(0,0,0,0.6)",
        borderColor: active ? "var(--accent)" : "rgba(255,255,255,0.1)",
        color: active ? "white" : "rgba(255,255,255,0.6)",
      }}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}
