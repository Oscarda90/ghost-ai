import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const signInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL;
const signUpUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL;

const isPublicRoute = createRouteMatcher(
  [signInUrl, signUpUrl]
    .filter((url): url is string => Boolean(url))
    .map((url) => `${url}(.*)`),
);

// API handlers enforce auth themselves so they can return 401 JSON
// (auth.protect() answers unauthenticated non-page requests with 404).
const isApiRoute = createRouteMatcher(['/api(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req) && !isApiRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
