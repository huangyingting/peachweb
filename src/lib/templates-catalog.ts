import type { PeachSceneState, PeachUiState } from "./document-types";

export interface PeachTemplateBlueprint {
  id: string;
  name: string;
  slug: string;
  category:
    | "SAAS"
    | "AI Tools"
    | "Agency"
    | "Portfolio"
    | "E-Commerce"
    | "Finance"
    | "Storytelling"
    | "Consulting"
    | "CRM"
    | "Investor"
    | "Sales & Marketing";
  styleCollection: string;
  description: string;
  badge: string;
  author: string;
  thumbnailGradient: string;
  accentColor: string;
  tags: string[];
  uiState: PeachUiState;
  sceneState: PeachSceneState;
}

export function createDefaultSceneState(options?: {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  preset?: PeachSceneState["environment"]["preset"];
  heroPrimitive?: "torus" | "icosahedron" | "cylinder" | "sphere" | "box" | "ring";
}): PeachSceneState {
  const primary = options?.primaryColor ?? "#ff6b4a";
  const secondary = options?.secondaryColor ?? "#a855f7";
  const accent = options?.accentColor ?? "#38bdf8";
  const bg = options?.backgroundColor ?? "#090a10";
  const heroType = options?.heroPrimitive ?? "torus";

  return {
    environment: {
      backgroundColor: bg,
      secondaryGradientColor: secondary,
      fogColor: bg,
      fogDensity: 0.04,
      ambientIntensity: 0.9,
      preset: options?.preset ?? "peach-aurora",
      gridVisible: false,
    },
    camera: {
      fov: 45,
      position: { x: 0, y: 0.8, z: 6.5 },
      target: { x: 0, y: 0, z: 0 },
      exposure: 1.15,
    },
    postProcessing: {
      bloomEnabled: true,
      bloomIntensity: 1.25,
      bloomThreshold: 0.35,
      noiseEnabled: true,
      noiseOpacity: 0.04,
      vignetteEnabled: true,
    },
    lights: [
      {
        id: "light-ambient",
        name: "Studio Ambient Light",
        type: "ambient",
        color: "#ffffff",
        intensity: 0.85,
        position: { x: 0, y: 4, z: 0 },
        visible: true,
      },
      {
        id: "light-key",
        name: "Peach Key Directional",
        type: "directional",
        color: primary,
        intensity: 2.6,
        position: { x: 4, y: 5, z: 4 },
        visible: true,
      },
      {
        id: "light-rim",
        name: "Violet Rim Point",
        type: "point",
        color: secondary,
        intensity: 2.2,
        position: { x: -4, y: -2, z: 3 },
        visible: true,
      },
    ],
    objects: [
      {
        id: "mesh-hero-core",
        name: "Hero Core Sculpture",
        type: heroType,
        visible: true,
        position: { x: 1.35, y: 0.15, z: 0 },
        rotation: { x: 0.45, y: 0.65, z: 0.15 },
        scale: { x: 1.35, y: 1.35, z: 1.35 },
        material: {
          color: primary,
          emissive: secondary,
          emissiveIntensity: 0.32,
          metalness: 0.78,
          roughness: 0.18,
          opacity: 1,
          wireframe: false,
          transmission: 0.25,
        },
        floatAnimation: {
          enabled: true,
          speed: 1.2,
          amplitude: 0.22,
          rotationSpeed: 0.45,
        },
      },
      {
        id: "mesh-orbital-ring",
        name: "Orbital Halo Ring",
        type: "ring",
        visible: true,
        position: { x: 1.35, y: 0.15, z: -0.4 },
        rotation: { x: 1.05, y: -0.35, z: 0.2 },
        scale: { x: 2.1, y: 2.1, z: 2.1 },
        material: {
          color: accent,
          emissive: accent,
          emissiveIntensity: 0.45,
          metalness: 0.9,
          roughness: 0.12,
          opacity: 0.9,
          wireframe: false,
        },
        floatAnimation: {
          enabled: true,
          speed: 0.85,
          amplitude: 0.12,
          rotationSpeed: -0.35,
        },
      },
      {
        id: "mesh-satellite-sphere",
        name: "Iridescent Satellite Orb",
        type: "sphere",
        visible: true,
        position: { x: -2.1, y: 1.25, z: -1.2 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 0.68, y: 0.68, z: 0.68 },
        material: {
          color: secondary,
          emissive: primary,
          emissiveIntensity: 0.25,
          metalness: 0.85,
          roughness: 0.1,
          opacity: 1,
          wireframe: false,
        },
        floatAnimation: {
          enabled: true,
          speed: 1.5,
          amplitude: 0.28,
          rotationSpeed: 0.25,
        },
      },
    ],
    keyframes: [
      {
        id: "kf-hero",
        scrollProgress: 0,
        label: "0% — Hero Entrance",
        cameraPosition: { x: 0, y: 0.8, z: 6.5 },
        cameraTarget: { x: 0, y: 0, z: 0 },
        objectTransforms: {
          "mesh-hero-core": {
            position: { x: 1.35, y: 0.15, z: 0 },
            rotation: { x: 0.45, y: 0.65, z: 0.15 },
            scale: { x: 1.35, y: 1.35, z: 1.35 },
          },
        },
      },
      {
        id: "kf-features",
        scrollProgress: 0.5,
        label: "50% — Spatial Feature Orbit",
        cameraPosition: { x: -1.4, y: 1.2, z: 5.2 },
        cameraTarget: { x: 0.2, y: 0.1, z: 0 },
        objectTransforms: {
          "mesh-hero-core": {
            position: { x: 0, y: 0.3, z: 0.4 },
            rotation: { x: 1.85, y: 2.1, z: 0.6 },
            scale: { x: 1.65, y: 1.65, z: 1.65 },
          },
        },
      },
      {
        id: "kf-cta",
        scrollProgress: 1,
        label: "100% — Finale Close-Up",
        cameraPosition: { x: 0, y: 0.2, z: 4.3 },
        cameraTarget: { x: 0, y: 0, z: 0 },
        objectTransforms: {
          "mesh-hero-core": {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 3.14, y: 3.8, z: 1.1 },
            scale: { x: 1.9, y: 1.9, z: 1.9 },
          },
        },
      },
    ],
  };
}

