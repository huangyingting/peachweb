import { notFound } from "next/navigation";
import type { PeachSceneState, PeachUiState } from "@/lib/document-types";
import { prisma } from "@/lib/prisma";
import { PublishedSitePlayer } from "./PublishedSitePlayer";

export const dynamic = "force-dynamic";

export default async function PublishedSitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const website = await prisma.website.findUnique({
    where: { slug },
  });

  if (!website || !website.isPublished) {
    notFound();
  }

  const uiState = JSON.parse(
    website.publishedUiStateJson ?? website.uiStateJson,
  ) as PeachUiState;
  const sceneState = JSON.parse(
    website.publishedSceneStateJson ?? website.sceneStateJson,
  ) as PeachSceneState;

  return (
    <PublishedSitePlayer
      name={website.name}
      slug={website.slug}
      uiState={uiState}
      sceneState={sceneState}
    />
  );
}
