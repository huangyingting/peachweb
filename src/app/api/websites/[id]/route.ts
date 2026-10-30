import { NextResponse } from "next/server";
import { AdmissionError } from "@/lib/account-admission/errors";
import { requireAuthenticatedActor } from "@/lib/account-admission/session";
import { toErrorResponse } from "@/lib/api";
import type { PeachSceneState, PeachUiState } from "@/lib/document-types";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuthenticatedActor(prisma);
    const { id } = await context.params;

    const website = await prisma.website.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { createdAt: "desc" },
          include: {
            createdBy: { select: { id: true, name: true, email: true } },
          },
        },
        comments: {
          orderBy: { createdAt: "desc" },
          include: {
            author: { select: { id: true, name: true, email: true, avatarColor: true } },
          },
        },
      },
    });

    if (!website) {
      throw new AdmissionError("NOT_FOUND", "Website not found.", 404);
    }

    return NextResponse.json({
      website: {
        ...website,
        uiState: JSON.parse(website.uiStateJson) as PeachUiState,
        sceneState: JSON.parse(website.sceneStateJson) as PeachSceneState,
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuthenticatedActor(prisma);
    const { id } = await context.params;
    const existing = await prisma.website.findUnique({ where: { id } });

    if (!existing) {
      throw new AdmissionError("NOT_FOUND", "Website not found.", 404);
    }

    const body = (await request.json().catch(() => ({}))) as {
      name?: string;
      slug?: string;
      description?: string;
      category?: string;
      workspaceId?: string;
      isArchived?: boolean;
      isCustomTemplate?: boolean;
      uiState?: PeachUiState;
      sceneState?: PeachSceneState;
    };

    let nextSlug = existing.slug;
    if (typeof body.slug === "string" && body.slug.trim()) {
      nextSlug =
        body.slug
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9-]+/g, "-")
          .replace(/^-|-$/g, "") || existing.slug;
    }

    const updated = await prisma.website.update({
      where: { id },
      data: {
        name: typeof body.name === "string" && body.name.trim() ? body.name.trim() : existing.name,
        slug: nextSlug,
        description:
          body.description !== undefined ? body.description : existing.description,
        category: body.category ?? existing.category,
        workspaceId:
          typeof body.workspaceId === "string" && body.workspaceId.trim()
            ? body.workspaceId.trim()
            : existing.workspaceId,
        isArchived:
          typeof body.isArchived === "boolean" ? body.isArchived : existing.isArchived,
        isCustomTemplate:
          typeof body.isCustomTemplate === "boolean"
            ? body.isCustomTemplate
            : existing.isCustomTemplate,
        uiStateJson: body.uiState
          ? JSON.stringify(body.uiState)
          : existing.uiStateJson,
        sceneStateJson: body.sceneState
          ? JSON.stringify(body.sceneState)
          : existing.sceneStateJson,
      },
    });

    return NextResponse.json({
      website: {
        ...updated,
        uiState: JSON.parse(updated.uiStateJson) as PeachUiState,
        sceneState: JSON.parse(updated.sceneStateJson) as PeachSceneState,
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuthenticatedActor(prisma);
    const { id } = await context.params;
    await prisma.website.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