export function createDefaultUiState(options?: {
  brandName?: string;
  headline?: string;
  subheadline?: string;
  ctaLabel?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  surfaceColor?: string;
  textColor?: string;
}): PeachUiState {
  const brandName = options?.brandName ?? "PeachWeb Studio";
  const headline =
    options?.headline ?? "Build Spatial 3D Websites That Captivate Instantly.";
  const subheadline =
    options?.subheadline ??
    "Combine real-time WebGL 3D scenes, scroll-choreographed camera animations, and responsive flexbox layouts in one intuitive no-code studio.";
  const ctaLabel = options?.ctaLabel ?? "Launch Interactive Experience";
  const primary = options?.primaryColor ?? "#ff6b4a";
  const secondary = options?.secondaryColor ?? "#a855f7";
  const accent = options?.accentColor ?? "#38bdf8";
  const background = options?.backgroundColor ?? "#090a10";
  const surface = options?.surfaceColor ?? "#131522";
  const text = options?.textColor ?? "#f8fafc";

  return {
    activePageId: "page-home",
    palette: {
      primary,
      secondary,
      accent,
      background,
      surface,
      text,
    },
    typography: {
      headingFont: "Inter, system-ui, sans-serif",
      bodyFont: "Inter, system-ui, sans-serif",
      baseSize: 16,
    },
    pages: [
      {
        id: "page-home",
        name: "Home",
        slug: "/",
        elements: [
          {
            id: "el-hero-section",
            type: "section",
            name: "Hero Section",
            scrollProgressTarget: 0,
            styles: {
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              gap: 20,
              paddingTop: 96,
              paddingRight: 48,
              paddingBottom: 96,
              paddingLeft: 48,
              backgroundColor: "transparent",
              color: text,
            },
            children: [
              {
                id: "el-hero-badge",
                type: "badge",
                name: "Category Badge",
                content: `${brandName} • Next-Gen 3D Web Experience`,
                styles: {
                  fontSize: 13,
                  fontWeight: "600",
                  color: primary,
                  backgroundColor: "rgba(255, 107, 74, 0.14)",
                  paddingTop: 6,
                  paddingRight: 14,
                  paddingBottom: 6,
                  paddingLeft: 14,
                  borderRadius: 999,
                  borderColor: primary,
                  borderWidth: 1,
                },
              },
              {
                id: "el-hero-heading",
                type: "heading",
                name: "Hero Title",
                content: headline,
                styles: {
                  fontSize: 54,
                  fontWeight: "800",
                  color: text,
                  textAlign: "left",
                  width: "62%",
                },
                responsiveOverrides: {
                  tablet: { fontSize: 40, width: "85%" },
                  mobile: { fontSize: 30, width: "100%" },
                },
              },
              {
                id: "el-hero-subtitle",
                type: "text",
                name: "Hero Subtitle",
                content: subheadline,
                styles: {
                  fontSize: 18,
                  fontWeight: "400",
                  color: "#cbd5e1",
                  width: "56%",
                },
                responsiveOverrides: {
                  tablet: { fontSize: 16, width: "80%" },
                  mobile: { fontSize: 15, width: "100%" },
                },
              },
              {
                id: "el-hero-cta",
                type: "button",
                name: "Primary CTA Button",
                content: ctaLabel,
                href: "#features",
                styles: {
                  fontSize: 15,
                  fontWeight: "700",
                  color: "#ffffff",
                  backgroundColor: primary,
                  paddingTop: 14,
                  paddingRight: 28,
                  paddingBottom: 14,
                  paddingLeft: 28,
                  borderRadius: 999,
                },
                hoverStyles: {
                  opacity: 0.9,
                },
              },
            ],
          },
          {
            id: "el-features-section",
            type: "section",
            name: "Spatial Capabilities Section",
            scrollProgressTarget: 0.5,
            styles: {
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              gap: 24,
              paddingTop: 88,
              paddingRight: 48,
              paddingBottom: 88,
              paddingLeft: 48,
              backgroundColor: "rgba(19, 21, 34, 0.55)",
              borderRadius: 24,
            },
            children: [
              {
                id: "el-features-heading",
                type: "heading",
                name: "Features Title",
                content: `Why ${brandName} Stands Out in 3D`,
                styles: {
                  fontSize: 36,
                  fontWeight: "700",
                  color: text,
                },
              },
              {
                id: "el-features-copy",
                type: "text",
                name: "Features Description",
                content:
                  "Scroll-bound camera keyframes, real-time PBR materials, bloom shaders, and responsive DOM overlays engineered for 60fps performance across desktop, tablet, and mobile.",
                styles: {
                  fontSize: 16,
                  fontWeight: "400",
                  color: "#94a3b8",
                  width: "65%",
                },
              },
              {
                id: "el-feature-card-1",
                type: "card",
                name: "Feature Card — Interactive WebGL",
                content:
                  "Real-Time 3D Viewport • Dynamic lighting, metallic shaders, and zero-code scroll choreography.",
                styles: {
                  fontSize: 15,
                  fontWeight: "600",
                  color: text,
                  backgroundColor: surface,
                  paddingTop: 20,
                  paddingRight: 24,
                  paddingBottom: 20,
                  paddingLeft: 24,
                  borderRadius: 16,
                  borderColor: "rgba(255,255,255,0.12)",
                  borderWidth: 1,
                },
              },
            ],
          },
          {
            id: "el-cta-section",
            type: "section",
            name: "Conversion Finale Section",
            scrollProgressTarget: 1,
            styles: {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
              paddingTop: 96,
              paddingRight: 48,
              paddingBottom: 96,
              paddingLeft: 48,
              textAlign: "center",
            },
            children: [
              {
                id: "el-cta-heading",
                type: "heading",
                name: "Finale Heading",
                content: `Ready to Experience ${brandName}?`,
                styles: {
                  fontSize: 40,
                  fontWeight: "800",
                  color: text,
                  textAlign: "center",
                },
              },
              {
                id: "el-cta-button",
                type: "button",
                name: "Finale CTA Button",
                content: "Get Started Now",
                href: "#contact",
                styles: {
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#ffffff",
                  backgroundColor: secondary,
                  paddingTop: 14,
                  paddingRight: 32,
                  paddingBottom: 14,
                  paddingLeft: 32,
                  borderRadius: 999,
                },
              },
            ],
          },
        ],
      },
      {
        id: "page-about",
        name: "About",
        slug: "/about",
        elements: [
          {
            id: "el-about-section",
            type: "section",
            name: "About Hero",
            scrollProgressTarget: 0.25,
            styles: {
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 16,
              paddingTop: 80,
              paddingRight: 48,
              paddingBottom: 80,
              paddingLeft: 48,
            },
            children: [
              {
                id: "el-about-heading",
                type: "heading",
                name: "About Heading",
                content: `About ${brandName}`,
                styles: {
                  fontSize: 42,
                  fontWeight: "800",
                  color: text,
                },
              },
              {
                id: "el-about-text",
                type: "text",
                name: "About Story",
                content:
                  "Crafted with PeachWeb's spatial design system to merge narrative storytelling with interactive 3D architecture.",
                styles: {
                  fontSize: 17,
                  color: "#cbd5e1",
                },
              },
            ],
          },
        ],
      },
    ],
  };
}

