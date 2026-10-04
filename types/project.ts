export type ProjectRole = "owner" | "collaborator";

export interface Project {
  /** Project ID; also the Liveblocks room ID (`slugified-name-suffix`). */
  id: string;
  name: string;
  /** The current user's relationship to the project. */
  role: ProjectRole;
}
