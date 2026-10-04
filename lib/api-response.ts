export function jsonError(status: number, error: string) {
  return Response.json({ error }, { status });
}

export const unauthorized = () => jsonError(401, "Unauthorized");
export const forbidden = () => jsonError(403, "Forbidden");
export const notFound = () => jsonError(404, "Not found");
export const conflict = (error: string) => jsonError(409, error);
export const badRequest = (error: string) => jsonError(400, error);