export const PEACH_TEMPLATES_CATALOG: PeachTemplateBlueprint[] = [
  {
    id: "121",
    name: "Nebula SaaS 3D Launchpad",
    slug: "nebula-saas-3d",
    category: "SAAS",
    styleCollection: "Futuristic Glass",
    description:
      "Scroll-choreographed SaaS product launch template with iridescent torus core, floating orbital rings, and glassmorphic feature cards.",
    badge: "Featured",
    author: "PeachWorlds Studio",
    thumbnailGradient:
      "linear-gradient(135deg, #ff6b4a 0%, #9333ea 55%, #090a10 100%)",
    accentColor: "#ff6b4a",
    tags: ["SaaS", "3D Scroll", "Glassmorphism", "Dark Mode"],
    uiState: createDefaultUiState({
      brandName: "Nebula Cloud",
      headline: "Orchestrate Cloud Infrastructure in Real-Time 3D.",
      subheadline:
        "Visualize telemetry, deploy edge clusters, and scale globally with an interactive WebGL command surface.",
      ctaLabel: "Start Free Trial",
      primaryColor: "#ff6b4a",
      secondaryColor: "#9333ea",
      accentColor: "#38bdf8",
    }),
    sceneState: createDefaultSceneState({
      primaryColor: "#ff6b4a",
      secondaryColor: "#9333ea",
      accentColor: "#38bdf8",
      preset: "peach-aurora",
      heroPrimitive: "torus",
    }),
  },
  {
    id: "122",
    name: "Synthetix AI Copilot",
    slug: "synthetix-ai-copilot",
    category: "AI Tools",
    styleCollection: "Cyber Chrome",
    description:
      "High-contrast neural orb 3D landing page tailored for generative AI products, LLM APIs, and autonomous agent platforms.",
    badge: "Popular",
    author: "PeachWorlds Studio",
    thumbnailGradient:
      "linear-gradient(135deg, #38bdf8 0%, #6366f1 50%, #090d16 100%)",
    accentColor: "#38bdf8",
    tags: ["AI Tools", "Neural Orb", "Shader Bloom", "Developer"],
    uiState: createDefaultUiState({
      brandName: "Synthetix AI",
      headline: "Autonomous Intelligence Rendered at 60 FPS.",
      subheadline:
        "Deploy multimodal reasoning pipelines with zero-latency streaming and spatial observability.",
      ctaLabel: "Explore Neural API",
      primaryColor: "#38bdf8",
      secondaryColor: "#6366f1",
      accentColor: "#f43f5e",
    }),
    sceneState: createDefaultSceneState({
      primaryColor: "#38bdf8",
      secondaryColor: "#6366f1",
      accentColor: "#f43f5e",
      preset: "cyber-obsidian",
      heroPrimitive: "icosahedron",
    }),
  },
  {
    id: "123",
    name: "Kinetix Creative Agency",
    slug: "kinetix-creative-agency",
    category: "Agency",
    styleCollection: "Vibrant Gradient",
    description:
      "Bold spatial showcase for digital agencies and design studios featuring scroll-triggered camera sweeps and interactive case studies.",
    badge: "Pro",
    author: "PeachWorlds Studio",
    thumbnailGradient:
      "linear-gradient(135deg, #f43f5e 0%, #fb923c 50%, #18181b 100%)",
    accentColor: "#f43f5e",
    tags: ["Agency", "Portfolio", "Case Studies", "Scroll Keyframes"],
    uiState: createDefaultUiState({
      brandName: "Kinetix Studio",
      headline: "We Craft Digital Worlds That Move Brands Forward.",
      subheadline:
        "Award-winning spatial web design, interactive 3D product reveals, and kinetic brand storytelling.",
      ctaLabel: "View Selected Works",
      primaryColor: "#f43f5e",
      secondaryColor: "#fb923c",
      accentColor: "#facc15",
    }),
    sceneState: createDefaultSceneState({
      primaryColor: "#f43f5e",
      secondaryColor: "#fb923c",
      accentColor: "#facc15",
      preset: "solar-studio",
      heroPrimitive: "cylinder",
    }),
  },
  {
    id: "124",
    name: "Chronos Luxury Watch 3D Store",
    slug: "chronos-luxury-ecommerce",
    category: "E-Commerce",
    styleCollection: "Dark Obsidian",
    description:
      "360° interactive 3D e-commerce showcase with metallic material inspection, lighting presets, and instant variant configuration.",
    badge: "E-Commerce",
    author: "PeachWorlds Studio",
    thumbnailGradient:
      "linear-gradient(135deg, #f59e0b 0%, #b45309 45%, #0c0a09 100%)",
    accentColor: "#f59e0b",
    tags: ["E-Commerce", "3D Configurator", "Luxury", "PBR Metal"],
    uiState: createDefaultUiState({
      brandName: "Chronos Atelier",
      headline: "Precision Horology in Interactive 3D Detail.",
      subheadline:
        "Inspect brushed titanium bezels, sapphire crystal reflections, and bespoke complications from every angle.",
      ctaLabel: "Configure Your Timepiece",
      primaryColor: "#f59e0b",
      secondaryColor: "#ea580c",
      accentColor: "#fde047",
    }),
    sceneState: createDefaultSceneState({
      primaryColor: "#f59e0b",
      secondaryColor: "#ea580c",
      accentColor: "#fde047",
      preset: "cyber-obsidian",
      heroPrimitive: "ring",
    }),
  },
  {
    id: "125",
    name: "Aether Capital & Fintech",
    slug: "aether-capital-fintech",
    category: "Finance",
    styleCollection: "Editorial Minimal",
    description:
      "Institutional-grade 3D fintech and venture capital template with crystalline geometry and precision data storytelling.",
    badge: "New",
    author: "PeachWorlds Studio",
    thumbnailGradient:
      "linear-gradient(135deg, #10b981 0%, #0ea5e9 55%, #061318 100%)",
    accentColor: "#10b981",
    tags: ["Finance", "Investor", "Fintech", "Minimal"],
    uiState: createDefaultUiState({
      brandName: "Aether Capital",
      headline: "Backing Founders Engineering the Spatial Economy.",
      subheadline:
        "Institutional liquidity, algorithmic treasury management, and frontier deep-tech investments.",
      ctaLabel: "Explore Thesis",
      primaryColor: "#10b981",
      secondaryColor: "#0ea5e9",
      accentColor: "#34d399",
    }),
    sceneState: createDefaultSceneState({
      primaryColor: "#10b981",
      secondaryColor: "#0ea5e9",
      accentColor: "#34d399",
      preset: "glass-nebula",
      heroPrimitive: "box",
    }),
  },
  {
    id: "126",
    name: "Odyssey Spatial Storytelling",
    slug: "odyssey-spatial-storytelling",
    category: "Storytelling",
    styleCollection: "Organic Spatial",
    description:
      "Cinematic multi-chapter 3D narrative experience where every scroll milestone transitions camera depth, fog, and lighting.",
    badge: "Showcase",
    author: "PeachWorlds Studio",
    thumbnailGradient:
      "linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #0f0720 100%)",
    accentColor: "#ec4899",
    tags: ["Storytelling", "Portfolio", "Cinematic", "Camera Path"],
    uiState: createDefaultUiState({
      brandName: "Odyssey Archive",
      headline: "Every Scroll Unlocks a New Chapter in Space.",
      subheadline:
        "Guide visitors through an unforgettable three-dimensional narrative choreographed to their scroll velocity.",
      ctaLabel: "Begin Chapter One",
      primaryColor: "#ec4899",
      secondaryColor: "#8b5cf6",
      accentColor: "#f472b6",
    }),
    sceneState: createDefaultSceneState({
      primaryColor: "#ec4899",
      secondaryColor: "#8b5cf6",
      accentColor: "#f472b6",
      preset: "peach-aurora",
      heroPrimitive: "sphere",
    }),
  },
];

export function getTemplateById(id: string): PeachTemplateBlueprint | undefined {
  return PEACH_TEMPLATES_CATALOG.find((t) => t.id === id || t.slug === id);
}
