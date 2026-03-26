import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          const cookieOptions = { name, value, ...options } as {
            name: string
            value: string
            path?: string
            domain?: string
            maxAge?: number
            httpOnly?: boolean
            secure?: boolean
            sameSite?: 'lax' | 'strict' | 'none'
          }
          request.cookies.set(cookieOptions)
          response.cookies.set(cookieOptions)
        },
        remove(name: string, options: Record<string, unknown>) {
          const cookieOptions = { name, value: '', ...options } as {
            name: string
            value: string
            path?: string
            domain?: string
            maxAge?: number
            httpOnly?: boolean
            secure?: boolean
            sameSite?: 'lax' | 'strict' | 'none'
          }
          request.cookies.set(cookieOptions)
          response.cookies.set(cookieOptions)
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const protectedPaths = [
    '/journal',
    '/spreads',
    '/herbology/blends',
    '/astrology/charts',
    '/crystals/collection',
    '/numerology/charts',
    '/moon/journal',
    '/dreams',
    '/profile',
  ]
  const isProtected = protectedPaths.some((p) =>
    request.nextUrl.pathname.startsWith(p)
  )

  if (isProtected && !user) {
    const redirectUrl = new URL('/auth', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/journal/:path*',
    '/spreads/:path*',
    '/admin/:path*',
    '/herbology/blends/:path*',
    '/astrology/charts/:path*',
    '/crystals/collection/:path*',
    '/numerology/charts/:path*',
    '/moon/journal/:path*',
    '/dreams/:path*',
    '/profile',
  ],
}
