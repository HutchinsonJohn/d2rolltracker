import axios from 'axios'
import type { BungieMembershipType } from 'bungie-api-ts/common'
import { JWTPayload } from 'jose'
import { serverURI } from '../api/url'
import type { AccountUpdateTokens } from '../context/AccountStateContext'
import verifyJwt from './jwt'
import { UserError } from './error'

export type BungieTokenType = 'access' | 'refresh'

export interface BungieToken {
  token: string
  type: BungieTokenType
  createdAt: number
  expiresIn: number
}

export interface BungieTokens {
  accessToken: BungieToken
  refreshToken: BungieToken
  bungieMembershipId: string
}

export interface Tokens {
  accessToken: string
  refreshToken: string
  bungieTokens: BungieTokens
}

export function getBungieTokensFromStorage(): BungieTokens | null {
  const tokens = localStorage.getItem('bungieTokens')
  return tokens ? JSON.parse(tokens) : null
}

export function saveTokensToLocalStorage(tokens: Tokens) {
  // Essential cookies
  localStorage.setItem('accessToken', tokens.accessToken)
  localStorage.setItem('refreshToken', tokens.refreshToken)
  localStorage.setItem('bungieTokens', JSON.stringify(tokens.bungieTokens))
}

export function verifyBungieToken(bungieToken: BungieToken | undefined) {
  if (bungieToken == null) {
    return undefined
  }
  if (Date.now() > bungieToken.createdAt + bungieToken.expiresIn * 1000) {
    return undefined
  }
  return bungieToken
}

export function getBungieRefreshTokenFromStorage() {
  const tokens = getBungieTokensFromStorage()
  if (tokens == null) {
    return undefined
  }
  return verifyBungieToken(tokens.refreshToken)
}

async function verifyAccessAndRefreshTokens(tokens: {
  accessToken: string
  refreshToken: string
  bungieTokens: BungieTokens
}) {
  const { decoded, expired, valid } = await verifyJwt(
    tokens.accessToken,
    'ACCESS_TOKEN_PUBLIC_KEY',
  )

  const { expired: refreshExpired, valid: refreshValid } = await verifyJwt(
    tokens.refreshToken,
    'REFRESH_TOKEN_PUBLIC_KEY',
  )

  if (expired || !valid || refreshExpired || !refreshValid) {
    throw new Error('Invalid tokens')
  }

  if (typeof decoded === 'object') {
    if (decoded != null) {
      return decoded
    }
  }
  throw new Error('Invalid access token')
}

function isPayloadValid(payload: unknown): payload is {
  displayName: string
  displayNameCode: number | undefined
  profilePicturePath: string
  bungieMembershipId: string
  defaultDestinyMembershipId: string
  defaultDestinyMembershipType: number
  destinyMembershipsDetails: {
    membershipType: BungieMembershipType
    membershipId: string
    displayName: string
    displayNameCode: number | undefined
    iconPath: string
  }[]
  privateList: string
  publicLists: string[]
  subscribedLists: string[]
} {
  return (
    payload != null &&
    typeof payload === 'object' &&
    'displayName' in payload &&
    typeof payload.displayName === 'string' &&
    'profilePicturePath' in payload &&
    typeof payload.profilePicturePath === 'string' &&
    'bungieMembershipId' in payload &&
    typeof payload.bungieMembershipId === 'string' &&
    'defaultDestinyMembershipId' in payload &&
    typeof payload.defaultDestinyMembershipId === 'string' &&
    'defaultDestinyMembershipType' in payload &&
    typeof payload.defaultDestinyMembershipType === 'number' &&
    'destinyMembershipsDetails' in payload &&
    Array.isArray(payload.destinyMembershipsDetails) &&
    'privateList' in payload &&
    typeof payload.privateList === 'string' &&
    'publicLists' in payload &&
    Array.isArray(payload.publicLists) &&
    'subscribedLists' in payload &&
    Array.isArray(payload.subscribedLists)
  )
}

