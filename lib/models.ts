// ─────────────────────────────────────────────
//  ADD YOUR REAL MODELS HERE
//  fileUrl: path inside /public/models/ folder  e.g. "/models/my-model.stl"
//  Leave fileUrl as "" to show an animated 3D placeholder instead
// ─────────────────────────────────────────────

export type ModelFormat = "stl" | "obj" | "glb" | "gltf" | "step"

export interface Model3D {
  id: string
  title: string
  description: string
  longDescription: string
  category: string
  tags: string[]
  /** Web path to model file inside /public — e.g. "/models/gear.stl". Leave "" for placeholder. */
  fileUrl: string
  fileFormat: ModelFormat
  fileSize: string
  polygons: number
  /** Tailwind gradient classes for the card thumbnail */
  gradient: string
  /** Accent colour used for card glow and viewer material */
  accentColor: string
  createdAt: string
  downloadCount: number
  printTime: string
  material: string
  dimensions: string
  /** Three.js shape shown when fileUrl is empty */
  placeholderShape: "torusKnot" | "icosahedron" | "torus" | "octahedron" | "box" | "sphere" | "cone"
}

export const CATEGORIES = [
  "All",
  "Mechanical",
  "Architectural",
  "Artistic",
  "Functional",
  "Miniatures",
] as const

export const MODELS: Model3D[] = [
  // ── YOUR REAL MODELS ──────────────────────────────────────────────────────
  {
    id: "thors-hammer",
    title: "Thor's Hammer",
    description: "Mjolnir replica — printable prop with Marvel-accurate proportions.",
    longDescription:
      "A highly detailed replica of Thor's Hammer (Mjolnir) from the Marvel universe. Designed with accurate proportions for a stunning display piece or cosplay prop. Print in PLA at 0.2 mm layer height for a great surface finish.",
    category: "Artistic",
    tags: ["Marvel", "Thor", "Mjolnir", "prop", "cosplay"],
    fileUrl: "/models/thor_hammar.stl",   // ← your STL file in public/models/
    fileFormat: "stl",
    fileSize: "9.42 MB",
    polygons: 120000,
    gradient: "from-slate-800 via-zinc-900 to-gray-900",
    accentColor: "#94a3b8",
    createdAt: "2025-01-01",
    downloadCount: 0,
    printTime: "5h 32m",
    material: "PLA",
    dimensions: "70 × 110 × 250 mm",
    placeholderShape: "box",
  },

  // ── SAMPLE PLACEHOLDERS (delete these when you add your own models) ───────
  {
    id: "planetary-gear-set",
    title: "Planetary Gear Set",
    description: "5:1 ratio reduction planetary gearbox — fully printable, no glue needed.",
    longDescription:
      "A precision-tolerance planetary gear system designed for robotics and motorised builds. All gears interlock with 0.2 mm clearance for smooth rotation straight off the print bed. Print in PETG for best results. No supports required.",
    category: "Mechanical",
    tags: ["gears", "robotics", "mechanical", "PETG"],
    fileUrl: "",
    fileFormat: "stl",
    fileSize: "3.1 MB",
    polygons: 62400,
    gradient: "from-indigo-900 via-violet-900 to-slate-900",
    accentColor: "#6366f1",
    createdAt: "2024-11-10",
    downloadCount: 0,
    printTime: "6h 20m",
    material: "PETG / ABS",
    dimensions: "110 × 110 × 60 mm",
    placeholderShape: "torusKnot",
  },
  {
    id: "voronoi-vase",
    title: "Voronoi Vase",
    description: "Organic lattice vase — vase mode, no supports, striking on any shelf.",
    longDescription:
      "Generated from a Voronoi algorithm and post-processed in Fusion 360 for watertight walls. Print in vase/spiral mode for a seamless look. Translucent filaments look especially stunning with a candle inside.",
    category: "Artistic",
    tags: ["vase", "voronoi", "decor", "vase-mode"],
    fileUrl: "",
    fileFormat: "stl",
    fileSize: "5.4 MB",
    polygons: 98000,
    gradient: "from-pink-900 via-rose-900 to-slate-900",
    accentColor: "#f43f5e",
    createdAt: "2024-10-22",
    downloadCount: 0,
    printTime: "3h 45m",
    material: "PLA (silk or translucent)",
    dimensions: "90 × 90 × 200 mm",
    placeholderShape: "sphere",
  },
  {
    id: "phone-stand-adjustable",
    title: "Adjustable Phone Stand",
    description: "360° rotating, multi-angle phone holder — works for any phone size.",
    longDescription:
      "Features a friction-fit pivot that holds any angle from 30° to 90°. The base is weighted and anti-slip. Accommodates phones 60–90 mm wide with or without a case.",
    category: "Functional",
    tags: ["phone", "stand", "desk", "gadget"],
    fileUrl: "",
    fileFormat: "stl",
    fileSize: "1.6 MB",
    polygons: 24600,
    gradient: "from-cyan-900 via-sky-900 to-slate-900",
    accentColor: "#06b6d4",
    createdAt: "2024-09-14",
    downloadCount: 0,
    printTime: "2h 30m",
    material: "PLA / PETG",
    dimensions: "100 × 80 × 130 mm",
    placeholderShape: "torus",
  },
  {
    id: "hex-wrench-holder",
    title: "Hex Wrench Wall Mount",
    description: "Wall-mounted holder for hex/Allen keys — keeps your bench organised.",
    longDescription:
      "Magnetic hex-key organiser that mounts to any vertical surface via two M3 screws or 3M VHB tape. Holds 10 keys from 1.5 mm to 10 mm.",
    category: "Functional",
    tags: ["tools", "storage", "workshop", "magnetic"],
    fileUrl: "",
    fileFormat: "stl",
    fileSize: "1.1 MB",
    polygons: 18200,
    gradient: "from-violet-900 via-purple-900 to-slate-900",
    accentColor: "#8b5cf6",
    createdAt: "2024-11-28",
    downloadCount: 0,
    printTime: "1h 50m",
    material: "PLA",
    dimensions: "200 × 40 × 20 mm",
    placeholderShape: "cone",
  },
]
