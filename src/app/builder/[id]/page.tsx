"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Plus,
  Layers,
  Palette,
  FileText,
  Settings,
  Box,
  Sun,
  Monitor,
  Tablet,
  Smartphone,
  History,
  MessageSquare,
  Share2,
  Eye,
  Rocket,
  Play,
  Pause,
  Trash2,
  Check,
  X,
  RotateCcw,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { PeachThreeCanvas } from "@/components/studio/PeachThreeCanvas";
import { PeachUiOverlay } from "@/components/studio/PeachUiOverlay";
import type {
  PeachElementType,
  PeachMeshPrimitiveType,
  PeachSceneObject,
  PeachSceneState,
  PeachUiElement,
  PeachUiState,
} from "@/lib/document-types";

interface VersionSnapshot {
  id: string;
  label: string;
  createdAt: string;
  createdBy?: { name: string | null; email: string };
}

interface CommentRecord {
  id: string;
  content: string;
  pageId: string;
  resolved: boolean;
  createdAt: string;
  author?: { name: string | null; email: string };
}

function findElementById(
  elements: PeachUiElement[],
  id: string | null,
): PeachUiElement | null {
  if (!id) return null;
  for (const el of elements) {
    if (el.id === id) return el;
    if (el.children) {
      const found = findElementById(el.children, id);
      if (found) return found;
    }
  }
  return null;
}

function updateElementById(
  elements: PeachUiElement[],
  id: string,
  updater: (el: PeachUiElement) => PeachUiElement,
): PeachUiElement[] {
  return elements.map((el) => {
    if (el.id === id) {
      return updater(el);
    }
    if (el.children) {
      return {
        ...el,
        children: updateElementById(el.children, id, updater),
      };
    }
    return el;
  });
}

function deleteElementById(elements: PeachUiElement[], id: string): PeachUiElement[] {
  return elements
    .filter((el) => el.id !== id)
    .map((el) => ({
      ...el,
      children: el.children ? deleteElementById(el.children, id) : undefined,
    }));
}

