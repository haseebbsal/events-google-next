import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
export function GET(req: NextRequest) {
    cookies().delete('next-auth.session-token')
    return NextResponse.json('done')
}