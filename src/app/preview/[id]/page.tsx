import { notFound, redirect } from "next/navigation";
import { getCurrentActor } from "@/lib/account-admission/session";
import type { PeachSceneState, PeachUiState } from "@/lib/document-types";
import { prisma } from "@/lib/prisma";
import { PublishedSitePlayer } from "@/app/site/[slug]/PublishedSitePlayer";

export const dynamic = "force-dynamic";

export default async function PreviewWebsitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await getCurrentActor(prisma);
  if (!actor) {
    redirect("/login");
  }

  const { id } = await params;
  const website = await prisma.website.findUnique({ where: { id } });

  if (!website) {
    notFound();
  }

  const uiState = JSON.parse(website.uiStateJson) as PeachUiState;
  const sceneState = JSON.parse(website.sceneStateJson) as PeachSceneState;

  return (
    <PublishedSitePlayer
      name={website.name}
      slug={website.slug}
      uiState={uiState}
      sceneState={sceneState}
      isPreview={true}
      websiteId={website.id}
    />
  );
}
