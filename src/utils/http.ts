import axios from 'axios'
import type { HttpClientConfig } from 'bungie-api-ts/http'

export function bungieHTTPClientWithAccessToken(accessToken: string) {
  return async (config: HttpClientConfig) => {
    const response = await axios(config.url, {
      params: new URLSearchParams(config.params),
      method: config.method,
      headers: {
        'X-API-Key': `${import.meta.env.VITE_X_API_KEY}`,
        Authorization: `Bearer ${accessToken}`,
      },
    }).catch((error) => {
      if (error?.response?.data) {
        return error.response
      }
      throw error
    })
    return response.data
  }
}

export async function bungieHTTPClientWithApiKey(config: HttpClientConfig) {
  const response = await axios(config.url, {
    params: new URLSearchParams(config.params),
    method: config.method,
    headers: {
      'X-API-Key': `${import.meta.env.VITE_X_API_KEY}`,
    },
  }).catch((error) => {
    if (error?.response?.data) {
      return error.response
    }
    throw error
  })
  return response.data
}

export async function bungieHTTPClient(config: HttpClientConfig) {
  const response = await axios(config.url, {
    params: new URLSearchParams(config.params),
    method: config.method,
  }).catch((error) => {
    if (error?.response?.data) {
      return error.response
    }
    throw error
  })
  return response.data
}
