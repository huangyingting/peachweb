import { NextResponse } from "next/server";
import { recordAuditLog } from "@/lib/account-admission/audit";
import { requireAuthenticatedActor } from "@/lib/account-admission/session";
import { toErrorResponse } from "@/lib/api";
import type { PeachSceneState, PeachUiState } from "@/lib/document-types";
import { prisma } from "@/lib/prisma";
import { synthesizeRemixDocument } from "@/lib/remix-generator";
import {
  createDefaultSceneState,
  createDefaultUiState,
  getTemplateById,
} from "@/lib/templates-catalog";
import { ensureDefaultWorkspaceForUser } from "../workspaces/route";

export async function GET(request: Request) {
  try {
    const actor = await requireAuthenticatedActor(prisma);
    const defaultWorkspace = await ensureDefaultWorkspaceForUser(actor.userId, actor.name);
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId") || defaultWorkspace.id;
    const archived = searchParams.get("archived") === "true";
    const customTemplatesOnly = searchParams.get("customTemplates") === "true";
    const search = (searchParams.get("search") || "").trim().toLowerCase();

    const websites = await prisma.website.findMany({
      where: {
        workspaceId,
        isArchived: archived,
        ...(customTemplatesOnly ? { isCustomTemplate: true } : {}),
      },
      orderBy: { updatedAt: "desc" },
      include: {
        versions: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        _count: {
          select: { comments: true, versions: true },
        },
      },
    });

    const filtered = search
      ? websites.filter(
          (w) =>
            w.name.toLowerCase().includes(search) ||
            w.slug.toLowerCase().includes(search) ||
            w.category.toLowerCase().includes(search),
        )
      : websites;

    return NextResponse.json({
      websites: filtered,
      workspaceId,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireAuthenticatedActor(prisma);
    const defaultWorkspace = await ensureDefaultWorkspaceForUser(actor.userId, actor.name);

    const body = (await request.json().catch(() => ({}))) as {
      name?: string;
      description?: string;
      category?: string;
      workspaceId?: string;
      templateId?: string;
      sourceWebsiteId?: string;
      isCustomTemplate?: boolean;
      remix?: {
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
      };
      uiState?: PeachUiState;
      sceneState?: PeachSceneState;
    };

    const workspaceId = body.workspaceId || defaultWorkspace.id;

    let name = (body.name ?? "").trim();
    let description = (body.description ?? "").trim();
    let category = body.category ?? "SAAS";
    let thumbnailGradient =
      "linear-gradient(135deg, #ff6b4a 0%, #9333ea 55%, #090a10 100%)";
    let uiState: PeachUiState;
    let sceneState: PeachSceneState;

    if (body.remix) {
      name = body.remix.businessName.trim() || "PeachWeb AI 3D Site";
      description = body.remix.businessDescription.trim();
      category = body.remix.category || "SAAS";
      const synthesized = synthesizeRemixDocument(body.remix);
      uiState = synthesized.uiState;
      sceneState = synthesized.sceneState;
      thumbnailGradient = `linear-gradient(135deg, ${body.remix.palette.primary} 0%, ${body.remix.palette.secondary} 55%, ${body.remix.palette.background} 100%)`;
    } else if (body.sourceWebsiteId) {
      const source = await prisma.website.findUnique({
        where: { id: body.sourceWebsiteId },
      });
      name = name || `${source?.name ?? "3D Website"} (Copy)`;
      description = description || source?.description || "";
      category = source?.category ?? "SAAS";
      thumbnailGradient = source?.thumbnailGradient ?? thumbnailGradient;
      uiState = source
        ? (JSON.parse(source.uiStateJson) as PeachUiState)
        : createDefaultUiState({ brandName: name });
      sceneState = source
        ? (JSON.parse(source.sceneStateJson) as PeachSceneState)
        : createDefaultSceneState();
    } else if (body.templateId) {
      const tpl = getTemplateById(body.templateId);
      name = name || tpl?.name || "New 3D Website";
      description = description || tpl?.description || "";
      category = tpl?.category ?? "SAAS";
      thumbnailGradient = tpl?.thumbnailGradient ?? thumbnailGradient;
      uiState = tpl ? structuredClone(tpl.uiState) : createDefaultUiState({ brandName: name });
      sceneState = tpl ? structuredClone(tpl.sceneState) : createDefaultSceneState();
    } else {
      name = name || "Untitled 3D Website";
      uiState = body.uiState ?? createDefaultUiState({ brandName: name });
      sceneState = body.sceneState ?? createDefaultSceneState();
    }

    const slugBase =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 28) || "peach-site";
    const uniqueSuffix = Math.random().toString(36).slice(2, 10);
    const slug = `${slugBase}-${uniqueSuffix}`;

    const website = await prisma.website.create({
      data: {
        name,
        slug,
        description: description || null,
        category,
        thumbnailGradient,
        workspaceId,
        ownerId: actor.userId,
        templateId: body.templateId ?? null,
        isCustomTemplate: Boolean(body.isCustomTemplate),
        uiStateJson: JSON.stringify(uiState),
        sceneStateJson: JSON.stringify(sceneState),
        versions: {
          create: {
            label: "v1.0 Initial Scene",
            uiStateJson: JSON.stringify(uiState),
            sceneStateJson: JSON.stringify(sceneState),
            createdById: actor.userId,
          },
        },
      },
      include: {
        versions: { orderBy: { createdAt: "desc" } },
      },
    });

    await recordAuditLog(prisma, {
      actorId: actor.userId,
      actorEmail: actor.email,
      action: body.remix ? "WEBSITE_CREATED_VIA_AI_REMIX" : "WEBSITE_CREATED",
      targetType: "WEBSITE",
      targetId: website.id,
      metadata: {
        name: website.name,
        slug: website.slug,
        category: website.category,
        templateId: body.templateId ?? null,
      },
    });

    return NextResponse.json({ website }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
