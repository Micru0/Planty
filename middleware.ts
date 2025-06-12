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
	const host = req.headers.get("host");

	const isPlantySubdomain = host?.startsWith("planty.");

	if (isPlantySubdomain) {
		const plantyPath = `/planty${url.pathname}`;
		url.pathname = plantyPath;
		return NextResponse.rewrite(url);
	}

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