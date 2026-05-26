"use client"

import { Suspense, useRef, useState, useEffect, useCallback } from "react"
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber"
import {
  OrbitControls,
  Environment,
  Grid,
  PerspectiveCamera,
  Html,
  useProgress,
  ContactShadows,
} from "@react-three/drei"
import * as THREE from "three"
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js"
import {
  Grid3x3, Layers, Maximize2, Minimize2, RotateCcw,
  Camera, Sun, Box, Zap, Droplets, Play, Pause,
} from "lucide-react"
import { type ModelFormat } from "@/lib/models"

// ─── Types ────────────────────────────────────────────────────────────────────

type ShapeType = "torusKnot" | "icosahedron" | "torus" | "octahedron" | "box" | "sphere" | "cone"
type MaterialPreset = "metallic" | "matte" | "neon" | "glass" | "clay"
type EnvPreset = "city" | "studio" | "sunset" | "dawn" | "night"

// ─── Loading indicator ─────────────────────────────────────────────────────────

function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-14 h-14">
          <div
            className="absolute inset-0 rounded-full border-2 animate-spin"
            style={{ borderColor: "var(--accent) transparent var(--accent) var(--accent)" }}
          />
          <div
            className="absolute inset-2 rounded-full border animate-spin-reverse"
            style={{
              borderColor: `rgba(var(--accent-rgb),0.4) transparent transparent transparent`,
              animationDuration: "1.5s",
            }}
          />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-white/70 text-sm font-mono">{Math.round(progress)}%</span>
          <span className="text-white/30 text-xs">Loading model…</span>
        </div>
      </div>
    </Html>
  )
}

// ─── Material helper ──────────────────────────────────────────────────────────

function getMaterialProps(preset: MaterialPreset, color: string) {
  switch (preset) {
    case "metallic":
      return { roughness: 0.08, metalness: 0.95, envMapIntensity: 2.5, color }
    case "matte":
      return { roughness: 0.92, metalness: 0.0, envMapIntensity: 0.4, color }
    case "neon":
      return {
        roughness: 0.15, metalness: 0.6, envMapIntensity: 1.5, color,
        emissive: color, emissiveIntensity: 0.35,
      }
    case "glass":
      return {
        roughness: 0.0, metalness: 0.05, envMapIntensity: 3, color,
        transparent: true, opacity: 0.65,
      }
    case "clay":
      return { roughness: 0.85, metalness: 0.0, envMapIntensity: 0.6, color: "#d4a58a" }
    default:
      return { roughness: 0.08, metalness: 0.95, envMapIntensity: 2.5, color }
  }
}

// ─── Placeholder shapes ────────────────────────────────────────────────────────

function PlaceholderMesh({
  shape, matProps, wireframe, autoRotate,
}: {
  shape: ShapeType
  matProps: ReturnType<typeof getMaterialProps>
  wireframe: boolean
  autoRotate: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!meshRef.current || !groupRef.current) return
    const t = state.clock.elapsedTime
    if (autoRotate) {
      meshRef.current.rotation.y = t * 0.55
    }
    meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.18
    groupRef.current.position.y = Math.sin(t * 0.5) * 0.08
  })

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} castShadow receiveShadow>
        {shape === "torusKnot"   && <torusKnotGeometry args={[1, 0.32, 200, 16]} />}
        {shape === "icosahedron" && <icosahedronGeometry args={[1.6, 2]} />}
        {shape === "torus"       && <torusGeometry args={[1.2, 0.45, 32, 100]} />}
        {shape === "octahedron"  && <octahedronGeometry args={[1.7, 2]} />}
        {shape === "box"         && <boxGeometry args={[2.2, 2.2, 2.2]} />}
        {shape === "sphere"      && <sphereGeometry args={[1.6, 64, 64]} />}
        {shape === "cone"        && <coneGeometry args={[1.2, 2.5, 32, 1]} />}
        <meshStandardMaterial wireframe={wireframe} {...matProps} />
      </mesh>
      {/* Neon glow halo */}
      {matProps.emissive && (
        <mesh scale={1.08}>
          {shape === "torusKnot"   && <torusKnotGeometry args={[1, 0.32, 200, 16]} />}
          {shape === "icosahedron" && <icosahedronGeometry args={[1.6, 2]} />}
          {shape === "torus"       && <torusGeometry args={[1.2, 0.45, 32, 100]} />}
          {shape === "octahedron"  && <octahedronGeometry args={[1.7, 2]} />}
          {shape === "box"         && <boxGeometry args={[2.2, 2.2, 2.2]} />}
          {shape === "sphere"      && <sphereGeometry args={[1.6, 64, 64]} />}
          {shape === "cone"        && <coneGeometry args={[1.2, 2.5, 32, 1]} />}
          <meshBasicMaterial color={matProps.emissive} transparent opacity={0.06} />
        </mesh>
      )}
    </group>
  )
}

