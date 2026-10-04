import { redirect } from "next/navigation";

import { EditorWorkspace } from "@/components/editor/editor-workspace";
import { getCurrentIdentity } from "@/lib/project-access";
import { getUserProjects } from "@/lib/projects";

export default async function EditorPage() {
  const identity = await getCurrentIdentity();
  if (!identity) redirect("/sign-in");

  const { ownedProjects, sharedProjects } = await getUserProjects(identity);

  return <EditorWorkspace ownedProjects={ownedProjects} sharedProjects={sharedProjects} />;
}