export default function PeachBuilderStudioPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const websiteId = params.id;

  const [siteName, setSiteName] = useState("Loading Studio...");
  const [siteSlug, setSiteSlug] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [uiState, setUiState] = useState<PeachUiState | null>(null);
  const [sceneState, setSceneState] = useState<PeachSceneState | null>(null);

  // Studio Modes & Viewports
  const [studioMode, setStudioMode] = useState<"ui" | "3d" | "animate">("ui");
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [leftTab, setLeftTab] = useState<
    "add" | "layers" | "styles" | "pages" | "assets" | "settings" | "outliner" | "add3d" | "library3d"
  >("add");
  const [settingsSubTab, setSettingsSubTab] = useState<"general" | "domains" | "plans">("general");
  const [customDomainInput, setCustomDomainInput] = useState("");
  const [assetCategoryFilter, setAssetCategoryFilter] = useState<
    "All Assets" | "Images" | "Videos" | "3D" | "Sound" | "Vector" | "HDRI"
  >("All Assets");
  const [library3dSubTab, setLibrary3dSubTab] = useState<
    "Models" | "Materials" | "Components" | "Templates"
  >("Models");
  const [cameraViewActive, setCameraViewActive] = useState(false);
  const [materialEditorOpen, setMaterialEditorOpen] = useState(false);
  const [aiMaterialPromptOpen, setAiMaterialPromptOpen] = useState(false);
  const [aiMaterialPrompt, setAiMaterialPrompt] = useState("");
  const [materialShaderType, setMaterialShaderType] = useState<
    "Standard" | "Physical" | "Toon" | "Basic" | "Matcap"
  >("Standard");
  const [aiEffectPromptOpen, setAiEffectPromptOpen] = useState(false);
  const [aiEffectPrompt, setAiEffectPrompt] = useState("");
  const [commentPinMode, setCommentPinMode] = useState(false);
  const [shareLinkActive, setShareLinkActive] = useState(false);
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [collaboratorRole, setCollaboratorRole] = useState<"Editor" | "Viewer">("Editor");

  // Selection & Timeline State
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    "el-hero-heading",
  );
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(
    "mesh-hero-core",
  );
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isPlayingTimeline, setIsPlayingTimeline] = useState(false);

  // Top Bar Menus & Modals
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const [editMenuOpen, setEditMenuOpen] = useState(false);
  const [versionsModalOpen, setVersionsModalOpen] = useState(false);
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);

  // Data for Versions, Comments, Saving & Publishing
  const [versions, setVersions] = useState<VersionSnapshot[]>([]);
  const [newVersionLabel, setNewVersionLabel] = useState("");
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [newPageName, setNewPageName] = useState("");
  const [savingStatus, setSavingStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [publishing, setPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  // Undo / Redo Stacks
  const [undoStack, setUndoStack] = useState<
    Array<{ uiState: PeachUiState; sceneState: PeachSceneState }>
  >([]);
  const [redoStack, setRedoStack] = useState<
    Array<{ uiState: PeachUiState; sceneState: PeachSceneState }>
  >([]);

  useEffect(() => {
    fetch(`/api/websites/${websiteId}`)
      .then((res) => {
        if (res.status === 401) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then(
        (
          data: {
            website?: {
              name: string;
              slug: string;
              isPublished: boolean;
              uiState: PeachUiState;
              sceneState: PeachSceneState;
              versions: VersionSnapshot[];
              comments: CommentRecord[];
            };
          } | null,
        ) => {
          if (data?.website) {
            setSiteName(data.website.name);
            setSiteSlug(data.website.slug);
            setIsPublished(data.website.isPublished);
            setUiState(data.website.uiState);
            setSceneState(data.website.sceneState);
            setVersions(data.website.versions ?? []);
            setComments(data.website.comments ?? []);
            if (data.website.isPublished) {
              setPublishedUrl(`/site/${data.website.slug}`);
            }
          }
        },
      )
      .catch(() => undefined);
  }, [websiteId, router]);

  // Timeline playback loop in Animate mode
  useEffect(() => {
    if (!isPlayingTimeline) return;
    const interval = setInterval(() => {
      setScrollProgress((prev) => {
        const next = prev + 0.01;
        return next > 1 ? 0 : Number(next.toFixed(2));
      });
    }, 40);
    return () => clearInterval(interval);
  }, [isPlayingTimeline]);

  function pushUndoSnapshot() {
    if (!uiState || !sceneState) return;
    setUndoStack((prev) => [
      ...prev.slice(-19),
      {
        uiState: structuredClone(uiState),
        sceneState: structuredClone(sceneState),
      },
    ]);
    setRedoStack([]);
  }

  function handleUndo() {
    if (undoStack.length === 0 || !uiState || !sceneState) return;
    const last = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [
      ...prev,
      { uiState: structuredClone(uiState), sceneState: structuredClone(sceneState) },
    ]);
    setUiState(last.uiState);
    setSceneState(last.sceneState);
    setUndoStack((prev) => prev.slice(0, -1));
  }

  function handleRedo() {
    if (redoStack.length === 0 || !uiState || !sceneState) return;
    const last = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [
      ...prev,
      { uiState: structuredClone(uiState), sceneState: structuredClone(sceneState) },
    ]);
    setUiState(last.uiState);
    setSceneState(last.sceneState);
    setRedoStack((prev) => prev.slice(0, -1));
  }

  async function saveDocumentToServer(
    nextUi = uiState,
    nextScene = sceneState,
    extra?: { name?: string; slug?: string; isCustomTemplate?: boolean },
  ) {
    if (!nextUi || !nextScene) return;
    setSavingStatus("saving");
    try {
      await fetch(`/api/websites/${websiteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: extra?.name ?? siteName,
          slug: extra?.slug ?? siteSlug,
          isCustomTemplate: extra?.isCustomTemplate,
          uiState: nextUi,
          sceneState: nextScene,
        }),
      });
      setSavingStatus("saved");
      setTimeout(() => setSavingStatus("idle"), 1500);
    } catch {
      setSavingStatus("idle");
    }
  }

  function handleAddUiElement(type: PeachElementType) {
    if (!uiState) return;
    pushUndoSnapshot();

    const id = `el-${type}-${Date.now().toString(36).slice(-4)}`;
    const defaults: Record<PeachElementType, Partial<PeachUiElement>> = {
      section: {
        name: "New Section",
        styles: {
          display: "flex",
          flexDirection: "column",
          gap: 16,
          paddingTop: 48,
          paddingRight: 32,
          paddingBottom: 48,
          paddingLeft: 32,
          backgroundColor: "rgba(19,21,34,0.6)",
          borderRadius: 20,
        },
        children: [],
      },
      container: {
        name: "Flex Container",
        styles: {
          display: "flex",
          flexDirection: "row",
          gap: 16,
          paddingTop: 20,
          paddingRight: 20,
          paddingBottom: 20,
          paddingLeft: 20,
          backgroundColor: "rgba(255,255,255,0.04)",
          borderRadius: 14,
        },
        children: [],
      },
      heading: {
        name: "Section Heading",
        content: "New Spatial 3D Headline",
        styles: {
          fontSize: 32,
          fontWeight: "800",
          color: uiState.palette.text,
          marginTop: 8,
          marginBottom: 8,
        },
      },
      text: {
        name: "Paragraph Copy",
        content:
          "Crafted inside the PeachWorlds 3D WebGL Studio with real-time lighting and responsive Flexbox controls.",
        styles: {
          fontSize: 16,
          fontWeight: "400",
          color: "#cbd5e1",
        },
      },
      button: {
        name: "Interactive CTA Button",
        content: "Explore in 3D",
        styles: {
          fontSize: 14,
          fontWeight: "700",
          color: "#ffffff",
          backgroundColor: uiState.palette.primary,
          paddingTop: 12,
          paddingRight: 24,
          paddingBottom: 12,
          paddingLeft: 24,
          borderRadius: 999,
        },
      },
      card: {
        name: "Feature Card",
        content: "3D Spatial Feature Card • Interactive WebGL",
        styles: {
          fontSize: 15,
          fontWeight: "600",
          color: uiState.palette.text,
          backgroundColor: uiState.palette.surface,
          paddingTop: 20,
          paddingRight: 24,
          paddingBottom: 20,
          paddingLeft: 24,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.12)",
        },
      },
      badge: {
        name: "Highlight Pill Badge",
        content: "NEW 3D RELEASE",
        styles: {
          fontSize: 12,
          fontWeight: "700",
          color: uiState.palette.primary,
          backgroundColor: "rgba(255,107,74,0.15)",
          paddingTop: 6,
          paddingRight: 12,
          paddingBottom: 6,
          paddingLeft: 12,
          borderRadius: 999,
        },
      },
      image: {
        name: "Visual Banner Block",
        content: "3D Render Showcase Frame",
        styles: {
          fontSize: 14,
          fontWeight: "600",
          color: "#ffffff",
          backgroundColor: "rgba(147,51,234,0.25)",
          paddingTop: 36,
          paddingRight: 24,
          paddingBottom: 36,
          paddingLeft: 24,
          borderRadius: 16,
          textAlign: "center",
        },
      },
      form: {
        name: "Lead Capture Form",
        content: "Join the 3D Early Access List",
        styles: {
          paddingTop: 20,
          paddingRight: 24,
          paddingBottom: 20,
          paddingLeft: 24,
          backgroundColor: uiState.palette.surface,
          borderRadius: 16,
        },
      },
    };

    const newElement: PeachUiElement = {
      id,
      type,
      name: defaults[type].name ?? "Element",
      content: defaults[type].content,
      styles: defaults[type].styles ?? {},
      children: defaults[type].children,
    };

    const nextPages = uiState.pages.map((p) => {
      if (p.id !== uiState.activePageId) return p;
      return {
        ...p,
        elements: [...p.elements, newElement],
      };
    });

    const nextUi = { ...uiState, pages: nextPages };
    setUiState(nextUi);
    setSelectedElementId(id);
    void saveDocumentToServer(nextUi, sceneState);
  }

  function handleAdd3dObject(primitive: PeachMeshPrimitiveType) {
    if (!sceneState) return;
    pushUndoSnapshot();

    const id = `mesh-${primitive}-${Date.now().toString(36).slice(-4)}`;
    const newObj: PeachSceneObject = {
      id,
      name: `${primitive.charAt(0).toUpperCase() + primitive.slice(1)} Mesh`,
      type: primitive,
      visible: true,
      position: {
        x: Number(((Math.random() - 0.5) * 2.2).toFixed(2)),
        y: Number(((Math.random() - 0.5) * 1.4).toFixed(2)),
        z: 0,
      },
      rotation: { x: 0.3, y: 0.5, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      material: {
        color: uiState?.palette.primary ?? "#ff6b4a",
        emissive: uiState?.palette.secondary ?? "#9333ea",
        emissiveIntensity: 0.25,
        metalness: 0.75,
        roughness: 0.2,
        opacity: 1,
        wireframe: false,
      },
      floatAnimation: {
        enabled: true,
        speed: 1.1,
        amplitude: 0.18,
        rotationSpeed: 0.4,
      },
    };

    const nextScene: PeachSceneState = {
      ...sceneState,
      objects: [...sceneState.objects, newObj],
    };
    setSceneState(nextScene);
    setSelectedObjectId(id);
    void saveDocumentToServer(uiState, nextScene);
  }

  function handleAddKeyframe() {
    if (!sceneState) return;
    pushUndoSnapshot();

    const id = `kf-${Date.now().toString(36).slice(-4)}`;
    const pct = Math.round(scrollProgress * 100);
    const objectTransforms: PeachSceneState["keyframes"][number]["objectTransforms"] = {};
    for (const obj of sceneState.objects) {
      objectTransforms[obj.id] = {
        position: { ...obj.position },
        rotation: { ...obj.rotation },
        scale: { ...obj.scale },
      };
    }

    const nextKeyframes = [
      ...sceneState.keyframes.filter(
        (k) => Math.abs(k.scrollProgress - scrollProgress) > 0.01,
      ),
      {
        id,
        scrollProgress: Number(scrollProgress.toFixed(2)),
        label: `${pct}% — Custom Keyframe`,
        cameraPosition: { ...sceneState.camera.position },
        cameraTarget: { ...sceneState.camera.target },
        objectTransforms,
      },
    ].sort((a, b) => a.scrollProgress - b.scrollProgress);

    const nextScene = { ...sceneState, keyframes: nextKeyframes };
    setSceneState(nextScene);
    void saveDocumentToServer(uiState, nextScene);
  }

  async function handleCreateVersionSnapshot(e: React.FormEvent) {
    e.preventDefault();
    if (!uiState || !sceneState) return;
    const label =
      newVersionLabel.trim() ||
      `v1.${versions.length + 1} Studio Snapshot`;
    const res = await fetch(`/api/websites/${websiteId}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        label,
        uiState,
        sceneState,
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as { version: VersionSnapshot };
      setVersions((prev) => [data.version, ...prev]);
      setNewVersionLabel("");
    }
  }

  async function handleRestoreVersion(versionId: string) {
    const res = await fetch(`/api/websites/${websiteId}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "restore", versionId }),
    });
    if (res.ok) {
      const data = (await res.json()) as {
        website: { uiState: PeachUiState; sceneState: PeachSceneState };
      };
      setUiState(data.website.uiState);
      setSceneState(data.website.sceneState);
      setVersionsModalOpen(false);
    }
  }

  async function handleCreateComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const res = await fetch(`/api/websites/${websiteId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: newCommentText,
        pageId: uiState?.activePageId ?? "page-home",
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as { comment: CommentRecord };
      setComments((prev) => [data.comment, ...prev]);
      setNewCommentText("");
    }
  }

  async function handlePublishLive() {
    if (!uiState || !sceneState) return;
    setPublishing(true);
    try {
      const res = await fetch(`/api/websites/${websiteId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: siteSlug,
          uiState,
          sceneState,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          publishedUrl: string;
          website: { slug: string };
        };
        setSiteSlug(data.website.slug);
        setIsPublished(true);
        setPublishedUrl(data.publishedUrl);
      }
    } finally {
      setPublishing(false);
    }
  }

  if (!uiState || !sceneState) {
    return (
      <div className="min-h-screen bg-[#08090f] text-white flex items-center justify-center text-sm">
        Initializing PeachWorlds 3D WebGL Studio...
      </div>
    );
  }

  const activePage =
    uiState.pages.find((p) => p.id === uiState.activePageId) ?? uiState.pages[0];
  const selectedElement = findElementById(
    activePage?.elements ?? [],
    selectedElementId,
  );
  const selectedObject =
    sceneState.objects.find((o) => o.id === selectedObjectId) ??
    sceneState.objects[0];

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#08090f] text-white flex flex-col select-none">
      {/* ==================== TOP STUDIO BAR ==================== */}
      <header className="h-14 border-b border-white/10 bg-[#0c0e18] px-4 flex items-center justify-between z-30 shrink-0">
        {/* Left: Logo, File, Edit, Project Name */}
        <div className="flex items-center gap-3">
          <Link
            href="/workspace"
            title="Back to PeachWorlds Workspace"
            className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ff6b4a] to-[#9333ea] flex items-center justify-center font-extrabold text-xs text-white"
          >
            P
          </Link>

          {/* File Dropdown */}
          <div className="relative">
            <button
              type="button"
              data-testid="studio-file-menu-btn"
              onClick={() => {
                setFileMenuOpen(!fileMenuOpen);
                setEditMenuOpen(false);
              }}
              className="px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-xs font-semibold text-slate-200 cursor-pointer"
            >
              File
            </button>
            {fileMenuOpen && (
              <div className="absolute left-0 mt-1.5 w-56 rounded-2xl bg-[#141726] border border-white/15 shadow-2xl p-1.5 z-50 text-xs space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    void saveDocumentToServer();
                    setFileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-left hover:bg-white/10 flex items-center justify-between cursor-pointer"
                >
                  <span>Save Changes</span>
                  <span className="text-[10px] text-slate-400">Ctrl+S</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVersionsModalOpen(true);
                    setFileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-left hover:bg-white/10 cursor-pointer"
                >
                  Save Version Snapshot...
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void saveDocumentToServer(uiState, sceneState, {
                      isCustomTemplate: true,
                    });
                    setFileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-left hover:bg-white/10 cursor-pointer"
                >
                  Save as Custom Template
                </button>
                <Link
                  href="/workspace"
                  className="block w-full px-3 py-2 rounded-xl text-left hover:bg-white/10 text-slate-300 border-t border-white/10"
                >
                  Exit to Workspace
                </Link>
              </div>
            )}
          </div>

          {/* Edit Dropdown */}
          <div className="relative">
            <button
              type="button"
              data-testid="studio-edit-menu-btn"
              onClick={() => {
                setEditMenuOpen(!editMenuOpen);
                setFileMenuOpen(false);
              }}
              className="px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-xs font-semibold text-slate-200 cursor-pointer"
            >
              Edit
            </button>
            {editMenuOpen && (
              <div className="absolute left-0 mt-1.5 w-48 rounded-2xl bg-[#141726] border border-white/15 shadow-2xl p-1.5 z-50 text-xs space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    handleUndo();
                    setEditMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-left hover:bg-white/10 flex justify-between cursor-pointer"
                >
                  <span>Undo</span>
                  <span className="text-[10px] text-slate-400">
                    ({undoStack.length})
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleRedo();
                    setEditMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-left hover:bg-white/10 flex justify-between cursor-pointer"
                >
                  <span>Redo</span>
                  <span className="text-[10px] text-slate-400">
                    ({redoStack.length})
                  </span>
                </button>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-white/10 mx-1" />

          <span className="text-xs font-bold text-white truncate max-w-[180px]">
            {siteName}
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {savingStatus === "saving"
              ? "Saving..."
              : savingStatus === "saved"
                ? "Saved ✓"
                : "Synced"}
          </span>
        </div>

        {/* Center: Mode Switcher (UI | 3D | Animate) & Viewport Switcher */}
        <div className="flex items-center gap-4">
          <div
            role="tablist"
            aria-label="Studio Mode Switcher"
            className="flex items-center bg-[#151828] border border-white/10 rounded-xl p-1"
          >
            {(
              [
                { id: "ui", label: "UI" },
                { id: "3d", label: "3D" },
                { id: "animate", label: "Animate" },
              ] as const
            ).map((mode) => (
              <button
                key={mode.id}
                type="button"
                data-testid={`mode-tab-${mode.id}`}
                onClick={() => {
                  setStudioMode(mode.id);
                  if (mode.id === "3d") setLeftTab("outliner");
                  if (mode.id === "ui") setLeftTab("add");
                }}
                className={`px-4 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  studioMode === mode.id
                    ? "bg-gradient-to-r from-[#ff6b4a] to-[#ec4899] text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {/* Viewport Breakpoint Switcher */}
          <div className="hidden md:flex items-center bg-[#151828] border border-white/10 rounded-xl p-1">
            {(
              [
                { id: "desktop", icon: Monitor, title: "Desktop (1280px)" },
                { id: "tablet", icon: Tablet, title: "Tablet (768px)" },
                { id: "mobile", icon: Smartphone, title: "Mobile (390px)" },
              ] as const
            ).map((vp) => (
              <button
                key={vp.id}
                type="button"
                title={vp.title}
                data-testid={`viewport-btn-${vp.id}`}
                onClick={() => setViewport(vp.id)}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewport === vp.id
                    ? "bg-white/15 text-[#ff6b4a]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <vp.icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Version History, Comments, Share, Preview, Publish */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            title="Version history"
            data-testid="studio-versions-btn"
            onClick={() => setVersionsModalOpen(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
          >
            <History className="w-4 h-4" />
          </button>

          <button
            type="button"
            title="Toggle Canvas Comment Pin Mode"
            data-testid="studio-comment-pin-mode-btn"
            onClick={() => setCommentPinMode(!commentPinMode)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
              commentPinMode
                ? "bg-[#ff6b4a] text-white"
                : "bg-white/5 hover:bg-white/10 text-slate-300"
            }`}
          >
            Pin
          </button>

          <button
            type="button"
            title="Comments"
            data-testid="studio-comments-btn"
            onClick={() => setCommentsModalOpen(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer relative"
          >
            <MessageSquare className="w-4 h-4" />
            {comments.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ff6b4a] text-[9px] font-bold flex items-center justify-center">
                {comments.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShareModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          <Link
            href={`/preview/${websiteId}`}
            data-testid="studio-preview-btn"
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </Link>

          <button
            type="button"
            data-testid="studio-publish-btn"
            onClick={() => setPublishModalOpen(true)}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#ff6b4a] to-[#ec4899] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-[#ff6b4a]/20 cursor-pointer"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Publish</span>
          </button>
        </div>
      </header>

      {/* ==================== MAIN STUDIO WORKBENCH ==================== */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Icon Rail */}
        <aside className="w-14 border-r border-white/10 bg-[#0b0d16] flex flex-col items-center py-3 gap-2 shrink-0">
          {studioMode === "3d" ? (
            <>
              <button
                type="button"
                title="3D Scene Outliner"
                onClick={() => setLeftTab("outliner")}
                className={`p-2.5 rounded-xl cursor-pointer ${
                  leftTab === "outliner"
                    ? "bg-[#ff6b4a]/20 text-[#ff6b4a]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Box className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="Add 3D Primitive"
                data-testid="left-rail-add-3d"
                onClick={() => setLeftTab("add3d")}
                className={`p-2.5 rounded-xl cursor-pointer ${
                  leftTab === "add3d"
                    ? "bg-[#ff6b4a]/20 text-[#ff6b4a]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="3D Library (Models, Materials, Components, Templates)"
                data-testid="left-rail-library-3d"
                onClick={() => setLeftTab("library3d")}
                className={`p-2.5 rounded-xl cursor-pointer ${
                  leftTab === "library3d"
                    ? "bg-[#ff6b4a]/20 text-[#ff6b4a]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Palette className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="Assets"
                data-testid="left-rail-assets-3d"
                onClick={() => setLeftTab("assets")}
                className={`p-2.5 rounded-xl cursor-pointer ${
                  leftTab === "assets"
                    ? "bg-[#ff6b4a]/20 text-[#ff6b4a]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="Site Settings"
                onClick={() => setLeftTab("settings")}
                className={`p-2.5 rounded-xl cursor-pointer ${
                  leftTab === "settings"
                    ? "bg-[#ff6b4a]/20 text-[#ff6b4a]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Settings className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                title="Add UI Elements"
                data-testid="left-rail-add-ui"
                onClick={() => setLeftTab("add")}
                className={`p-2.5 rounded-xl cursor-pointer ${
                  leftTab === "add"
                    ? "bg-[#ff6b4a]/20 text-[#ff6b4a]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="UI Layer Tree"
                onClick={() => setLeftTab("layers")}
                className={`p-2.5 rounded-xl cursor-pointer ${
                  leftTab === "layers"
                    ? "bg-[#ff6b4a]/20 text-[#ff6b4a]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="Brand Styles & Colors"
                onClick={() => setLeftTab("styles")}
                className={`p-2.5 rounded-xl cursor-pointer ${
                  leftTab === "styles"
                    ? "bg-[#ff6b4a]/20 text-[#ff6b4a]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Palette className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="Pages"
                onClick={() => setLeftTab("pages")}
                className={`p-2.5 rounded-xl cursor-pointer ${
                  leftTab === "pages"
                    ? "bg-[#ff6b4a]/20 text-[#ff6b4a]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FileText className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="Assets"
                data-testid="left-rail-assets"
                onClick={() => setLeftTab("assets")}
                className={`p-2.5 rounded-xl cursor-pointer ${
                  leftTab === "assets"
                    ? "bg-[#ff6b4a]/20 text-[#ff6b4a]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Box className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="Site Settings"
                data-testid="left-rail-settings"
                onClick={() => setLeftTab("settings")}
                className={`p-2.5 rounded-xl cursor-pointer ${
                  leftTab === "settings"
                    ? "bg-[#ff6b4a]/20 text-[#ff6b4a]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Settings className="w-4 h-4" />
              </button>
            </>
          )}
        </aside>

        {/* Left Contextual Drawer */}
        <aside className="w-64 border-r border-white/10 bg-[#0f111c] p-4 overflow-y-auto shrink-0 space-y-4">
          {leftTab === "add" && (
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Add UI Elements
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { type: "section", label: "Section" },
                    { type: "container", label: "Container" },
                    { type: "heading", label: "Heading" },
                    { type: "text", label: "Paragraph" },
                    { type: "button", label: "Button" },
                    { type: "card", label: "3D Card" },
                    { type: "badge", label: "Badge" },
                    { type: "form", label: "Lead Form" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    data-testid={`add-ui-${item.type}`}
                    onClick={() => handleAddUiElement(item.type)}
                    className="p-3 rounded-xl bg-white/[0.04] hover:bg-[#ff6b4a]/20 border border-white/10 hover:border-[#ff6b4a]/40 text-xs font-semibold text-left transition cursor-pointer"
                  >
                    + {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {leftTab === "layers" && (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                DOM Layer Hierarchy ({activePage?.name})
              </div>
              <div className="space-y-1">
                {activePage?.elements.map((el) => (
                  <div key={el.id} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => setSelectedElementId(el.id)}
                      className={`w-full px-3 py-2 rounded-lg text-left text-xs font-semibold flex items-center justify-between cursor-pointer ${
                        selectedElementId === el.id
                          ? "bg-[#ff6b4a]/20 text-[#ff6b4a]"
                          : "hover:bg-white/5 text-slate-200"
                      }`}
                    >
                      <span className="truncate">{el.name}</span>
                      <span className="text-[10px] text-slate-500 uppercase">
                        {el.type}
                      </span>
                    </button>
                    {el.children?.map((child) => (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => setSelectedElementId(child.id)}
                        className={`w-full pl-6 pr-3 py-1.5 rounded-lg text-left text-xs flex items-center justify-between cursor-pointer ${
                          selectedElementId === child.id
                            ? "bg-[#ff6b4a]/20 text-[#ff6b4a] font-bold"
                            : "hover:bg-white/5 text-slate-400"
                        }`}
                      >
                        <span className="truncate">{child.name}</span>
                        <span className="text-[10px] text-slate-500">
                          {child.type}
                        </span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {leftTab === "styles" && (
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Global Brand Palette
              </div>
              {(
                [
                  { key: "primary", label: "Primary Brand" },
                  { key: "secondary", label: "Secondary Glow" },
                  { key: "accent", label: "3D Rim Accent" },
                  { key: "background", label: "Background" },
                  { key: "surface", label: "Card Surface" },
                  { key: "text", label: "Text Color" },
                ] as const
              ).map((colorItem) => (
                <div
                  key={colorItem.key}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs"
                >
                  <span>{colorItem.label}</span>
                  <input
                    type="color"
                    value={uiState.palette[colorItem.key]}
                    onChange={(e) => {
                      const nextUi = {
                        ...uiState,
                        palette: {
                          ...uiState.palette,
                          [colorItem.key]: e.target.value,
                        },
                      };
                      setUiState(nextUi);
                      void saveDocumentToServer(nextUi, sceneState);
                    }}
                    className="w-7 h-7 rounded cursor-pointer bg-transparent"
                  />
                </div>
              ))}

              <div className="pt-3 border-t border-white/10 space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Typography Tokens
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-400">
                    Heading Font
                  </label>
                  <select
                    value={uiState.typography.headingFont}
                    onChange={(e) => {
                      const nextUi = {
                        ...uiState,
                        typography: {
                          ...uiState.typography,
                          headingFont: e.target.value,
                        },
                      };
                      setUiState(nextUi);
                      void saveDocumentToServer(nextUi, sceneState);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#08090f] border border-white/10 text-xs text-white"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Space Grotesk">Space Grotesk</option>
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                    <option value="Syne">Syne</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {leftTab === "pages" && (
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Website Pages ({uiState.pages.length})
              </div>
              <div className="space-y-1.5">
                {uiState.pages.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setUiState({ ...uiState, activePageId: p.id })}
                    className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between cursor-pointer ${
                      uiState.activePageId === p.id
                        ? "bg-[#ff6b4a] text-white"
                        : "bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <span>{p.name}</span>
                    <span className="font-mono text-[10px] opacity-80">
                      {p.slug}
                    </span>
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-white/10 space-y-2">
                <input
                  type="text"
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  placeholder="New page name (e.g. Pricing)"
                  className="w-full px-3 py-2 rounded-xl bg-[#08090f] border border-white/10 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newPageName.trim()) return;
                    const slug = `/${newPageName
                      .trim()
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")}`;
                    const id = `page-${Date.now().toString(36).slice(-4)}`;
                    const nextUi: PeachUiState = {
                      ...uiState,
                      activePageId: id,
                      pages: [
                        ...uiState.pages,
                        {
                          id,
                          name: newPageName.trim(),
                          slug,
                          elements: [
                            {
                              id: `el-sec-${id}`,
                              type: "section",
                              name: `${newPageName.trim()} Hero`,
                              styles: {
                                display: "flex",
                                flexDirection: "column",
                                gap: 16,
                                paddingTop: 80,
                                paddingRight: 48,
                                paddingBottom: 80,
                                paddingLeft: 48,
                              },
                              children: [
                                {
                                  id: `el-hd-${id}`,
                                  type: "heading",
                                  name: "Page Heading",
                                  content: newPageName.trim(),
                                  styles: {
                                    fontSize: 44,
                                    fontWeight: "800",
                                    color: uiState.palette.text,
                                  },
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    };
                    setUiState(nextUi);
                    setNewPageName("");
                    void saveDocumentToServer(nextUi, sceneState);
                  }}
                  className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold cursor-pointer"
                >
                  + Add Page
                </button>
              </div>
            </div>
          )}

          {leftTab === "assets" && (
            <div className="space-y-4" data-testid="studio-assets-drawer">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Assets
                </span>
                <select
                  aria-label="Asset Category Filter"
                  data-testid="studio-assets-category-select"
                  value={assetCategoryFilter}
                  onChange={(e) =>
                    setAssetCategoryFilter(
                      e.target.value as typeof assetCategoryFilter,
                    )
                  }
                  className="px-2 py-1 rounded-lg bg-[#08090f] border border-white/10 text-[11px] text-white"
                >
                  {(
                    [
                      "All Assets",
                      "Images",
                      "Videos",
                      "3D",
                      "Sound",
                      "Vector",
                      "HDRI",
                    ] as const
                  ).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                {sceneState.objects.map((obj) => (
                  <div
                    key={obj.id}
                    className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">{obj.name}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">
                        3D • {obj.type}.glb
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedObjectId(obj.id)}
                      className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-[10px] font-semibold cursor-pointer"
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {leftTab === "library3d" && (
            <div className="space-y-4" data-testid="studio-library-3d-drawer">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                3D Library
              </div>
              <div className="grid grid-cols-2 gap-1 bg-[#08090f] p-1 rounded-xl border border-white/10">
                {(
                  ["Models", "Materials", "Components", "Templates"] as const
                ).map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setLibrary3dSubTab(sub)}
                    className={`py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer ${
                      library3dSubTab === sub
                        ? "bg-[#ff6b4a] text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
              {library3dSubTab === "Models" && (
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { type: "torus", label: "Cyber Torus" },
                      { type: "sphere", label: "Chrome Orb" },
                      { type: "icosahedron", label: "Crystal Gem" },
                      { type: "cylinder", label: "Pillar Core" },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => handleAdd3dObject(item.type)}
                      className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-[#ff6b4a]/20 border border-white/10 text-xs font-semibold text-left cursor-pointer"
                    >
                      + {item.label}
                    </button>
                  ))}
                </div>
              )}
              {library3dSubTab === "Materials" && selectedObject && (
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: "Iridescent Peach", color: "#ff6b4a", metalness: 0.75, roughness: 0.2 },
                    { name: "Liquid Chrome", color: "#e2e8f0", metalness: 0.98, roughness: 0.05 },
                    { name: "Cyber Cobalt", color: "#38bdf8", metalness: 0.65, roughness: 0.25 },
                    { name: "Obsidian Matte", color: "#1e293b", metalness: 0.2, roughness: 0.85 },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        const nextScene = {
                          ...sceneState,
                          objects: sceneState.objects.map((o) =>
                            o.id === selectedObject.id
                              ? {
                                  ...o,
                                  material: {
                                    ...o.material,
                                    color: preset.color,
                                    metalness: preset.metalness,
                                    roughness: preset.roughness,
                                  },
                                }
                              : o,
                          ),
                        };
                        setSceneState(nextScene);
                        void saveDocumentToServer(uiState, nextScene);
                      }}
                      className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-left space-y-1.5 cursor-pointer"
                    >
                      <span
                        className="block w-5 h-5 rounded-full border border-white/20"
                        style={{ backgroundColor: preset.color }}
                      />
                      <span className="block text-[11px] font-semibold text-white">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {(library3dSubTab === "Components" ||
                library3dSubTab === "Templates") && (
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-slate-400">
                  {library3dSubTab} presets ready to insert into active 3D scene.
                </div>
              )}
            </div>
          )}

          {leftTab === "settings" && (
            <div className="space-y-4" data-testid="studio-settings-drawer">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Site Settings
              </div>
              <div className="flex items-center gap-1 bg-[#08090f] p-1 rounded-xl border border-white/10">
                {(["general", "domains", "plans"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    data-testid={`studio-settings-tab-${tab}`}
                    onClick={() => setSettingsSubTab(tab)}
                    className={`flex-1 py-1 rounded-lg text-[11px] font-semibold capitalize cursor-pointer ${
                      settingsSubTab === tab
                        ? "bg-[#ff6b4a] text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {settingsSubTab === "general" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Website Title
                    </label>
                    <input
                      type="text"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#08090f] border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Subdomain Slug (.peachweb.site)
                    </label>
                    <input
                      type="text"
                      value={siteSlug}
                      onChange={(e) => setSiteSlug(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#08090f] border border-white/10 text-xs text-white font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      void saveDocumentToServer(uiState, sceneState, {
                        name: siteName,
                        slug: siteSlug,
                      })
                    }
                    className="w-full py-2.5 rounded-xl bg-[#ff6b4a] text-white text-xs font-bold cursor-pointer"
                  >
                    Save Site Settings
                  </button>
                </div>
              )}

              {settingsSubTab === "domains" && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#08090f] border border-white/10 space-y-1">
                    <div className="text-[11px] text-slate-400">Base Domain</div>
                    <div className="font-mono text-white">
                      {siteSlug}.peachweb.site
                    </div>
                    <div className="text-[10px] text-emerald-400 font-semibold">
                      {isPublished ? "Published" : "Website is not published"}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#08090f] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">
                        Custom Domain
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 text-[10px]">
                        Premium
                      </span>
                    </div>
                    <input
                      type="text"
                      value={customDomainInput}
                      onChange={(e) => setCustomDomainInput(e.target.value)}
                      placeholder="mywebsite.com"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#121422] border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>
              )}

              {settingsSubTab === "plans" && (
                <div className="space-y-2 text-xs">
                  {[
                    { name: "Individual", price: "$29/mo", bw: "10GB bandwidth" },
                    { name: "Basic", price: "$69/mo", bw: "50GB + Custom Code" },
                    { name: "Pro", price: "$179/mo", bw: "200GB + White-label" },
                  ].map((p) => (
                    <div
                      key={p.name}
                      className="p-2.5 rounded-xl bg-[#08090f] border border-white/10 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-white">{p.name}</div>
                        <div className="text-[10px] text-slate-400">{p.bw}</div>
                      </div>
                      <span className="font-mono font-bold text-[#ff6b4a]">
                        {p.price}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {leftTab === "outliner" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  3D Scene Outliner
                </span>
                <button
                  type="button"
                  onClick={() => setLeftTab("add3d")}
                  className="text-xs text-[#ff6b4a] font-bold cursor-pointer"
                >
                  + Add Mesh
                </button>
              </div>

              <div className="space-y-1.5">
                {sceneState.objects.map((obj) => (
                  <button
                    key={obj.id}
                    type="button"
                    onClick={() => setSelectedObjectId(obj.id)}
                    className={`w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between cursor-pointer ${
                      selectedObject?.id === obj.id
                        ? "bg-[#ff6b4a]/20 text-[#ff6b4a] border border-[#ff6b4a]/40"
                        : "bg-white/[0.03] hover:bg-white/[0.07] text-slate-200"
                    }`}
                  >
                    <span className="truncate">{obj.name}</span>
                    <span className="text-[10px] font-mono uppercase text-slate-400">
                      {obj.type}
                    </span>
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Scene Lights ({sceneState.lights.length})</span>
                </div>
                {sceneState.lights.map((light) => (
                  <div
                    key={light.id}
                    className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs flex items-center justify-between"
                  >
                    <span>{light.name}</span>
                    <input
                      type="color"
                      value={light.color}
                      onChange={(e) => {
                        const nextScene: PeachSceneState = {
                          ...sceneState,
                          lights: sceneState.lights.map((l) =>
                            l.id === light.id ? { ...l, color: e.target.value } : l,
                          ),
                        };
                        setSceneState(nextScene);
                        void saveDocumentToServer(uiState, nextScene);
                      }}
                      className="w-6 h-6 rounded bg-transparent cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {leftTab === "add3d" && (
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Add 3D Primitive Mesh
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { type: "cylinder", label: "Cylinder" },
                    { type: "torus", label: "Torus Knot" },
                    { type: "sphere", label: "Sphere Orb" },
                    { type: "icosahedron", label: "Icosahedron" },
                    { type: "box", label: "Cube Box" },
                    { type: "cone", label: "Cone" },
                    { type: "ring", label: "Orbital Ring" },
                    { type: "plane", label: "Surface Plane" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    data-testid={`add-3d-${item.type}`}
                    onClick={() => handleAdd3dObject(item.type)}
                    className="p-3 rounded-xl bg-white/[0.04] hover:bg-[#ff6b4a]/20 border border-white/10 text-xs font-semibold text-left cursor-pointer"
                  >
                    + {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* ==================== CENTER INTERACTIVE VIEWPORT ==================== */}
        <main className="flex-1 bg-[#07080d] flex flex-col items-center justify-center p-4 overflow-hidden relative">
          <div
            style={{
              width:
                viewport === "desktop"
                  ? "100%"
                  : viewport === "tablet"
                    ? "768px"
                    : "390px",
            }}
            className="h-full rounded-2xl border border-white/15 bg-[#090a10] overflow-hidden relative flex flex-col shadow-2xl transition-all"
          >
            {/* Three.js WebGL Layer */}
            <div
              className={`absolute inset-0 z-0 ${
                cameraViewActive ? "ring-4 ring-inset ring-[#ff6b4a]" : ""
              }`}
            >
              <PeachThreeCanvas
                sceneState={sceneState}
                scrollProgress={scrollProgress}
                selectedObjectId={selectedObject?.id ?? null}
                onSelectObject={(id) => {
                  if (id) setSelectedObjectId(id);
                }}
                interactiveOrbit={true}
              />
              {cameraViewActive && (
                <div
                  data-testid="camera-view-active-overlay"
                  className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4"
                >
                  <div className="flex justify-center">
                    <div className="pointer-events-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121422]/90 border border-[#ff6b4a] text-xs font-semibold text-white shadow-lg">
                      <span>Home &gt; Main Camera</span>
                      <button
                        type="button"
                        data-testid="exit-camera-view-btn"
                        onClick={() => setCameraViewActive(false)}
                        className="px-2 py-0.5 rounded-full bg-[#ff6b4a] text-white text-[11px] font-bold cursor-pointer"
                      >
                        Exit Camera View
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {studioMode === "3d" && (
                <div
                  data-testid="camera-pip-card"
                  className="absolute bottom-3 left-3 z-20 w-48 rounded-xl bg-[#121422]/90 border border-white/15 p-2.5 shadow-xl space-y-2"
                >
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-200">
                    <span>Main Camera</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      FOV {sceneState.camera.fov}
                    </span>
                  </div>
                  <button
                    type="button"
                    data-testid="toggle-camera-view-btn"
                    onClick={() => setCameraViewActive(!cameraViewActive)}
                    className="w-full py-1.5 rounded-lg bg-white/10 hover:bg-[#ff6b4a] text-white text-[11px] font-bold transition cursor-pointer"
                  >
                    {cameraViewActive
                      ? "This Camera Is Active"
                      : "Enter camera view"}
                  </button>
                </div>
              )}
            </div>

            {/* UI Overlay Layer */}
            <div
              onScroll={(e) => {
                const el = e.currentTarget;
                const max = Math.max(1, el.scrollHeight - el.clientHeight);
                setScrollProgress(el.scrollTop / max);
              }}
              className={`relative z-10 flex-1 overflow-y-auto p-6 ${
                studioMode === "3d" ? "pointer-events-none opacity-45" : ""
              }`}
            >
              <PeachUiOverlay
                uiState={uiState}
                viewport={viewport}
                editable={studioMode === "ui"}
                selectedElementId={selectedElementId}
                onSelectElement={(id) => setSelectedElementId(id)}
              />
            </div>
          </div>
        </main>

        {/* ==================== RIGHT CONTEXTUAL INSPECTOR ==================== */}
        <aside className="w-72 border-l border-white/10 bg-[#0f111c] p-4 overflow-y-auto shrink-0 space-y-5">
          {studioMode === "ui" && selectedElement ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <div className="text-[10px] font-mono uppercase text-[#ff6b4a]">
                    UI Element Inspector
                  </div>
                  <div className="text-xs font-bold">{selectedElement.name}</div>
                </div>
                <button
                  type="button"
                  title="Delete Element"
                  onClick={() => {
                    pushUndoSnapshot();
                    const nextPages = uiState.pages.map((p) =>
                      p.id === uiState.activePageId
                        ? {
                            ...p,
                            elements: deleteElementById(
                              p.elements,
                              selectedElement.id,
                            ),
                          }
                        : p,
                    );
                    const nextUi = { ...uiState, pages: nextPages };
                    setUiState(nextUi);
                    setSelectedElementId(null);
                    void saveDocumentToServer(nextUi, sceneState);
                  }}
                  className="p-1.5 rounded-lg bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {selectedElement.content !== undefined && (
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Text Content
                  </label>
                  <textarea
                    rows={3}
                    data-testid="inspector-ui-content"
                    value={selectedElement.content}
                    onChange={(e) => {
                      const nextPages = uiState.pages.map((p) =>
                        p.id === uiState.activePageId
                          ? {
                              ...p,
                              elements: updateElementById(
                                p.elements,
                                selectedElement.id,
                                (el) => ({ ...el, content: e.target.value }),
                              ),
                            }
                          : p,
                      );
                      const nextUi = { ...uiState, pages: nextPages };
                      setUiState(nextUi);
                    }}
                    onBlur={() => void saveDocumentToServer()}
                    className="w-full px-3 py-2 rounded-xl bg-[#08090f] border border-white/10 text-xs text-white"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Font Size (px)
                  </label>
                  <input
                    type="number"
                    value={selectedElement.styles.fontSize ?? 16}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const nextPages = uiState.pages.map((p) =>
                        p.id === uiState.activePageId
                          ? {
                              ...p,
                              elements: updateElementById(
                                p.elements,
                                selectedElement.id,
                                (el) => ({
                                  ...el,
                                  styles: { ...el.styles, fontSize: val },
                                }),
                              ),
                            }
                          : p,
                      );
                      const nextUi = { ...uiState, pages: nextPages };
                      setUiState(nextUi);
                      void saveDocumentToServer(nextUi, sceneState);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#08090f] border border-white/10 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Border Radius
                  </label>
                  <input
                    type="number"
                    value={selectedElement.styles.borderRadius ?? 0}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const nextPages = uiState.pages.map((p) =>
                        p.id === uiState.activePageId
                          ? {
                              ...p,
                              elements: updateElementById(
                                p.elements,
                                selectedElement.id,
                                (el) => ({
                                  ...el,
                                  styles: { ...el.styles, borderRadius: val },
                                }),
                              ),
                            }
                          : p,
                      );
                      const nextUi = { ...uiState, pages: nextPages };
                      setUiState(nextUi);
                      void saveDocumentToServer(nextUi, sceneState);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#08090f] border border-white/10 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Padding Y (px)
                  </label>
                  <input
                    type="number"
                    value={selectedElement.styles.paddingTop ?? 16}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const nextPages = uiState.pages.map((p) =>
                        p.id === uiState.activePageId
                          ? {
                              ...p,
                              elements: updateElementById(
                                p.elements,
                                selectedElement.id,
                                (el) => ({
                                  ...el,
                                  styles: {
                                    ...el.styles,
                                    paddingTop: val,
                                    paddingBottom: val,
                                  },
                                }),
                              ),
                            }
                          : p,
                      );
                      const nextUi = { ...uiState, pages: nextPages };
                      setUiState(nextUi);
                      void saveDocumentToServer(nextUi, sceneState);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#08090f] border border-white/10 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Padding X (px)
                  </label>
                  <input
                    type="number"
                    value={selectedElement.styles.paddingLeft ?? 24}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const nextPages = uiState.pages.map((p) =>
                        p.id === uiState.activePageId
                          ? {
                              ...p,
                              elements: updateElementById(
                                p.elements,
                                selectedElement.id,
                                (el) => ({
                                  ...el,
                                  styles: {
                                    ...el.styles,
                                    paddingLeft: val,
                                    paddingRight: val,
                                  },
                                }),
                              ),
                            }
                          : p,
                      );
                      const nextUi = { ...uiState, pages: nextPages };
                      setUiState(nextUi);
                      void saveDocumentToServer(nextUi, sceneState);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#08090f] border border-white/10 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* 3D Object & Shader Inspector */
            selectedObject && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <div className="text-[10px] font-mono uppercase text-[#ff6b4a]">
                      3D Mesh & Shader Inspector
                    </div>
                    <div className="text-xs font-bold">{selectedObject.name}</div>
                  </div>
                  {sceneState.objects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const nextScene = {
                          ...sceneState,
                          objects: sceneState.objects.filter(
                            (o) => o.id !== selectedObject.id,
                          ),
                        };
                        setSceneState(nextScene);
                        setSelectedObjectId(nextScene.objects[0]?.id ?? null);
                        void saveDocumentToServer(uiState, nextScene);
                      }}
                      className="p-1.5 rounded-lg bg-rose-500/15 text-rose-300 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Performance Telemetry Card */}
                <div
                  data-testid="inspector-3d-performance"
                  className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-slate-400">
                      Performance
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
                      Optimal
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <span>Poly Count</span>
                    <span className="font-mono">
                      {sceneState.objects.length * 128} tris
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <span>GPU RAM</span>
                    <span className="font-mono">
                      {(sceneState.objects.length * 2.4).toFixed(1)} MB
                    </span>
                  </div>
                </div>

                {/* Transform Position X / Y / Z */}
                <div>
                  <div className="text-[11px] font-semibold text-slate-300 mb-1.5">
                    Position (X, Y, Z)
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["x", "y", "z"] as const).map((axis) => (
                      <input
                        key={axis}
                        type="number"
                        step={0.2}
                        value={selectedObject.position[axis]}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          const nextScene = {
                            ...sceneState,
                            objects: sceneState.objects.map((o) =>
                              o.id === selectedObject.id
                                ? {
                                    ...o,
                                    position: { ...o.position, [axis]: val },
                                  }
                                : o,
                            ),
                          };
                          setSceneState(nextScene);
                          void saveDocumentToServer(uiState, nextScene);
                        }}
                        className="px-2 py-1.5 rounded-lg bg-[#08090f] border border-white/10 text-xs text-white font-mono"
                      />
                    ))}
                  </div>
                </div>

                {/* Scale Uniform */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                    <span>Mesh Scale</span>
                    <span className="font-mono">{selectedObject.scale.x}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.3}
                    max={3}
                    step={0.05}
                    value={selectedObject.scale.x}
                    onChange={(e) => {
                      const s = Number(e.target.value);
                      const nextScene = {
                        ...sceneState,
                        objects: sceneState.objects.map((o) =>
                          o.id === selectedObject.id
                            ? { ...o, scale: { x: s, y: s, z: s } }
                            : o,
                        ),
                      };
                      setSceneState(nextScene);
                    }}
                    onMouseUp={() => void saveDocumentToServer()}
                    className="w-full accent-[#ff6b4a]"
                  />
                </div>

                {/* PBR Material Controls */}
                <div className="pt-3 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-slate-400">
                      PBR Physical Material
                    </span>
                    <button
                      type="button"
                      data-testid="open-material-editor-btn"
                      onClick={() => setMaterialEditorOpen(!materialEditorOpen)}
                      className="text-[11px] text-[#ff6b4a] font-semibold cursor-pointer"
                    >
                      {materialEditorOpen ? "Close Editor" : "Material Editor"}
                    </button>
                  </div>

                  {materialEditorOpen && (
                    <div
                      data-testid="floating-material-editor"
                      className="p-3 rounded-xl bg-[#08090f] border border-[#ff6b4a]/40 space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">
                          {selectedObject.name} Material
                        </span>
                        <button
                          type="button"
                          data-testid="ai-create-material-btn"
                          onClick={() =>
                            setAiMaterialPromptOpen(!aiMaterialPromptOpen)
                          }
                          className="px-2 py-1 rounded-lg bg-violet-500/20 text-violet-300 text-[10px] font-bold cursor-pointer"
                        >
                          + Create Material
                        </button>
                      </div>
                      {aiMaterialPromptOpen && (
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            value={aiMaterialPrompt}
                            onChange={(e) => setAiMaterialPrompt(e.target.value)}
                            placeholder="Describe material (e.g. brushed gold)"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#121422] border border-white/10 text-[11px] text-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const nextScene = {
                                ...sceneState,
                                objects: sceneState.objects.map((o) =>
                                  o.id === selectedObject.id
                                    ? {
                                        ...o,
                                        material: {
                                          ...o.material,
                                          color: "#f59e0b",
                                          metalness: 0.9,
                                          roughness: 0.18,
                                        },
                                      }
                                    : o,
                                ),
                              };
                              setSceneState(nextScene);
                              setAiMaterialPromptOpen(false);
                              void saveDocumentToServer(uiState, nextScene);
                            }}
                            className="w-full py-1 rounded-lg bg-[#ff6b4a] text-white text-[11px] font-bold cursor-pointer"
                          >
                            Generate PBR Shader
                          </button>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Material Type</span>
                        <select
                          value={materialShaderType}
                          onChange={(e) =>
                            setMaterialShaderType(
                              e.target.value as typeof materialShaderType,
                            )
                          }
                          className="px-2 py-1 rounded bg-[#121422] border border-white/10 text-[11px] text-white"
                        >
                          {(
                            [
                              "Standard",
                              "Physical",
                              "Toon",
                              "Basic",
                              "Matcap",
                            ] as const
                          ).map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs">
                    <span>Albedo Color</span>
                    <input
                      type="color"
                      value={selectedObject.material.color}
                      onChange={(e) => {
                        const nextScene = {
                          ...sceneState,
                          objects: sceneState.objects.map((o) =>
                            o.id === selectedObject.id
                              ? {
                                  ...o,
                                  material: { ...o.material, color: e.target.value },
                                }
                              : o,
                          ),
                        };
                        setSceneState(nextScene);
                        void saveDocumentToServer(uiState, nextScene);
                      }}
                      className="w-7 h-7 rounded bg-transparent cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                      <span>Metalness</span>
                      <span className="font-mono">
                        {selectedObject.material.metalness}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={selectedObject.material.metalness}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setSceneState({
                          ...sceneState,
                          objects: sceneState.objects.map((o) =>
                            o.id === selectedObject.id
                              ? {
                                  ...o,
                                  material: { ...o.material, metalness: val },
                                }
                              : o,
                          ),
                        });
                      }}
                      className="w-full accent-[#ff6b4a]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                      <span>Roughness</span>
                      <span className="font-mono">
                        {selectedObject.material.roughness}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={selectedObject.material.roughness}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setSceneState({
                          ...sceneState,
                          objects: sceneState.objects.map((o) =>
                            o.id === selectedObject.id
                              ? {
                                  ...o,
                                  material: { ...o.material, roughness: val },
                                }
                              : o,
                          ),
                        });
                      }}
                      className="w-full accent-[#ff6b4a]"
                    />
                  </div>

                  <label className="flex items-center justify-between text-xs cursor-pointer">
                    <span>Wireframe Shader</span>
                    <input
                      type="checkbox"
                      checked={selectedObject.material.wireframe}
                      onChange={(e) => {
                        const nextScene = {
                          ...sceneState,
                          objects: sceneState.objects.map((o) =>
                            o.id === selectedObject.id
                              ? {
                                  ...o,
                                  material: {
                                    ...o.material,
                                    wireframe: e.target.checked,
                                  },
                                }
                              : o,
                          ),
                        };
                        setSceneState(nextScene);
                        void saveDocumentToServer(uiState, nextScene);
                      }}
                      className="accent-[#ff6b4a]"
                    />
                  </label>
                </div>

                {/* Post-Processing & Scene Helpers */}
                <div className="pt-3 border-t border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-slate-400">
                      Post-Processing & Grid
                    </span>
                    <button
                      type="button"
                      data-testid="ai-generate-effect-btn"
                      onClick={() => setAiEffectPromptOpen(!aiEffectPromptOpen)}
                      className="text-[10px] font-bold text-violet-300 bg-violet-500/20 px-2 py-0.5 rounded-lg cursor-pointer"
                    >
                      + Generate Effect
                    </button>
                  </div>
                  {aiEffectPromptOpen && (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={aiEffectPrompt}
                        onChange={(e) => setAiEffectPrompt(e.target.value)}
                        placeholder="Describe shader effect (e.g. neon bloom)"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#08090f] border border-white/10 text-[11px] text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const nextScene = {
                            ...sceneState,
                            postProcessing: {
                              ...sceneState.postProcessing,
                              bloomEnabled: true,
                            },
                          };
                          setSceneState(nextScene);
                          setAiEffectPromptOpen(false);
                          void saveDocumentToServer(uiState, nextScene);
                        }}
                        className="w-full py-1 rounded-lg bg-[#ff6b4a] text-white text-[11px] font-bold cursor-pointer"
                      >
                        Apply Shader Effect
                      </button>
                    </div>
                  )}
                  <label className="flex items-center justify-between text-xs cursor-pointer">
                    <span>Bloom Glow Effect</span>
                    <input
                      type="checkbox"
                      checked={sceneState.postProcessing.bloomEnabled}
                      onChange={(e) => {
                        const nextScene = {
                          ...sceneState,
                          postProcessing: {
                            ...sceneState.postProcessing,
                            bloomEnabled: e.target.checked,
                          },
                        };
                        setSceneState(nextScene);
                        void saveDocumentToServer(uiState, nextScene);
                      }}
                      className="accent-[#ff6b4a]"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs cursor-pointer">
                    <span>3D Floor Grid Helper</span>
                    <input
                      type="checkbox"
                      checked={sceneState.environment.gridVisible}
                      onChange={(e) => {
                        const nextScene = {
                          ...sceneState,
                          environment: {
                            ...sceneState.environment,
                            gridVisible: e.target.checked,
                          },
                        };
                        setSceneState(nextScene);
                        void saveDocumentToServer(uiState, nextScene);
                      }}
                      className="accent-[#ff6b4a]"
                    />
                  </label>
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                      <span>Atmospheric Fog Density</span>
                      <span className="font-mono">
                        {sceneState.environment.fogDensity}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={0.12}
                      step={0.01}
                      value={sceneState.environment.fogDensity}
                      onChange={(e) => {
                        const nextScene = {
                          ...sceneState,
                          environment: {
                            ...sceneState.environment,
                            fogDensity: Number(e.target.value),
                          },
                        };
                        setSceneState(nextScene);
                      }}
                      onMouseUp={() => void saveDocumentToServer()}
                      className="w-full accent-[#ff6b4a]"
                    />
                  </div>
                </div>
              </div>
            )
          )}
        </aside>
      </div>

      {/* ==================== BOTTOM ANIMATE KEYFRAME TIMELINE DOCK ==================== */}
      {studioMode === "animate" && (
        <div
          data-testid="animate-timeline-dock"
          className="h-32 border-t border-white/10 bg-[#0b0d17] px-6 py-3 flex flex-col justify-between shrink-0 z-20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
                className="px-3 py-1.5 rounded-xl bg-[#ff6b4a] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {isPlayingTimeline ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Play Scroll Timeline</span>
                  </>
                )}
              </button>
              <span className="text-xs font-mono text-slate-300">
                Scroll Progress: {Math.round(scrollProgress * 100)}%
              </span>
            </div>

            <button
              type="button"
              data-testid="add-keyframe-btn"
              onClick={handleAddKeyframe}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#ff6b4a]" />
              <span>
                + Add Keyframe at {Math.round(scrollProgress * 100)}%
              </span>
            </button>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={scrollProgress}
              onChange={(e) => setScrollProgress(Number(e.target.value))}
              className="w-full accent-[#ff6b4a]"
            />

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {sceneState.keyframes.map((kf) => (
                <button
                  key={kf.id}
                  type="button"
                  onClick={() => setScrollProgress(kf.scrollProgress)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono cursor-pointer border ${
                    Math.abs(scrollProgress - kf.scrollProgress) < 0.03
                      ? "bg-[#ff6b4a]/20 border-[#ff6b4a] text-white font-bold"
                      : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  {kf.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== VERSION HISTORY MODAL ==================== */}
      {versionsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full rounded-3xl bg-[#121422] border border-white/15 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <History className="w-5 h-5 text-[#ff6b4a]" />
                <span>Version History ({versions.length})</span>
              </h2>
              <button
                type="button"
                data-testid="close-versions-modal-btn"
                onClick={() => setVersionsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateVersionSnapshot} className="flex gap-2">
              <input
                type="text"
                data-testid="version-label-input"
                value={newVersionLabel}
                onChange={(e) => setNewVersionLabel(e.target.value)}
                placeholder="e.g. v1.0 Cylinder 3D Scene"
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#090b12] border border-white/10 text-xs text-white"
              />
              <button
                type="submit"
                data-testid="save-version-snapshot-btn"
                className="px-4 py-2 rounded-xl bg-[#ff6b4a] text-white text-xs font-bold cursor-pointer"
              >
                Save Snapshot
              </button>
            </form>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {versions.map((ver) => (
                <div
                  key={ver.id}
                  className="p-3.5 rounded-2xl bg-[#090b12] border border-white/10 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-white">{ver.label}</div>
                    <div className="text-[11px] text-slate-400">
                      {new Date(ver.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleRestoreVersion(ver.id)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restore</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== COMMENTS MODAL ==================== */}
      {commentsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full rounded-3xl bg-[#121422] border border-white/15 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#ff6b4a]" />
                <span>Spatial Scene Comments ({comments.length})</span>
              </h2>
              <button
                type="button"
                onClick={() => setCommentsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateComment} className="flex gap-2">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Pin feedback on the current 3D scene..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#090b12] border border-white/10 text-xs text-white"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#ff6b4a] text-white text-xs font-bold cursor-pointer"
              >
                Post
              </button>
            </form>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-2xl bg-[#090b12] border border-white/10 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="text-white font-medium">{c.content}</div>
                    <div className="text-[10px] text-slate-400">
                      {c.author?.name ?? c.author?.email ?? "Creator"} •{" "}
                      {new Date(c.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                  {c.resolved && (
                    <span className="text-emerald-400 text-[10px] font-bold">
                      Resolved
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== SHARE MODAL ==================== */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl bg-[#121422] border border-white/15 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Share 3D Project</h2>
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Collaborators
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={collaboratorEmail}
                  onChange={(e) => setCollaboratorEmail(e.target.value)}
                  placeholder="Invite by email"
                  className="flex-1 px-3 py-2 rounded-xl bg-[#090b12] border border-white/10 text-xs text-white"
                />
                <select
                  value={collaboratorRole}
                  onChange={(e) =>
                    setCollaboratorRole(
                      e.target.value as "Editor" | "Viewer",
                    )
                  }
                  className="px-2.5 py-2 rounded-xl bg-[#090b12] border border-white/10 text-xs text-white"
                >
                  <option value="Editor">Editor</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#090b12] border border-white/10 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Share link</span>
                <button
                  type="button"
                  data-testid="create-share-link-btn"
                  onClick={() => setShareLinkActive(true)}
                  className="px-3 py-1 rounded-lg bg-[#ff6b4a] text-white text-[11px] font-bold cursor-pointer"
                >
                  {shareLinkActive ? "Link Active" : "Create link"}
                </button>
              </div>
              <div className="font-mono text-white">/preview/{websiteId}</div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== PUBLISH MODAL ==================== */}
      {publishModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl bg-[#121422] border border-white/15 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Rocket className="w-5 h-5 text-[#ff6b4a]" />
                <span>Publish 3D Website Live</span>
              </h2>
              <button
                type="button"
                onClick={() => setPublishModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1.5">
                Subdomain Slug (.peachweb.site)
              </label>
              <input
                type="text"
                value={siteSlug}
                onChange={(e) => setSiteSlug(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090b12] border border-white/10 text-xs text-white font-mono"
              />
            </div>

            {publishedUrl && isPublished && (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 space-y-2">
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Website is Published Live!</span>
                </div>
                <Link
                  href={publishedUrl}
                  data-testid="published-live-site-link"
                  className="text-xs font-mono text-white underline flex items-center gap-1.5"
                >
                  <span>
                    {siteSlug}.peachweb.site ({publishedUrl})
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPublishModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 text-xs font-semibold"
              >
                Close
              </button>
              <button
                type="button"
                data-testid="confirm-publish-now-btn"
                disabled={publishing}
                onClick={() => void handlePublishLive()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff6b4a] to-[#ec4899] text-white text-xs font-bold cursor-pointer"
              >
                {publishing ? "Publishing..." : "Publish Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
