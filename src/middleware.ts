import { getToken } from "next-auth/jwt"
import { withAuth } from "next-auth/middleware"
import { NextRequest, NextResponse } from "next/server"
export default withAuth(
    async function middleware(req: NextRequest) {
        const pathname=req.nextUrl.pathname
        if (pathname == '/') {
            return NextResponse.redirect(new URL('/location', req.nextUrl.origin))
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => {
                if (token) {
                    return true
                }
                console.log('not logged in')
                return false
            },
        },
        pages: {
            signIn: '/'
        },
    }
)

export const config = {
    matcher: [
        "/",
        "/location",
        "/events"
    ]
}