// ─── STL model ────────────────────────────────────────────────────────────────

function STLModel({
  url, matProps, wireframe, autoRotate,
}: {
  url: string
  matProps: ReturnType<typeof getMaterialProps>
  wireframe: boolean
  autoRotate: boolean
}) {
  const geometry = useLoader(STLLoader, url)
  const meshRef  = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (!geometry || !meshRef.current) return
    geometry.computeBoundingBox()
    const bbox = geometry.boundingBox
    if (!bbox) return
    const center = new THREE.Vector3()
    bbox.getCenter(center)
    geometry.translate(-center.x, -center.y, -center.z)
    const size = new THREE.Vector3()
    bbox.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z)
    meshRef.current.scale.setScalar(3.2 / maxDim)
  }, [geometry])

  useFrame((state) => {
    if (!meshRef.current || !groupRef.current) return
    const t = state.clock.elapsedTime
    if (autoRotate) {
      meshRef.current.rotation.y = t * 0.45
    }
    groupRef.current.position.y = Math.sin(t * 0.4) * 0.06
  })

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} castShadow receiveShadow geometry={geometry}>
        <meshStandardMaterial wireframe={wireframe} {...matProps} />
      </mesh>
    </group>
  )
}

// ─── OBJ model ────────────────────────────────────────────────────────────────

function OBJModel({
  url, matProps, wireframe, autoRotate,
}: {
  url: string
  matProps: ReturnType<typeof getMaterialProps>
  wireframe: boolean
  autoRotate: boolean
}) {
  const obj      = useLoader(OBJLoader, url)
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(obj)
    const center = new THREE.Vector3()
    box.getCenter(center)
    obj.position.sub(center)
    const size = new THREE.Vector3()
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z)
    obj.scale.setScalar(3.2 / maxDim)

    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({ ...matProps, wireframe })
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [obj, matProps, wireframe])

  useFrame((state) => {
    if (!obj || !groupRef.current) return
    const t = state.clock.elapsedTime
    if (autoRotate) obj.rotation.y = t * 0.45
    groupRef.current.position.y = Math.sin(t * 0.4) * 0.06
  })

  return <group ref={groupRef}><primitive object={obj} /></group>
}

// ─── Camera intro animation ───────────────────────────────────────────────────

function CameraIntro() {
  const { camera } = useThree()
  const started = useRef(false)

  useFrame((state) => {
    if (started.current) return
    const t = Math.min(state.clock.elapsedTime / 1.8, 1)
    const eased = 1 - Math.pow(1 - t, 3)
    const startZ = 14
    const endZ = 6
    camera.position.z = startZ + (endZ - startZ) * eased
    if (t >= 1) started.current = true
  })

  return null
}

// ─── Scene content ────────────────────────────────────────────────────────────

function SceneContent({
  fileUrl, fileFormat, placeholderShape, accentColor,
  wireframe, showGrid, material, env, autoRotate,
}: {
  fileUrl: string; fileFormat: ModelFormat; placeholderShape: ShapeType
  accentColor: string; wireframe: boolean; showGrid: boolean
  material: MaterialPreset; env: EnvPreset; autoRotate: boolean
}) {
  const matProps = getMaterialProps(material, accentColor)

  const envPresets: Record<EnvPreset, "city" | "studio" | "sunset" | "dawn" | "night"> = {
    city: "city", studio: "studio", sunset: "sunset", dawn: "dawn", night: "night",
  }

  return (
    <>
      <CameraIntro />
      <PerspectiveCamera makeDefault position={[0, 1.5, 6]} fov={42} />
      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        dampingFactor={0.06}
        enableDamping
        minDistance={1.5}
        maxDistance={22}
        autoRotate={autoRotate}
        autoRotateSpeed={1.8}
      />

      {/* Lighting */}
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[6, 9, 6]} intensity={1.8} castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={30}
      />
      <directionalLight position={[-4, 4, -6]} intensity={0.7} color={accentColor} />
      <pointLight position={[0, 6, 0]} intensity={0.8} color={accentColor} distance={18} />
      <pointLight position={[4, -2, 4]} intensity={0.4} color="#ffffff" distance={14} />
      {material === "neon" && (
        <>
          <pointLight position={[0, 0, 4]}  intensity={2} color={accentColor} distance={10} />
          <pointLight position={[0, 0, -4]} intensity={1} color={accentColor} distance={10} />
        </>
      )}

      {/* Model */}
      <Suspense fallback={<Loader />}>
        {fileUrl ? (
          fileFormat === "stl" ? (
            <STLModel url={fileUrl} matProps={matProps} wireframe={wireframe} autoRotate={autoRotate} />
          ) : fileFormat === "obj" ? (
            <OBJModel url={fileUrl} matProps={matProps} wireframe={wireframe} autoRotate={autoRotate} />
          ) : (
            <PlaceholderMesh shape={placeholderShape} matProps={matProps} wireframe={wireframe} autoRotate={autoRotate} />
          )
        ) : (
          <PlaceholderMesh shape={placeholderShape} matProps={matProps} wireframe={wireframe} autoRotate={autoRotate} />
        )}
        <Environment preset={envPresets[env]} />
        <ContactShadows
          position={[0, -2.5, 0]}
          opacity={0.5}
          scale={10}
          blur={2.5}
          color={accentColor}
        />
      </Suspense>

      {showGrid && (
        <Grid
          args={[24, 24]}
          position={[0, -2.5, 0]}
          cellColor={`${accentColor}30`}
          sectionColor={`${accentColor}15`}
          cellSize={0.5}
          sectionSize={2}
          fadeDistance={18}
          infiniteGrid
        />
      )}
    </>
  )
}

