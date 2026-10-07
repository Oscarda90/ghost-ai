import { redirect } from "next/navigation";

import { AccessDenied } from "@/components/editor/access-denied";
import { EditorWorkspace } from "@/components/editor/editor-workspace";
import { getAccessibleProject, getCurrentIdentity } from "@/lib/project-access";
import { getUserProjects } from "@/lib/projects";

export default async function ProjectWorkspacePage(props: PageProps<"/editor/[roomId]">) {
  const identity = await getCurrentIdentity();
  if (!identity) redirect("/sign-in");

  const { roomId } = await props.params;
  const [activeProject, { ownedProjects, sharedProjects }] = await Promise.all([
    getAccessibleProject(roomId, identity),
    getUserProjects(identity),
  ]);

  // Missing and unauthorized projects look the same, so room IDs can't be probed.
  if (!activeProject) return <AccessDenied />;

  return (
    <EditorWorkspace
      ownedProjects={ownedProjects}
      sharedProjects={sharedProjects}
      activeProject={activeProject}
    />
  );
}
