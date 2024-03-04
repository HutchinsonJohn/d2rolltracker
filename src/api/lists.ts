import axios from 'axios'
import {
  AccountState,
  AccountUpdateTokens,
} from '../context/AccountStateContext'
import getTokensFromResponse from './updateTokens'
import { serverURI } from './url'
import { RollResponse } from './rolls'
import { UserError } from '../utils/error'
import { saveTokensToLocalStorage } from '../utils/oauth'

export interface ListResponse {
  createdBy: {
    bungieMembershipId: string
    displayName: string
    displayNameCode: number | undefined
  }
  isPrivate: boolean
  listName: string
  listId: string
  subscribedUsers: string[]
  rolls: RollResponse[] | undefined
}

export async function getUserLists(
  accessToken: string,
  refreshToken: string,
  bungieRefreshToken: string,
  updateTokens: AccountUpdateTokens,
) {
  const response = await axios(`${serverURI}/user/lists`, {
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

  const lists: ListResponse[] = response.data

  return lists
}

export async function getPopularLists(skip: number) {
  const response = await axios(`${serverURI}/lists?sort=popular&skip=${skip}`, {
    method: 'GET',
  })

  const lists: ListResponse[] = response.data

  return lists
}

export async function saveList(
  body: { listName: string },
  accountState: AccountState,
  updateTokens: AccountUpdateTokens,
) {
  if (body.listName.length < 3) {
    throw new UserError('List name must be at least 3 characters')
  }
  const response = await axios(`${serverURI}/lists/`, {
    method: 'POST',
    data: {
      ...body,
      isPrivate: false,
    },
    headers: {
      Authorization: `Bearer ${accountState.accessToken}`,
      'x-refresh-token': accountState.refreshToken,
      'x-bungie-refresh-token': accountState.bungieTokens?.refreshToken
        .token as string,
    },
  })

  const tokens = getTokensFromResponse(response)
  if (tokens != null) {
    saveTokensToLocalStorage(tokens)
    updateTokens(tokens)
  }

  const createdList: ListResponse = response.data

  return createdList
}

export async function getList(
  listId: string,
  accountState: AccountState,
  updateTokens: AccountUpdateTokens,
) {
  const response = await axios(`${serverURI}/lists/${listId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accountState.accessToken}`,
      'x-refresh-token': accountState.refreshToken,
      'x-bungie-refresh-token': accountState.bungieTokens?.refreshToken
        .token as string,
    },
  })

  const tokens = getTokensFromResponse(response)
  if (tokens != null) {
    saveTokensToLocalStorage(tokens)
    updateTokens(tokens)
  }

  const list: ListResponse = response.data

  return list
}
