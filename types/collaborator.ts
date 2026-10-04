export interface Collaborator {
  id: string;
  email: string;
  /** Clerk display name; null when no Clerk user matches the email. */
  name: string | null;
  /** Clerk avatar URL; null when no Clerk user matches the email. */
  avatarUrl: string | null;
}
