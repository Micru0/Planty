import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import authConfig from "@/lib/auth.config"

const { auth } = NextAuth(authConfig)

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		'/((?!api|_next/static|_next/image|favicon.ico).*)',
	],
};

export default auth((req) => {
	const url = req.nextUrl;
	const host = req.headers.get("host")!;

	// Check if the request is coming from the main domain (e.g., macrokw.com)
	// and not a Vercel preview URL.
	const isMainDomain = !host.startsWith("planty.") && !host.includes("vercel.app");

	// If it's the main domain, show the simple "Welcome to Planty" page.
	if (isMainDomain) {
		url.pathname = "/planty";
		return NextResponse.rewrite(url);
	}

	// If we are on the planty.macrokw.com subdomain (or a preview deployment),
	// run the authentication check for protected app routes.
	const protectedPaths = [
		'/app/cart',
		'/app/profile',
		'/app/seller',
		'/app/care-calendar',
		'/app/chat',
		'/app/notes',
		'/app/success',
	];

	const isProtectedRoute = protectedPaths.some(path => url.pathname.startsWith(path));

	if (isProtectedRoute && !req.auth) {
		return NextResponse.redirect(new URL("/api/auth/signin", req.url));
	}
});