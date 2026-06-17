import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/lib/auth"

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/onboarding",
  "/privacy",
  "/terms",
]

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )
}

function isPublicStaticAsset(pathname: string) {
  return /\.(?:png|jpe?g|gif|webp|svg|ico|woff2?|ttf|otf|eot)$/i.test(
    pathname,
  )
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    isPublicPath(pathname) ||
    isPublicStaticAsset(pathname) ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next()
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  }).catch(() => null)

  if (!session) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (!session.user.emailVerified) {
    const verifyUrl = new URL("/verify-email", request.url)
    verifyUrl.searchParams.set("email", session.user.email)
    return NextResponse.redirect(verifyUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
