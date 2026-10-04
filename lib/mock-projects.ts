import type { Project } from "@/types/project";

/** Placeholder project data until project persistence is implemented. */
export const MOCK_PROJECTS: Project[] = [
  { id: "mock-1", name: "Payments Platform", slug: "payments-platform", role: "owner" },
  { id: "mock-2", name: "Realtime Chat Service", slug: "realtime-chat-service", role: "owner" },
  { id: "mock-3", name: "Analytics Pipeline", slug: "analytics-pipeline", role: "collaborator" },
];
