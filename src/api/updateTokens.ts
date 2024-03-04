import { AxiosResponse } from 'axios'

export default function getTokensFromResponse(response: AxiosResponse) {
  const newAccessToken = response.headers['x-access-token']
  const newRefreshToken = response.headers['x-refresh-token']
  const newBungieTokens = response.headers['x-bungie-tokens']
  if (newAccessToken && newRefreshToken && newBungieTokens) {
    const tokens = {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      bungieTokens: JSON.parse(newBungieTokens),
    }
    return tokens
  }
  return undefined
}
