import axios from 'axios'
import { QueryClient, useMutation } from 'react-query'
import { NavigateFunction } from 'react-router-dom'
import {
  AccountUpdateTokens,
  AccountState,
  AccountLogout,
} from '../context/AccountStateContext'
import { WeaponState } from '../context/WeaponStateContext'
import { serverURI } from './url'
import { GOD_ROLL, USER_GOD_ROLLS } from './queries'
import { RollResponse } from './rolls'
import { ListResponse } from './lists'
import { UserError } from '../utils/error'
import getTokensFromResponse from './updateTokens'
import { saveTokensToLocalStorage } from '../utils/oauth'

async function saveRoll(
  body: { rollName: string; listId: string; weaponHash: number },
  rollId: string | undefined,
  weaponState: WeaponState,
  accountState: AccountState,
  updateTokens: AccountUpdateTokens,
) {
  if (
    !Object.values(weaponState.preferredPerks).some(
      (column) => column.length > 0,
    )
  ) {
    throw new UserError('Please add at least one perk to the roll')
  }
  if (body.rollName.length < 2) {
    throw new UserError('Roll name must be at least 2 characters long')
  }
  const response = await axios(
    `${serverURI}/rolls/${rollId == null ? '' : rollId}`,
    {
      method: rollId == null ? 'POST' : 'PUT',
      data: {
        ...body,
        columns: weaponState.preferredPerks,
      },
      headers: {
        Authorization: `Bearer ${accountState.accessToken}`,
        'x-refresh-token': accountState.refreshToken,
        'x-bungie-refresh-token': accountState.bungieTokens?.refreshToken
          .token as string,
      },
    },
  )

  const tokens = getTokensFromResponse(response)
  if (tokens != null) {
    saveTokensToLocalStorage(tokens)
    updateTokens(tokens)
  }

  const createdRoll: RollResponse = response.data

  return createdRoll
}

function saveRollOnSuccess(
  data: RollResponse,
  queryClient: QueryClient,
  weaponHash: number,
  accountState: AccountState,
  navigate: NavigateFunction,
) {
  const oldData = queryClient.getQueryData<RollResponse[]>([
    USER_GOD_ROLLS,
    { weaponHash, accountState },
  ])
  const { rollId } = data
  queryClient.setQueryData(
    [USER_GOD_ROLLS, { weaponHash, accountState }],
    [
      ...(oldData != null
        ? oldData.filter((roll) => roll.rollId !== rollId)
        : []),
      data,
    ],
  )
  queryClient.setQueryData([GOD_ROLL, { rollId, accountState }], data)
  navigate(`/r/${rollId}`)
}

export function useSaveRollMutation(
  rollId: string | undefined,
  weaponHash: number,
  selectedList: ListResponse | undefined,
  accountState: AccountState,
  updateTokens: AccountUpdateTokens,
  weaponState: WeaponState,
  queryClient: QueryClient,
  navigate: NavigateFunction,
) {
  return useMutation(
    async () => {
      if (selectedList?.listId == null) {
        throw new Error('No list is selected')
      }
      return saveRoll(
        {
          rollName: weaponState.rollName,
          listId: selectedList.listId,
          weaponHash,
        },
        rollId,
        weaponState,
        accountState,
        updateTokens,
      )
    },
    {
      onSuccess: (data) => {
        saveRollOnSuccess(data, queryClient, weaponHash, accountState, navigate)
      },
    },
  )
}

async function deleteRoll(
  rollId: string,
  accountState: AccountState,
  updateTokens: AccountUpdateTokens,
) {
  const response = await axios(`${serverURI}/rolls/${rollId}`, {
    method: 'DELETE',
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

  return response.status === 200
}

function deleteRollOnSuccess(
  rollId: string,
  paramsRollId: string | undefined,
  weaponHash: number,
  accountState: AccountState,
  queryClient: QueryClient,
  navigate: NavigateFunction,
) {
  const oldData = queryClient.getQueryData<RollResponse[]>([
    USER_GOD_ROLLS,
    { weaponHash, accountState },
  ])
  queryClient.setQueryData(
    [USER_GOD_ROLLS, { weaponHash, accountState }],
    oldData?.filter((roll) => roll.rollId !== rollId),
  )
  if (paramsRollId === rollId) {
    navigate(`/w/${weaponHash}`)
  }
}

export function useDeleteRollMutation(
  rollId: string,
  paramsRollId: string | undefined,
  weaponHash: number,
  accountState: AccountState,
  updateTokens: AccountUpdateTokens,

  queryClient: QueryClient,
  navigate: NavigateFunction,
) {
  return useMutation(
    async () => deleteRoll(rollId, accountState, updateTokens),
    {
      onSuccess: () =>
        deleteRollOnSuccess(
          rollId,
          paramsRollId,
          weaponHash,
          accountState,
          queryClient,
          navigate,
        ),
    },
  )
}

async function deleteUser(accountState: AccountState) {
  const response = await axios(`${serverURI}/users`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accountState.accessToken}`,
      'x-refresh-token': accountState.refreshToken,
      'x-bungie-refresh-token': accountState.bungieTokens?.refreshToken
        .token as string,
    },
  })

  return response.status === 200
}

async function deleteUserOnSuccess(
  accountState: AccountState,
  accountLogout: AccountLogout,
  navigate: NavigateFunction,
) {
  accountLogout()
  navigate('/')
}

export function useDeleteUserMutation(
  accountState: AccountState,
  accountLogout: AccountLogout,
  navigate: NavigateFunction,
) {
  return useMutation(async () => deleteUser(accountState), {
    onSuccess: () => deleteUserOnSuccess(accountState, accountLogout, navigate),
  })
}
