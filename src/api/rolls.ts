import axios from 'axios'
import { AccountUpdateTokens } from '../context/AccountStateContext'
import { PreferredPerks } from '../context/WeaponStateContext'
import getTokensFromResponse from './updateTokens'
import { serverURI } from './url'
import { saveTokensToLocalStorage } from '../utils/oauth'

export interface RollResponse {
  columns: PreferredPerks
  createdBy: {
    bungieMembershipId: string
    displayName: string
    displayNameCode: number | undefined
  }
  rollName: string
  rollId: string
  weaponHash: number
  createdAt: Date
}

export async function getAllUserRollsForWeapon(
  accessToken: string,
  refreshToken: string,
  bungieRefreshToken: string,
  weaponHash: number,
  updateTokens: AccountUpdateTokens,
) {
  const response = await axios(
    `${serverURI}/user/weapons/${weaponHash}/rolls`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-refresh-token': refreshToken,
        'x-bungie-refresh-token': bungieRefreshToken,
      },
    },
  )

  const tokens = getTokensFromResponse(response)
  if (tokens != null) {
    saveTokensToLocalStorage(tokens)
    updateTokens(tokens)
  }

  const rolls: RollResponse[] = response.data

  return rolls
}

export async function getRoll(
  accessToken: string,
  refreshToken: string,
  bungieRefreshToken: string,
  rollId: string,
  updateTokens: AccountUpdateTokens,
) {
  const response = await axios(`${serverURI}/rolls/${rollId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'x-refresh-token': refreshToken,
      'x-bungie-refresh-token': bungieRefreshToken,
    },
  })

  const tokens = getTokensFromResponse(response)
  if (tokens != null) {
    saveTokensToLocalStorage(tokens)
    updateTokens(tokens)
  }

  const roll: RollResponse = response.data

  return roll
}
