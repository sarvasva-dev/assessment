import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Yahan hum strictly define kar rahe hain ki sirf /admin wale routes protected hain
const isProtectedRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // Agar koi admin route access karne ki koshish karega, toh use login karna padega
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
  // Baki saare routes (jaise /student, /, /api/test) by default public rahenge!
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)", "/__clerk/:path*"],
};
