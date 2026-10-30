import { NextResponse } from "next/server";
import { AdmissionError } from "@/lib/account-admission/errors";
import { requireAuthenticatedActor } from "@/lib/account-admission/session";
import { toErrorResponse } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuthenticatedActor(prisma);
    const { id } = await context.params;

    const comments = await prisma.websiteComment.findMany({
      where: { websiteId: id },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, email: true, avatarColor: true } },
      },
    });

    return NextResponse.json({ comments });
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
    const body = (await request.json().catch(() => ({}))) as {
      action?: "create" | "resolve";
      commentId?: string;
      content?: string;
      pageId?: string;
      xPercent?: number;
      yPercent?: number;
    };

    if (body.action === "resolve" && body.commentId) {
      const updated = await prisma.websiteComment.update({
        where: { id: body.commentId },
        data: { resolved: true },
        include: {
          author: { select: { id: true, name: true, email: true, avatarColor: true } },
        },
      });
      return NextResponse.json({ comment: updated });
    }

    const content = (body.content ?? "").trim();
    if (!content) {
      throw new AdmissionError("INVALID_NAME", "Comment content cannot be empty.", 400);
    }

    const comment = await prisma.websiteComment.create({
      data: {
        websiteId: id,
        authorId: actor.userId,
        pageId: body.pageId ?? "page-home",
        content,
        xPercent: typeof body.xPercent === "number" ? body.xPercent : 50,
        yPercent: typeof body.yPercent === "number" ? body.yPercent : 35,
      },
      include: {
        author: { select: { id: true, name: true, email: true, avatarColor: true } },
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
