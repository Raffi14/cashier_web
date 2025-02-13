import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, JWTPayload } from "jose";
import { defaultConfig } from "../envConfig";

export async function middleware(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }
    
    try {
        if (req.nextUrl.pathname === '/api/login') {
            return NextResponse.next();
        }

        const secretKey = defaultConfig.secretKey;
        if (!secretKey) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        const secret = new TextEncoder().encode(secretKey);
        const { payload } = await jwtVerify(token, secret) as { payload: JWTPayload };

        if (!payload || !payload.id) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        return NextResponse.next();
    } catch (error) {
        return NextResponse.redirect(new URL("/login", req.url));
    }
}

export const config = {
    matcher: [
      "/views/:path*",
      "/api/product",
    ]
  };
  