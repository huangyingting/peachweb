import { NextResponse } from "next/server";
import { recordAuditLog } from "@/lib/account-admission/audit";
import { AdmissionError } from "@/lib/account-admission/errors";
import { normalizeEmail } from "@/lib/account-admission/policy";
import { requireAuthenticatedActor } from "@/lib/account-admission/session";
import { toErrorResponse } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function ensureDefaultWorkspaceForUser(userId: string, userName: string | null) {
  const existing = await prisma.workspace.findFirst({
    where: {
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } },
      ],
    },
    include: {
      members: {
        include: {
          user: { select: { id: true, email: true, name: true, avatarColor: true } },
        },
      },
      invites: true,
    },
  });

  if (existing) {
    return existing;
  }

  const label = (userName ?? "Creator").trim() || "Creator";
  const slugBase = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "studio";
  return prisma.workspace.create({
    data: {
      name: `${label}'s Workspace`,
      slug: `${slugBase}-${userId.slice(-6)}-${Date.now().toString(36).slice(-3)}`,
      ownerId: userId,
      plan: "PRO",
      members: {
        create: {
          userId,
          role: "OWNER",
        },
      },
    },
    include: {
      members: {
        include: {
          user: { select: { id: true, email: true, name: true, avatarColor: true } },
        },
      },
      invites: true,
    },
  });
}

export async function GET() {
  try {
    const actor = await requireAuthenticatedActor(prisma);
    await ensureDefaultWorkspaceForUser(actor.userId, actor.name);

    const workspaces = await prisma.workspace.findMany({
      where: {
        OR: [
          { ownerId: actor.userId },
          { members: { some: { userId: actor.userId } } },
        ],
      },
      orderBy: { createdAt: "asc" },
      include: {
        members: {
          include: {
            user: { select: { id: true, email: true, name: true, avatarColor: true } },
          },
        },
        invites: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    const receivedInvites = await prisma.workspaceInvite.findMany({
      where: { email: actor.email },
      include: {
        workspace: {
          select: { id: true, name: true, slug: true, plan: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ workspaces, receivedInvites });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireAuthenticatedActor(prisma);
    const body = (await request.json().catch(() => ({}))) as {
      action?: "create_team" | "invite_member" | "accept_workspace_invite";
      name?: string;
      workspaceId?: string;
      email?: string;
      role?: "ADMIN" | "EDITOR" | "VIEWER";
      inviteId?: string;
    };

    if (body.action === "invite_member") {
      const workspaceId = body.workspaceId ?? "";
      const email = normalizeEmail(body.email ?? "");
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
      });
      if (!workspace) {
        throw new AdmissionError("NOT_FOUND", "Workspace not found.", 404);
      }

      const invite = await prisma.workspaceInvite.create({
        data: {
          workspaceId,
          email,
          role: body.role ?? "EDITOR",
          status: "PENDING",
          invitedById: actor.userId,
        },
      });

      await recordAuditLog(prisma, {
        actorId: actor.userId,
        actorEmail: actor.email,
        action: "WORKSPACE_MEMBER_INVITED",
        targetType: "WORKSPACE",
        targetId: workspaceId,
        metadata: { email, role: invite.role },
      });

      return NextResponse.json({ invite }, { status: 201 });
    }

    if (body.action === "accept_workspace_invite" && body.inviteId) {
      const invite = await prisma.workspaceInvite.findUnique({
        where: { id: body.inviteId },
      });
      if (!invite || invite.email !== actor.email) {
        throw new AdmissionError("NOT_FOUND", "Workspace invite not found.", 404);
      }

      await prisma.$transaction([
        prisma.workspaceInvite.update({
          where: { id: invite.id },
          data: { status: "ACCEPTED" },
        }),
        prisma.workspaceMember.upsert({
          where: {
            workspaceId_userId: {
              workspaceId: invite.workspaceId,
              userId: actor.userId,
            },
          },
          update: { role: invite.role },
          create: {
            workspaceId: invite.workspaceId,
            userId: actor.userId,
            role: invite.role,
          },
        }),
      ]);

      return NextResponse.json({ ok: true });
    }

    const teamName = (body.name ?? "").trim();
    if (teamName.length < 2 || teamName.length > 64) {
      throw new AdmissionError("INVALID_NAME", "Team name must be between 2 and 64 characters.", 400);
    }

    const slugBase = teamName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "team";
    const workspace = await prisma.workspace.create({
      data: {
        name: teamName,
        slug: `${slugBase}-${Date.now().toString(36).slice(-5)}`,
        ownerId: actor.userId,
        plan: "PRO",
        members: {
          create: {
            userId: actor.userId,
            role: "OWNER",
          },
        },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, email: true, name: true, avatarColor: true } },
          },
        },
        invites: true,
      },
    });

    await recordAuditLog(prisma, {
      actorId: actor.userId,
      actorEmail: actor.email,
      action: "WORKSPACE_CREATED",
      targetType: "WORKSPACE",
      targetId: workspace.id,
      metadata: { name: workspace.name },
    });

    return NextResponse.json({ workspace }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
