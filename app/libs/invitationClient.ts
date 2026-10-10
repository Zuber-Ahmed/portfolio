import { type AxiosRequestConfig } from 'axios';

import { requestJson } from './httpClient';

export function invitationRequest<T>(
  url: string,
  parse: (data: unknown) => T,
  options: AxiosRequestConfig = {},
) {
  return requestJson(url, parse, options, 'Invitation request failed.');
}
