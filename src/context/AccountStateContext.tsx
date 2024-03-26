import { BungieMembershipType } from 'bungie-api-ts/common'
import { createContext, useContext, useMemo } from 'react'
import type { BungieTokens, Tokens } from '../utils/oauth'

export interface AccountState {
  loggedIn: boolean
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
  accessToken: string
  refreshToken: string
  bungieTokens: BungieTokens | undefined
}

export const initialAccountState: AccountState = {
  loggedIn: false,
  displayName: '',
  displayNameCode: undefined,
  profilePicturePath: '',
  bungieMembershipId: '',
  defaultDestinyMembershipId: '',
  defaultDestinyMembershipType: -1,
  destinyMembershipsDetails: [],
  privateList: '',
  publicLists: [],
  subscribedLists: [],
  accessToken: '',
  refreshToken: '',
  bungieTokens: undefined,
}

export type AccountUpdateTokens = ReturnType<typeof useAccountUpdateTokens>
export type AccountLogout = ReturnType<typeof useAccountLogout>
export type AccountUpdateDefaultMembership = ReturnType<
  typeof useAccountUpdateDefaultMembership
>

const AccountStateContext = createContext<AccountState | undefined>(undefined)
const AccountUpdateTokensContext = createContext<
  ((tokens: Tokens) => void) | undefined
>(undefined)
const AccountLogoutContext = createContext<(() => void) | undefined>(undefined)
const AccountUpdateDefaultMembershipContext = createContext<
  ((membershipId: string, membershipType: number) => void) | undefined
>(undefined)

export function useAccountState() {
  const data = useContext(AccountStateContext)
  if (data == null) {
    return initialAccountState
  }
  return data
}

export function useAccountUpdateTokens() {
  const data = useContext(AccountUpdateTokensContext)
  if (data == null) {
    throw new Error(
      'A component that relies on account state is used while the account state has not been initialized',
    )
  }
  return data
}

export function useAccountLogout() {
  const data = useContext(AccountLogoutContext)
  if (data == null) {
    throw new Error(
      'A component that relies on account state is used while the account state has not been initialized',
    )
  }
  return data
}

export function useAccountUpdateDefaultMembership() {
  const data = useContext(AccountUpdateDefaultMembershipContext)
  if (data == null) {
    throw new Error(
      'A component that relies on account state is used while the account state has not been initialized',
    )
  }
  return data
}

export default function AccountStateProvider(props: {
  children: React.ReactNode
  accountState: AccountState | undefined
  updateTokens: AccountUpdateTokens
  logout: AccountLogout
  updateDefaultMembership: AccountUpdateDefaultMembership
}) {
  const accountState = useMemo(() => props.accountState, [props.accountState])
  const updateTokens = useMemo(() => props.updateTokens, [props.updateTokens])
  const logout = useMemo(() => props.logout, [props.logout])
  const updateDefaultDestinyMembership = useMemo(
    () => props.updateDefaultMembership,
    [props.updateDefaultMembership],
  )

  return (
    <AccountStateContext.Provider value={accountState}>
      <AccountUpdateTokensContext.Provider value={updateTokens}>
        <AccountLogoutContext.Provider value={logout}>
          <AccountUpdateDefaultMembershipContext.Provider
            value={updateDefaultDestinyMembership}
          >
            {props.children}
          </AccountUpdateDefaultMembershipContext.Provider>
        </AccountLogoutContext.Provider>
      </AccountUpdateTokensContext.Provider>
    </AccountStateContext.Provider>
  )
}
