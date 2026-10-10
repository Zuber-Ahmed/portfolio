import { type AxiosRequestConfig } from 'axios';

import { getAccessToken, logout } from '@/app/services/wedding/authService';

import { ApiError, requestJson } from './httpClient';

export async function adminRequest<T>(
  url: string,
  parse: (data: unknown) => T,
  options: AxiosRequestConfig = {},
): Promise<T> {
  const token = await getAccessToken();
  if (!token)
    throw new ApiError('Please sign in to continue.', { status: 401 });
  const headers = { ...options.headers, Authorization: `Bearer ${token}` };
  try {
    return await requestJson(
      url,
      parse,
      { ...options, headers },
      'Admin request failed.',
    );
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 401 || error.status === 403)
    )
      logout();
    throw error;
  }
}
