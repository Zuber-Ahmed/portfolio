import axios, { type AxiosRequestConfig } from 'axios';

export class ApiError extends Error {
  readonly status?: number;
  readonly details?: unknown;
  readonly code?: string;

  constructor(
    message: string,
    options: { status?: number; details?: unknown; code?: string } = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status;
    this.details = options.details;
    this.code = options.code;
  }
}

export const httpClient = axios.create({
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

export async function requestJson<T>(
  url: string,
  parse: (data: unknown) => T,
  options: AxiosRequestConfig = {},
  fallback = 'Request failed.',
): Promise<T> {
  try {
    const response = await httpClient.request({ ...options, url });
    try {
      return parse(response.data);
    } catch (error) {
      throw new ApiError('The server returned an invalid response.', {
        code: 'INVALID_RESPONSE',
        details: error,
      });
    }
  } catch (error) {
    if (axios.isCancel(error) || options.signal?.aborted)
      throw new DOMException('Request cancelled.', 'AbortError');
    if (error instanceof ApiError) throw error;
    if (axios.isAxiosError(error)) {
      const data = error.response?.data;
      throw new ApiError(
        typeof data?.message === 'string' ? data.message : fallback,
        {
          status: error.response?.status,
          details: data?.errors,
          code: data?.code,
        },
      );
    }
    throw error;
  }
}
