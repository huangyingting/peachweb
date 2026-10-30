import type { PeachDocumentState } from "./document-types";
import {
  PEACH_TEMPLATES_CATALOG,
  createDefaultSceneState,
  createDefaultUiState,
} from "./templates-catalog";

export const REMIX_CATEGORIES = [
  "Agency",
  "AI Tools",
  "Consulting",
  "CRM",
  "Finance",
  "Investor",
  "SAAS",
  "Sales & Marketing",
] as const;

export const REMIX_STYLE_COLLECTIONS = [
  {
    id: "futuristic-glass",
    name: "Futuristic Glass",
    tagline: "Iridescent glassmorphic layers with neon peach highlights",
    previewGradient: "linear-gradient(135deg, #ff6b4a 0%, #9333ea 60%, #090a10 100%)",
    palette: {
      primary: "#ff6b4a",
      secondary: "#9333ea",
      accent: "#38bdf8",
      background: "#090a10",
      surface: "#141625",
      text: "#f8fafc",
    },
  },
  {
    id: "cyber-chrome",
    name: "Cyber Chrome",
    tagline: "High-metalness liquid chrome with electric cyan bloom",
    previewGradient: "linear-gradient(135deg, #38bdf8 0%, #6366f1 60%, #070b14 100%)",
    palette: {
      primary: "#38bdf8",
      secondary: "#6366f1",
      accent: "#f43f5e",
      background: "#070b14",
      surface: "#111827",
      text: "#f8fafc",
    },
  },
  {
    id: "vibrant-gradient",
    name: "Vibrant Gradient",
    tagline: "Warm solar coral and amber gradients for bold brand launches",
    previewGradient: "linear-gradient(135deg, #f43f5e 0%, #fb923c 60%, #18181b 100%)",
    palette: {
      primary: "#f43f5e",
      secondary: "#fb923c",
      accent: "#facc15",
      background: "#121016",
      surface: "#1f1b24",
      text: "#fafafa",
    },
  },
  {
    id: "dark-obsidian",
    name: "Dark Obsidian",
    tagline: "Luxury matte obsidian with brushed gold specular reflections",
    previewGradient: "linear-gradient(135deg, #f59e0b 0%, #78350f 60%, #09090b 100%)",
    palette: {
      primary: "#f59e0b",
      secondary: "#ea580c",
      accent: "#fde047",
      background: "#09090b",
      surface: "#18181b",
      text: "#fafaf9",
    },
  },
  {
    id: "editorial-minimal",
    name: "Editorial Minimal",
    tagline: "Emerald and sky crystalline geometry with crisp typography",
    previewGradient: "linear-gradient(135deg, #10b981 0%, #0ea5e9 60%, #061318 100%)",
    palette: {
      primary: "#10b981",
      secondary: "#0ea5e9",
      accent: "#34d399",
      background: "#061318",
      surface: "#0f222a",
      text: "#f0fdf4",
    },
  },
  {
    id: "organic-spatial",
    name: "Organic Spatial",
    tagline: "Soft magenta and violet atmospheric depth for storytelling",
    previewGradient: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 60%, #0f0720 100%)",
    palette: {
      primary: "#ec4899",
      secondary: "#8b5cf6",
      accent: "#f472b6",
      background: "#0f0720",
      surface: "#1c1033",
      text: "#fdf2f8",
    },
  },
] as const;

export interface RemixSynthesisInput {
  category: string;
  businessName: string;
  businessDescription: string;
  collectionId: string;
  templateId: string;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
}

export function synthesizeRemixDocument(input: RemixSynthesisInput): PeachDocumentState & {
  name: string;
  slug: string;
  category: string;
  styleCollectionId: string;
  templateId: string;
  thumbnailGradient: string;
} {
  const matchedTemplate =
    PEACH_TEMPLATES_CATALOG.find((t) => t.id === input.templateId) ??
    PEACH_TEMPLATES_CATALOG[0];

  const brand = input.businessName.trim() || "PeachWeb 3D Studio";
  const slugBase =
    brand
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "peachweb-3d-site";
  const desc =
    input.businessDescription.trim() ||
    `An interactive 3D ${input.category} platform built for high-converting spatial experiences.`;

  const heroPrimitives: Record<string, "torus" | "icosahedron" | "cylinder" | "sphere" | "box" | "ring"> = {
    "121": "torus",
    "122": "icosahedron",
    "123": "cylinder",
    "124": "ring",
    "125": "box",
    "126": "sphere",
  };

  const uiState = createDefaultUiState({
    brandName: brand,
    headline: `${brand} — Next-Gen ${input.category} in Interactive 3D.`,
    subheadline: desc,
    ctaLabel: `Explore ${brand}`,
    primaryColor: input.palette.primary,
    secondaryColor: input.palette.secondary,
    accentColor: input.palette.accent,
    backgroundColor: input.palette.background,
    surfaceColor: input.palette.surface,
    textColor: input.palette.text,
  });

  const sceneState = createDefaultSceneState({
    primaryColor: input.palette.primary,
    secondaryColor: input.palette.secondary,
    accentColor: input.palette.accent,
    backgroundColor: input.palette.background,
    preset: matchedTemplate.sceneState.environment.preset,
    heroPrimitive: heroPrimitives[matchedTemplate.id] ?? "torus",
  });

  return {
    name: brand,
    slug: `${slugBase}-${Math.random().toString(36).slice(2, 6)}`,
    category: input.category || matchedTemplate.category,
    styleCollectionId: input.collectionId,
    templateId: matchedTemplate.id,
    thumbnailGradient: `linear-gradient(135deg, ${input.palette.primary} 0%, ${input.palette.secondary} 50%, ${input.palette.background} 100%)`,
    uiState,
    sceneState,
  };
}
