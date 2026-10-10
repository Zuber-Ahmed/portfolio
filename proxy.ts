import { NextRequest, NextResponse } from 'next/server';

// Authentication is verified inside every protected route handler.
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/api/admin/auth/login')
    return NextResponse.next();
  if (!request.headers.get('authorization')?.startsWith('Bearer ')) {
    return NextResponse.json(
      { message: 'Please sign in to continue.' },
      { status: 401 },
    );
  }
  return NextResponse.next();
}

export const config = { matcher: '/api/admin/:path*' };
