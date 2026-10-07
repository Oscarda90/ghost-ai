import { badRequest, forbidden, unauthorized } from '@/lib/api-response';
import { getLiveblocks, getUserColor } from '@/lib/liveblocks';
import {
  getAccessibleProject,
  getCurrentIdentity,
  getCurrentUser,
} from '@/lib/project-access';
import { readJsonObject } from '@/lib/project-input';

/** Issues a Liveblocks access token for one room (room ID === project ID). */
export async function POST(request: Request) {
  const identity = await getCurrentIdentity();
  const user = await getCurrentUser();
  if (!identity || !user) return unauthorized();

  // The Liveblocks client sends `{ room }` when entering a room.
  const body = await readJsonObject(request);
  if (!body.ok) return badRequest(body.error);

  const { room } = body.value;
  if (typeof room !== 'string' || !room) return badRequest('`room` is required');

  const project = await getAccessibleProject(room, identity);
  if (!project) return forbidden();

  const liveblocks = getLiveblocks();

  // Private by default; access comes only from the token issued below.
  await liveblocks.getOrCreateRoom(room, { defaultAccesses: [] });

  const session = liveblocks.prepareSession(identity.userId, {
    userInfo: {
      name:
        user.fullName?.trim() ||
        user.username ||
        identity.primaryEmail ||
        'Anonymous',
      avatar: user.imageUrl,
      color: getUserColor(identity.userId),
    },
  });
  session.allow(room, session.FULL_ACCESS);

  const { status, body: token } = await session.authorize();
  return new Response(token, { status });
}
