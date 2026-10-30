import { NextResponse } from "next/server";
import { recordAuditLog } from "@/lib/account-admission/audit";
import { AdmissionError } from "@/lib/account-admission/errors";
import { requireAuthenticatedActor } from "@/lib/account-admission/session";
import { toErrorResponse } from "@/lib/api";
import type { PeachSceneState, PeachUiState } from "@/lib/document-types";
import { prisma } from "@/lib/prisma";

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
      slug?: string;
      uiState?: PeachUiState;
      sceneState?: PeachSceneState;
    };

    const uiStateJson = body.uiState ? JSON.stringify(body.uiState) : website.uiStateJson;
    const sceneStateJson = body.sceneState
      ? JSON.stringify(body.sceneState)
      : website.sceneStateJson;

    const customSlug =
      typeof body.slug === "string" && body.slug.trim()
        ? body.slug
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9-]+/g, "-")
            .replace(/^-|-$/g, "")
        : website.slug;

    const now = new Date();

    const published = await prisma.$transaction(async (tx) => {
      const updated = await tx.website.update({
        where: { id },
        data: {
          slug: customSlug || website.slug,
          uiStateJson,
          sceneStateJson,
          publishedUiStateJson: uiStateJson,
          publishedSceneStateJson: sceneStateJson,
          isPublished: true,
          publishedAt: now,
        },
      });

      await tx.websiteVersion.create({
        data: {
          websiteId: id,
          label: `Published Live (${now.toISOString().slice(0, 16).replace("T", " ")})`,
          uiStateJson,
          sceneStateJson,
          createdById: actor.userId,
        },
      });

      await recordAuditLog(tx, {
        actorId: actor.userId,
        actorEmail: actor.email,
        action: "WEBSITE_PUBLISHED",
        targetType: "WEBSITE",
        targetId: id,
        metadata: {
          slug: updated.slug,
          publishedUrl: `/site/${updated.slug}`,
        },
      });

      return updated;
    });

    return NextResponse.json({
      website: published,
      publishedUrl: `/site/${published.slug}`,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
