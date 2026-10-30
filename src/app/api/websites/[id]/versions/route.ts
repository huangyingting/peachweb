import { NextResponse } from "next/server";
import { recordAuditLog } from "@/lib/account-admission/audit";
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
    const versions = await prisma.websiteVersion.findMany({
      where: { websiteId: id },
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
    return NextResponse.json({ versions });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireAuthenticatedActor(prisma);
    const { id } = await context.params;
    const website = await prisma.website.findUnique({ where: { id } });

    if (!website) {
      throw new AdmissionError("NOT_FOUND", "Website not found.", 404);
    }

    const body = (await request.json().catch(() => ({}))) as {
      action?: "create" | "restore";
      label?: string;
      versionId?: string;
      uiState?: PeachUiState;
      sceneState?: PeachSceneState;
    };

    if (body.action === "restore" && body.versionId) {
      const targetVersion = await prisma.websiteVersion.findUnique({
        where: { id: body.versionId },
      });
      if (!targetVersion || targetVersion.websiteId !== id) {
        throw new AdmissionError("NOT_FOUND", "Version snapshot not found.", 404);
      }

      const updatedWebsite = await prisma.website.update({
        where: { id },
        data: {
          uiStateJson: targetVersion.uiStateJson,
          sceneStateJson: targetVersion.sceneStateJson,
        },
      });

      await recordAuditLog(prisma, {
        actorId: actor.userId,
        actorEmail: actor.email,
        action: "VERSION_RESTORED",
        targetType: "WEBSITE",
        targetId: id,
        metadata: {
          versionId: targetVersion.id,
          label: targetVersion.label,
        },
      });

      return NextResponse.json({
        website: {
          ...updatedWebsite,
          uiState: JSON.parse(updatedWebsite.uiStateJson) as PeachUiState,
          sceneState: JSON.parse(updatedWebsite.sceneStateJson) as PeachSceneState,
        },
      });
    }

    const label = (body.label ?? "").trim() || `Snapshot ${new Date().toISOString().slice(11, 16)}`;
    const uiStateJson = body.uiState ? JSON.stringify(body.uiState) : website.uiStateJson;
    const sceneStateJson = body.sceneState
      ? JSON.stringify(body.sceneState)
      : website.sceneStateJson;

    const version = await prisma.websiteVersion.create({
      data: {
        websiteId: id,
        label,
        uiStateJson,
        sceneStateJson,
        createdById: actor.userId,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    await prisma.website.update({
      where: { id },
      data: { uiStateJson, sceneStateJson },
    });

    return NextResponse.json({ version }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