function buildAccountState(
  decoded: JWTPayload,
  tokens: {
    accessToken: string
    refreshToken: string
    bungieTokens: BungieTokens
  },
) {
  if (!isPayloadValid(decoded)) {
    throw new Error('User data is incomplete')
  }

  const defaultDestinyMembershipId = localStorage.getItem(
    'defaultDestinyMembershipId',
  )
  const defaultDestinyMembershipType = localStorage.getItem(
    'defaultDestinyMembershipType',
  )

  if (
    defaultDestinyMembershipId != null &&
    defaultDestinyMembershipType != null
  ) {
    return {
      loggedIn: true,
      ...decoded,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      bungieTokens: tokens.bungieTokens,
      defaultDestinyMembershipId,
      defaultDestinyMembershipType: +defaultDestinyMembershipType,
    }
  }

  return {
    loggedIn: true,
    ...decoded,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    bungieTokens: tokens.bungieTokens,
  }
}

/**
 * Saves fresh tokens to localStorage and returns them
 * @param refreshToken
 * @param bungieRefreshToken
 * @returns Access Token, Refresh Token, and Bungie Tokens
 */
async function getFreshTokensFromRefreshTokens(
  refreshToken: string,
  bungieRefreshToken: string,
  updateTokens: AccountUpdateTokens,
): Promise<{
  accessToken: string
  refreshToken: string
  bungieTokens: BungieTokens
}> {
  const tokens: Tokens = await axios(`${serverURI}/tokens`, {
    method: 'POST',
    headers: {
      'x-refresh-token': refreshToken,
      'x-bungie-refresh-token': bungieRefreshToken,
    },
  })
    .then((response) => response.data)
    .then((data) => ({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      bungieTokens: data.bungieTokens,
    }))

  if (tokens != null) {
    saveTokensToLocalStorage(tokens)
    updateTokens(tokens)
  }

  return tokens
}

/**
 * Calls getFreshTokensFromRefreshTokens to save fresh tokens to localStorage
 * and returns them
 * @param bungieRefreshToken
 * @param updateTokens
 * @returns Bungie Access Token
 */
async function getBungieAccessTokenFromRefreshToken(
  bungieRefreshToken: BungieToken,
  updateTokens: AccountUpdateTokens,
) {
  const refreshToken = localStorage.getItem('refreshToken')
  if (refreshToken == null) {
    return undefined
  }
  const tokens = await getFreshTokensFromRefreshTokens(
    refreshToken,
    bungieRefreshToken.token,
    updateTokens,
  )

  return tokens.bungieTokens.accessToken
}

/**
 * Returns the bungie access token.  If access token is expired, will attempt
 * to refresh both access tokens and update localStorage accordingly
 * @returns Bungie Access Token or undefined
 */
export async function getBungieAccessToken(updateTokens: AccountUpdateTokens) {
  const bungieTokens = getBungieTokensFromStorage()
  if (bungieTokens == null) {
    return undefined
  }
  const bungieAccessToken = bungieTokens.accessToken
  if (
    Date.now() <
    bungieAccessToken.createdAt + bungieAccessToken.expiresIn * 1000
  ) {
    return bungieAccessToken
  }
  const bungieRefreshToken = getBungieRefreshTokenFromStorage()
  if (bungieRefreshToken == null) {
    return undefined
  }
  const newBungieAccessToken = await getBungieAccessTokenFromRefreshToken(
    bungieRefreshToken,
    updateTokens,
  )
  return newBungieAccessToken
}

async function verifyRefreshToken(refreshToken: string) {
  const { decoded, expired, valid } = await verifyJwt(
    refreshToken,
    'REFRESH_TOKEN_PUBLIC_KEY',
  )

  if (expired || !valid) {
    throw new Error('Invalid refresh token')
  }

  if (typeof decoded === 'object') {
    if (decoded != null) {
      return decoded
    }
  }
  throw new Error('Invalid refresh token')
}

export async function loginFromLocalStorage() {
  const accessToken = localStorage.getItem('accessToken')
  const refreshToken = localStorage.getItem('refreshToken')
  const bungieTokens = getBungieTokensFromStorage()
  if (accessToken == null || refreshToken == null || bungieTokens == null) {
    throw new UserError('Missing one or more tokens from localStorage')
  }

  return buildAccountState(await verifyRefreshToken(refreshToken), {
    accessToken,
    refreshToken,
    bungieTokens,
  })
}

export async function loginFromCode(code: string) {
  const tokens: Tokens = await axios(`${serverURI}/sessions`, {
    method: 'POST',
    data: { code },
  })
    .then((response) => response.data)
    .then((data) => ({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      bungieTokens: data.bungieTokens,
    }))

  saveTokensToLocalStorage(tokens)
  return buildAccountState(await verifyAccessAndRefreshTokens(tokens), tokens)
}
