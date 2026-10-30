"use client";

import type { PeachElementStyles, PeachUiElement, PeachUiState } from "@/lib/document-types";

interface PeachUiOverlayProps {
  uiState: PeachUiState;
  viewport?: "desktop" | "tablet" | "mobile";
  editable?: boolean;
  selectedElementId?: string | null;
  onSelectElement?: (id: string) => void;
  onScrollSectionActivate?: (scrollProgressTarget: number) => void;
}

function computeStyleObject(
  element: PeachUiElement,
  viewport: "desktop" | "tablet" | "mobile",
): React.CSSProperties {
  const base: PeachElementStyles = {
    ...element.styles,
    ...(viewport === "tablet" ? element.responsiveOverrides?.tablet : {}),
    ...(viewport === "mobile" ? element.responsiveOverrides?.mobile : {}),
  };

  return {
    display: base.display ?? "block",
    flexDirection: base.flexDirection,
    alignItems: base.alignItems,
    justifyContent: base.justifyContent,
    gap: base.gap !== undefined ? `${base.gap}px` : undefined,
    width: base.width ?? "100%",
    height: base.height,
    paddingTop: base.paddingTop !== undefined ? `${base.paddingTop}px` : undefined,
    paddingRight: base.paddingRight !== undefined ? `${base.paddingRight}px` : undefined,
    paddingBottom: base.paddingBottom !== undefined ? `${base.paddingBottom}px` : undefined,
    paddingLeft: base.paddingLeft !== undefined ? `${base.paddingLeft}px` : undefined,
    marginTop: base.marginTop !== undefined ? `${base.marginTop}px` : undefined,
    marginBottom: base.marginBottom !== undefined ? `${base.marginBottom}px` : undefined,
    fontSize: base.fontSize !== undefined ? `${base.fontSize}px` : undefined,
    fontWeight: base.fontWeight as React.CSSProperties["fontWeight"],
    color: base.color,
    backgroundColor: base.backgroundColor,
    borderRadius: base.borderRadius !== undefined ? `${base.borderRadius}px` : undefined,
    borderColor: base.borderColor,
    borderWidth: base.borderWidth !== undefined ? `${base.borderWidth}px` : undefined,
    borderStyle: base.borderWidth ? "solid" : undefined,
    opacity: base.opacity,
    textAlign: base.textAlign,
  };
}

export function PeachUiOverlay({
  uiState,
  viewport = "desktop",
  editable = false,
  selectedElementId = null,
  onSelectElement,
  onScrollSectionActivate,
}: PeachUiOverlayProps) {
  const activePage =
    uiState.pages.find((p) => p.id === uiState.activePageId) ?? uiState.pages[0];

  if (!activePage) {
    return null;
  }

  function renderNode(node: PeachUiElement) {
    const isSelected = editable && selectedElementId === node.id;
    const style = computeStyleObject(node, viewport);

    const interactiveProps = {
      key: node.id,
      "data-element-id": node.id,
      onClick: (e: React.MouseEvent) => {
        if (editable && onSelectElement) {
          e.stopPropagation();
          onSelectElement(node.id);
        }
        if (typeof node.scrollProgressTarget === "number" && onScrollSectionActivate) {
          onScrollSectionActivate(node.scrollProgressTarget);
        }
      },
      style,
      className: `transition-all relative ${
        editable ? "cursor-pointer hover:outline hover:outline-1 hover:outline-[#ff6b4a]/60" : ""
      } ${isSelected ? "outline outline-2 outline-[#ff6b4a] shadow-[0_0_0_4px_rgba(255,107,74,0.18)]" : ""}`,
    };

    if (node.type === "section" || node.type === "container") {
      return (
        <section {...interactiveProps}>
          {isSelected && (
            <span className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded bg-[#ff6b4a] text-[10px] font-bold text-white uppercase tracking-wider">
              {node.name}
            </span>
          )}
          {node.children?.map((child) => renderNode(child))}
        </section>
      );
    }

    if (node.type === "heading") {
      return <h2 {...interactiveProps}>{node.content || node.name}</h2>;
    }

    if (node.type === "button") {
      return (
        <button
          type="button"
          {...interactiveProps}
          style={{ ...style, width: node.styles.width ?? "auto", display: "inline-flex" }}
        >
          {node.content || node.name}
        </button>
      );
    }

    if (node.type === "badge") {
      return (
        <span
          {...interactiveProps}
          style={{ ...style, width: "auto", display: "inline-block" }}
        >
          {node.content || node.name}
        </span>
      );
    }

    if (node.type === "form") {
      return (
        <div {...interactiveProps}>
          <div className="text-sm font-semibold mb-2">
            {node.content || "Subscribe for 3D Updates"}
          </div>
          <div className="flex gap-2">
            <input
              type="email"
              readOnly={editable}
              placeholder="you@domain.com"
              className="px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-xs text-white flex-1"
            />
            <button
              type="button"
              style={{ backgroundColor: uiState.palette.primary }}
              className="px-4 py-2 rounded-lg text-xs font-bold text-white"
            >
              Submit
            </button>
          </div>
        </div>
      );
    }

    return <div {...interactiveProps}>{node.content || node.name}</div>;
  }

  return (
    <div
      style={{
        fontFamily: uiState.typography.bodyFont,
        color: uiState.palette.text,
      }}
      className="relative z-10 w-full"
    >
      {activePage.elements.map((el) => renderNode(el))}
    </div>
  );
}
