export type ProjectRole = "owner" | "collaborator";

export interface Project {
  id: string;
  name: string;
  slug: string;
  /** The current user's relationship to the project. */
  role: ProjectRole;
}
