export interface Vector3Tuple {
  x: number;
  y: number;
  z: number;
}

export type PeachElementType =
  | "section"
  | "container"
  | "heading"
  | "text"
  | "button"
  | "image"
  | "card"
  | "form"
  | "badge";

export interface PeachElementStyles {
  display?: "flex" | "block" | "grid";
  flexDirection?: "row" | "column";
  alignItems?: "flex-start" | "center" | "flex-end" | "stretch";
  justifyContent?: "flex-start" | "center" | "space-between" | "flex-end";
  gap?: number;
  width?: string;
  height?: string;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  marginTop?: number;
  marginBottom?: number;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  opacity?: number;
  textAlign?: "left" | "center" | "right";
}

export interface PeachUiElement {
  id: string;
  type: PeachElementType;
  name: string;
  content?: string;
  href?: string;
  src?: string;
  scrollProgressTarget?: number;
  styles: PeachElementStyles;
  hoverStyles?: Partial<PeachElementStyles>;
  responsiveOverrides?: {
    tablet?: Partial<PeachElementStyles>;
    mobile?: Partial<PeachElementStyles>;
  };
  children?: PeachUiElement[];
}

export interface PeachPage {
  id: string;
  name: string;
  slug: string;
  elements: PeachUiElement[];
}

export interface PeachUiState {
  activePageId: string;
  pages: PeachPage[];
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    baseSize: number;
  };
}

export type PeachMeshPrimitiveType =
  | "box"
  | "sphere"
  | "cylinder"
  | "torus"
  | "cone"
  | "plane"
  | "icosahedron"
  | "ring";

export interface PeachSceneObject {
  id: string;
  name: string;
  type: PeachMeshPrimitiveType;
  visible: boolean;
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  scale: Vector3Tuple;
  material: {
    color: string;
    emissive: string;
    emissiveIntensity: number;
    metalness: number;
    roughness: number;
    opacity: number;
    wireframe: boolean;
    transmission?: number;
  };
  floatAnimation?: {
    enabled: boolean;
    speed: number;
    amplitude: number;
    rotationSpeed: number;
  };
}

export interface PeachSceneLight {
  id: string;
  name: string;
  type: "ambient" | "directional" | "point" | "spot";
  color: string;
  intensity: number;
  position: Vector3Tuple;
  visible: boolean;
}

export interface PeachKeyframe {
  id: string;
  scrollProgress: number; // 0.0 to 1.0
  label: string;
  cameraPosition: Vector3Tuple;
  cameraTarget: Vector3Tuple;
  objectTransforms: Record<
    string,
    {
      position: Vector3Tuple;
      rotation: Vector3Tuple;
      scale: Vector3Tuple;
      color?: string;
    }
  >;
}

export interface PeachSceneState {
  environment: {
    backgroundColor: string;
    secondaryGradientColor: string;
    fogColor: string;
    fogDensity: number;
    ambientIntensity: number;
    preset:
      | "peach-aurora"
      | "cyber-obsidian"
      | "solar-studio"
      | "glass-nebula"
      | "minimal-ivory";
    gridVisible: boolean;
  };
  camera: {
    fov: number;
    position: Vector3Tuple;
    target: Vector3Tuple;
    exposure: number;
  };
  postProcessing: {
    bloomEnabled: boolean;
    bloomIntensity: number;
    bloomThreshold: number;
    noiseEnabled: boolean;
    noiseOpacity: number;
    vignetteEnabled: boolean;
  };
  lights: PeachSceneLight[];
  objects: PeachSceneObject[];
  keyframes: PeachKeyframe[];
}

export interface PeachDocumentState {
  uiState: PeachUiState;
  sceneState: PeachSceneState;
}
