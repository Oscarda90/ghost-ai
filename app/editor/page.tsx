import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { EditorWorkspace } from "@/components/editor/editor-workspace";
import { getUserProjects } from "@/lib/projects";

export default async function EditorPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { ownedProjects, sharedProjects } = await getUserProjects(userId);

  return <EditorWorkspace ownedProjects={ownedProjects} sharedProjects={sharedProjects} />;
}
