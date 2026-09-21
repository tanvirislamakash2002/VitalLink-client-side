import { NextRequest, NextResponse } from "next/server";
import { jwtUtils } from "./lib/jwtUtils";
import { getDefaultDashboardRoute, getRouteOwner, isAuthRoute, UserRole } from "./lib/authUtils";

export async function proxy(request: NextRequest) {
    try {
        const { pathname } = request.nextUrl;
        const accessToken = request.cookies.get("accessToken")?.value;
        const refreshToken = request.cookies.get("refreshToken")?.value;

        const decodedAccessToken = accessToken && jwtUtils.verifyToken(accessToken, process.env.JWT_ACCESS_SECRET as string).data;

        const isValidAccessToken = accessToken && jwtUtils.verifyToken(accessToken, process.env.JWT_ACCESS_SECRET as string).success

        let userRole: UserRole | null = null

        if (decodedAccessToken) {
            userRole = decodedAccessToken.role as UserRole;
        }

        const routerOwner = getRouteOwner(pathname)
        const unifySuperAdminAndAdminRole = userRole === "SUPER_ADMIN" ? "ADMIN" : userRole;
        userRole = unifySuperAdminAndAdminRole

        const isAuth = isAuthRoute(pathname);

        // Rule - 1 : User is logged in (has access token) and trying to access auth route -> allow
        if (isAuth && isValidAccessToken) {
            return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.url))
        }

        // Rule  - 2 : User  trying tto access Public route -> allow
        if (routerOwner === null) {
            return NextResponse.next()
        }

        // Rule - 3 : User is Not logged in but trying to access protected route -> redirect to login
        if (!accessToken || !isValidAccessToken) {
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl)
        }

        // Rule - 4 : User trying to access common protected route -> allow
        if (routerOwner === "COMMON") {
            return NextResponse.next()
        }

        // Rule - 5 : User trying to visit role based protected but doesn't have required role -> redirect to their default dashboard
        if (routerOwner === "ADMIN" || routerOwner === "DOCTOR" || routerOwner === "PATIENT") {
            if (routerOwner !== userRole) {
                return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.url))
            }
        }

        return NextResponse.next()
    } catch (error) {
        console.log("Error in proxy middleware:", error)
    }
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.well-known).*)',
    ]
}