import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { EditorWorkspace } from "@/components/editor/editor-workspace";
import { getAccessibleProject, getUserProjects } from "@/lib/projects";

export default async function ProjectWorkspacePage(props: PageProps<"/editor/[projectId]">) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { projectId } = await props.params;
  const [activeProject, { ownedProjects, sharedProjects }] = await Promise.all([
    getAccessibleProject(projectId, userId),
    getUserProjects(userId),
  ]);
  if (!activeProject) notFound();

  return (
    <EditorWorkspace
      ownedProjects={ownedProjects}
      sharedProjects={sharedProjects}
      activeProject={activeProject}
    />
  );
}
