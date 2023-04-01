import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const cookie = request.cookies.get('token')?.value
  if (url.pathname == '/login' && cookie) {
    url.pathname = '/'
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: [ '/((?!api|_next/static|_next/image|favicon.ico).*)' ],
}