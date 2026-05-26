// ─────────────────────────────────────────────
//  ADD YOUR REAL MODELS HERE
//  fileUrl: path inside /public/models/ folder
//  thumbnail: path inside /public/thumbnails/ OR leave "" for auto 3D preview
// ─────────────────────────────────────────────

export type ModelFormat = "stl" | "obj" | "glb" | "gltf" | "step"

export interface Model3D {
  id: string
  title: string
  description: string
  longDescription: string
  category: string
  tags: string[]
  /** Path to model file inside /public, e.g. "/models/gear.stl" — leave "" for placeholder */
  fileUrl: string
  fileFormat: ModelFormat
  fileSize: string
  polygons: number
  /** Gradient classes for card thumbnail when no image */
  gradient: string
  /** Accent colour used for card glow / viewer material */
  accentColor: string
  createdAt: string
  downloadCount: number
  printTime: string
  material: string
  dimensions: string
  /** Three.js placeholder shape when fileUrl is empty */
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
    downloadCount: 412,
    printTime: "6h 20m",
    material: "PETG / ABS",
    dimensions: "110 × 110 × 60 mm",
    placeholderShape: "torusKnot",
  },
  {
    id: "cable-management-clip",
    title: "Cable Management Clip",
    description: "Snap-fit desk cable organiser — fits 3–6 mm cables, mounts under any desk.",
    longDescription:
      "A parametric cable clip designed to keep your workspace tidy. The snap-fit lid opens without tools. Drill-free adhesive mount included in the same print. Scales cleanly from 50–200% without re-modelling.",
    category: "Functional",
    tags: ["cable", "desk", "organiser", "snap-fit"],
    fileUrl: "",
    fileFormat: "stl",
    fileSize: "0.8 MB",
    polygons: 12800,
    gradient: "from-emerald-900 via-teal-900 to-slate-900",
    accentColor: "#10b981",
    createdAt: "2024-12-01",
    downloadCount: 1089,
    printTime: "1h 10m",
    material: "PLA / PETG",
    dimensions: "45 × 22 × 18 mm",
    placeholderShape: "box",
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
    downloadCount: 763,
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
      "Features a friction-fit pivot that holds any angle from 30° to 90°. The base is weighted and anti-slip. Accommodates phones 60–90 mm wide with or without a case. Print the base and arm separately, then press-fit together.",
    category: "Functional",
    tags: ["phone", "stand", "desk", "gadget"],
    fileUrl: "",
    fileFormat: "stl",
    fileSize: "1.6 MB",
    polygons: 24600,
    gradient: "from-cyan-900 via-sky-900 to-slate-900",
    accentColor: "#06b6d4",
    createdAt: "2024-09-14",
    downloadCount: 2341,
    printTime: "2h 30m",
    material: "PLA / PETG",
    dimensions: "100 × 80 × 130 mm",
    placeholderShape: "torus",
  },
  {
    id: "architectural-column",
    title: "Corinthian Column Capital",
    description: "Highly detailed Corinthian capital — ideal for architectural scale models.",
    longDescription:
      "Modelled from classical proportions with every acanthus leaf individually detailed. Designed for 1:20 and 1:50 scale architectural presentations. Best printed in resin for full detail resolution, though FDM at 0.1 mm layer height also works well.",
    category: "Architectural",
    tags: ["architecture", "column", "classical", "resin"],
    fileUrl: "",
    fileFormat: "stl",
    fileSize: "8.2 MB",
    polygons: 180000,
    gradient: "from-amber-900 via-yellow-900 to-slate-900",
    accentColor: "#f59e0b",
    createdAt: "2024-08-30",
    downloadCount: 298,
    printTime: "9h 00m",
    material: "Resin / PLA 0.1 mm",
    dimensions: "60 × 60 × 80 mm",
    placeholderShape: "octahedron",
  },
  {
    id: "dragon-miniature",
    title: "Dragon Miniature",
    description: "High-detail fantasy dragon — tabletop-ready, pre-supported.",
    longDescription:
      "A fully sculpted dragon miniature at 32 mm heroic scale. Pre-supported for resin printing. All wing membranes, scales, and claws are individually modelled. Comes in two versions: dynamic pose and neutral display pose.",
    category: "Miniatures",
    tags: ["dragon", "fantasy", "miniature", "tabletop"],
    fileUrl: "",
    fileFormat: "stl",
    fileSize: "12.7 MB",
    polygons: 340000,
    gradient: "from-orange-900 via-red-900 to-slate-900",
    accentColor: "#f97316",
    createdAt: "2024-07-18",
    downloadCount: 587,
    printTime: "7h 30m",
    material: "Resin",
    dimensions: "80 × 60 × 90 mm",
    placeholderShape: "icosahedron",
  },
  {
    id: "hex-wrench-holder",
    title: "Hex Wrench Wall Mount",
    description: "Wall-mounted holder for hex/Allen keys — keeps your bench organised.",
    longDescription:
      "Magnetic hex-key organiser that mounts to any vertical surface via two M3 screws or 3M VHB tape. Holds 10 keys from 1.5 mm to 10 mm. Print in PLA, insert 10×2 mm neodymium magnets into the pockets, done.",
    category: "Functional",
    tags: ["tools", "storage", "workshop", "magnetic"],
    fileUrl: "",
    fileFormat: "stl",
    fileSize: "1.1 MB",
    polygons: 18200,
    gradient: "from-violet-900 via-purple-900 to-slate-900",
    accentColor: "#8b5cf6",
    createdAt: "2024-11-28",
    downloadCount: 934,
    printTime: "1h 50m",
    material: "PLA",
    dimensions: "200 × 40 × 20 mm",
    placeholderShape: "cone",
  },
  {
    id: "articulated-hand",
    title: "Articulated Hand",
    description: "Print-in-place fully articulated hand — no assembly, no hardware.",
    longDescription:
      "Every joint is printed in-place with 0.3 mm clearance gaps. After printing, simply flex the fingers a few times to free them. A satisfying desk toy and a great test of your printer's bridging and tolerance capabilities.",
    category: "Artistic",
    tags: ["articulated", "print-in-place", "hand", "flexi"],
    fileUrl: "",
    fileFormat: "stl",
    fileSize: "4.3 MB",
    polygons: 76000,
    gradient: "from-blue-900 via-indigo-900 to-slate-900",
    accentColor: "#3b82f6",
    createdAt: "2025-01-05",
    downloadCount: 1750,
    printTime: "4h 15m",
    material: "PLA / TPU",
    dimensions: "80 × 110 × 25 mm",
    placeholderShape: "torusKnot",
  },
]
