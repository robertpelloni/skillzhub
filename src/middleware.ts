import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req

  // Fast Edge API Key format validation
  // Blocks blatantly malformed keys before they hit the Node.js DB pool
  if (nextUrl.pathname.startsWith('/api/v1/datasets/')) {
     const authHeader = req.headers.get('authorization')
     if (authHeader) {
         if (!authHeader.startsWith('Bearer sk_') || authHeader.length < 30) {
             return NextResponse.json({ error: "Unauthorized: Malformed API Key" }, { status: 401 })
         }
     }
  }

  if (nextUrl.pathname.startsWith('/api/v1/admin') && req.auth?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (nextUrl.pathname.startsWith('/api/v1/company') && req.auth?.user?.role !== 'COMPANY' && req.auth?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (nextUrl.pathname.startsWith('/api/v1/creator') && req.auth?.user?.role !== 'CREATOR' && req.auth?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
}
