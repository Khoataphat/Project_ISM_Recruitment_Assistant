import type { AxiosResponse } from 'axios'
import type { ApiSuccessEnvelope } from '@/types'

export function unwrapData<T>(response: AxiosResponse<ApiSuccessEnvelope<T>>): T {
  const payload = response.data.data

  if (payload === undefined) {
    throw new Error('API response is missing expected data payload')
  }

  return payload
}

export function unwrapMessage(
  response: AxiosResponse<ApiSuccessEnvelope<unknown>>,
  fallback = 'Success'
) {
  return response.data.message ?? fallback
}