// ─── Toolbar button ────────────────────────────────────────────────────────────

function ToolBtn({
  icon, label, active, onClick, small,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick: (e?: React.MouseEvent) => void
  small?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex items-center gap-1.5 ${small ? "px-2.5 py-1.5" : "px-3 py-2"} rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer backdrop-blur-sm border`}
      style={{
        background: active ? "var(--accent)" : "rgba(0,0,0,0.65)",
        borderColor: active ? "var(--accent)" : "rgba(255,255,255,0.12)",
        color: active ? "white" : "rgba(255,255,255,0.65)",
        boxShadow: active ? "0 0 12px var(--accent-glow)" : undefined,
      }}
    >
      {icon}
      {!small && <span className="hidden sm:inline">{label}</span>}
    </button>
  )
}

// ─── Screenshot helper ────────────────────────────────────────────────────────

function ScreenshotBtn({ canvasRef }: { canvasRef: React.RefObject<HTMLDivElement | null> }) {
  const handleShot = () => {
    const canvas = canvasRef.current?.querySelector("canvas")
    if (!canvas) return
    const url = canvas.toDataURL("image/png")
    const a = document.createElement("a")
    a.href = url
    a.download = "model-preview.png"
    a.click()
  }
  return (
    <ToolBtn icon={<Camera className="w-3.5 h-3.5" />} label="Screenshot" onClick={handleShot} />
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

interface ModelViewer3DProps {
  fileUrl: string
  fileFormat: ModelFormat
  placeholderShape: ShapeType
  accentColor: string
  className?: string
}

const MAT_OPTS: { key: MaterialPreset; label: string; icon: React.ReactNode }[] = [
  { key: "metallic", label: "Metal",  icon: <Box       className="w-3.5 h-3.5" /> },
  { key: "matte",    label: "Matte",  icon: <Droplets  className="w-3.5 h-3.5" /> },
  { key: "neon",     label: "Neon",   icon: <Zap       className="w-3.5 h-3.5" /> },
  { key: "glass",    label: "Glass",  icon: <Layers    className="w-3.5 h-3.5" /> },
  { key: "clay",     label: "Clay",   icon: <Sun       className="w-3.5 h-3.5" /> },
]

const ENV_OPTS: { key: EnvPreset; label: string }[] = [
  { key: "city",   label: "City"   },
  { key: "studio", label: "Studio" },
  { key: "sunset", label: "Sunset" },
  { key: "dawn",   label: "Dawn"   },
  { key: "night",  label: "Night"  },
]

export function ModelViewer3D({
  fileUrl, fileFormat, placeholderShape, accentColor, className = "",
}: ModelViewer3DProps) {
  const [wireframe,   setWireframe]   = useState(false)
  const [showGrid,    setShowGrid]    = useState(true)
  const [fullscreen,  setFullscreen]  = useState(false)
  const [autoRotate,  setAutoRotate]  = useState(true)
  const [material,    setMaterial]    = useState<MaterialPreset>("metallic")
  const [env,         setEnv]         = useState<EnvPreset>("city")
  const [showMatMenu, setShowMatMenu] = useState(false)
  const [showEnvMenu, setShowEnvMenu] = useState(false)

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

  // Close menus on outside click
  useEffect(() => {
    const h = () => { setShowMatMenu(false); setShowEnvMenu(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  return (
    <div
      ref={containerRef}
      className={`relative rounded-2xl overflow-hidden ${className}`}
      style={{
        background: "#06060f",
        border: "1px solid rgba(255,255,255,0.08)",
        minHeight: 400,
      }}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 45%, ${accentColor}10 0%, transparent 70%)`,
        }}
      />

      <Canvas
        shadows
        gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
        style={{ width: "100%", height: "100%", background: "transparent", position: "relative", zIndex: 1 }}
      >
        <SceneContent
          fileUrl={fileUrl}
          fileFormat={fileFormat}
          placeholderShape={placeholderShape}
          accentColor={accentColor}
          wireframe={wireframe}
          showGrid={showGrid}
          material={material}
          env={env}
          autoRotate={autoRotate}
        />
      </Canvas>

      {/* ── Top-left: hints ── */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        {!fileUrl && (
          <div className="px-2.5 py-1 rounded-full text-xs text-white/35 bg-black/40 border border-white/[0.07] backdrop-blur-sm">
            Placeholder · add STL to /public/models/
          </div>
        )}
      </div>

      {/* ── Top-right: controls ── */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        <div className="px-2.5 py-1 rounded-full text-xs text-white/30 bg-black/40 border border-white/[0.07] backdrop-blur-sm">
          Drag · Scroll
        </div>
        <ScreenshotBtn canvasRef={containerRef} />
      </div>

      {/* ── Material menu ── */}
      {showMatMenu && (
        <div
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex flex-col gap-1 p-2 rounded-xl backdrop-blur-xl"
          style={{ background: "rgba(6,6,18,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {MAT_OPTS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => { setMaterial(opt.key); setShowMatMenu(false) }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer text-left"
              style={{
                background: material === opt.key ? "var(--accent)" : "rgba(255,255,255,0.04)",
                color: material === opt.key ? "white" : "rgba(255,255,255,0.6)",
              }}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Environment menu ── */}
      {showEnvMenu && (
        <div
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex flex-col gap-1 p-2 rounded-xl backdrop-blur-xl"
          style={{ background: "rgba(6,6,18,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {ENV_OPTS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => { setEnv(opt.key); setShowEnvMenu(false) }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer"
              style={{
                background: env === opt.key ? "var(--accent)" : "rgba(255,255,255,0.04)",
                color: env === opt.key ? "white" : "rgba(255,255,255,0.6)",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Bottom control bar ── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 flex-wrap justify-center px-3">

        {/* Auto-rotate */}
        <ToolBtn
          icon={autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          label={autoRotate ? "Pause rotation" : "Auto rotate"}
          active={autoRotate}
          onClick={() => setAutoRotate((v) => !v)}
        />

        {/* Wireframe */}
        <ToolBtn
          icon={<Layers className="w-3.5 h-3.5" />}
          label="Wireframe"
          active={wireframe}
          onClick={() => setWireframe((v) => !v)}
        />

        {/* Grid */}
        <ToolBtn
          icon={<Grid3x3 className="w-3.5 h-3.5" />}
          label="Grid"
          active={showGrid}
          onClick={() => setShowGrid((v) => !v)}
        />

        {/* Material picker */}
        <div className="relative">
          <ToolBtn
            icon={<Box className="w-3.5 h-3.5" />}
            label={`Material: ${MAT_OPTS.find((m) => m.key === material)?.label ?? "Metal"}`}
            active={showMatMenu}
            onClick={(e) => { e?.stopPropagation(); setShowMatMenu((v) => !v); setShowEnvMenu(false) }}
          />
        </div>

        {/* Env picker */}
        <div className="relative">
          <ToolBtn
            icon={<Sun className="w-3.5 h-3.5" />}
            label={`Env: ${env}`}
            active={showEnvMenu}
            onClick={(e) => { e?.stopPropagation(); setShowEnvMenu((v) => !v); setShowMatMenu(false) }}
          />
        </div>

        {/* Reset camera */}
        <ToolBtn
          icon={<RotateCcw className="w-3.5 h-3.5" />}
          label="Reset view"
          onClick={() => {
            // Trigger a page-level camera reset — simplest is to toggle autoRotate
            setAutoRotate(true)
          }}
          small
        />

        {/* Fullscreen */}
        <ToolBtn
          icon={fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
          onClick={toggleFullscreen}
          small
        />
      </div>
    </div>
  )
}
