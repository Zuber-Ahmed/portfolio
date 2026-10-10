import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { ApiError } from './httpClient';

export async function apiResponse(
  operation: () => Promise<unknown>,
  status = 200,
) {
  try {
    const data = await operation();
    return status === 204
      ? new NextResponse(null, { status })
      : NextResponse.json(data, {
          status,
          headers: { 'Cache-Control': 'no-store' },
        });
  } catch (error) {
    if (error instanceof ZodError)
      return NextResponse.json(
        {
          message: 'Please check the submitted data.',
          errors: error.issues.map(
            issue => `${issue.path.join('.')}: ${issue.message}`,
          ),
        },
        { status: 400 },
      );
    if (error instanceof SyntaxError)
      return NextResponse.json(
        { message: 'Invalid JSON body.' },
        { status: 400 },
      );
    if (error instanceof ApiError)
      return NextResponse.json(
        { message: error.message, code: error.code, errors: error.details },
        { status: error.status || 500 },
      );
    console.error(
      'API operation failed:',
      error instanceof Error ? error.name : 'UnknownError',
    );
    return NextResponse.json(
      { message: 'The request could not be completed. Please try again.' },
      { status: 500 },
    );
  }
}
