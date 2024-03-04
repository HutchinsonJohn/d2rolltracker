import { useQuery } from 'react-query'
import {
  DestinyItemComponent,
  GetProfileParams,
  getProfile,
} from 'bungie-api-ts/destiny2'
import { validateRollResponse } from '../utils/rolls'
import { getAllUserRollsForWeapon, getRoll } from './rolls'
import {
  AccountLogout,
  AccountState,
  AccountUpdateTokens,
} from '../context/AccountStateContext'
import { DestinyManifestSlices } from '../context/ManifestContext'
import {
  getBungieAccessToken,
  loginFromCode,
  loginFromLocalStorage,
} from '../utils/oauth'
import { bungieHTTPClientWithAccessToken } from '../utils/http'
import loadManifest from '../utils/manifest'
import { getUserLists } from './lists'
import { UserError } from '../utils/error'
import { isCookieConsentRequired } from '../components/Cookies'

export const LOAD_MANIFEST = 'LOAD_MANIFEST'

export function useManifestQuery() {
  return useQuery(LOAD_MANIFEST, async () => {
    const manifest = await loadManifest(isCookieConsentRequired)
    return manifest
  })
}

export const LOGIN = 'LOGIN'

export function useLoginQuery(
  pathname: string,
  authState?: string | null,
  code?: string | null,
) {
  return useQuery(
    LOGIN,
    async () => {
      if (pathname !== '/OAuth') {
        const account = await loginFromLocalStorage()
        return account
      }
      if (authState !== localStorage.getItem('authState')) {
        throw new UserError(
          'Authorization State does not match. Please try logging in again.',
        )
      }
      if (!code?.length) {
        throw new Error(
          "We expected an authorization code parameter from Bungie.net, but didn't get one.  Please try logging in again.",
        )
      }
      const account = await loginFromCode(code)
      return account
    },
    { staleTime: 3600000 },
  )
}

/** The signed in user's god rolls pertaining to the current weapon page  */
export const USER_GOD_ROLLS = 'USER_GOD_ROLLS'

export function useUserGodRollsForWeaponQuery(
  weaponHash: number,
  accountState: AccountState,
  updateTokens: AccountUpdateTokens,
  manifest: DestinyManifestSlices,
) {
  return useQuery(
    [USER_GOD_ROLLS, { weaponHash, accountState }],
    async () => {
      const rolls = await getAllUserRollsForWeapon(
        accountState.accessToken,
        accountState.refreshToken,
        accountState.bungieTokens?.refreshToken.token as string,
        weaponHash,
        updateTokens,
      )

      const validatedRolls = rolls.filter((roll) =>
        validateRollResponse(roll, weaponHash, manifest),
      )
      return validatedRolls
    },
    { enabled: accountState.loggedIn, staleTime: 600000 },
  )
}

/** All of the signed in user's rolls for all weapons */
export const USER_ROLLS = 'USER_ROLLS'

export function useUserRollsQuery(
  accountState: AccountState,
  updateTokens: AccountUpdateTokens,
  logout: AccountLogout,
) {
  return useQuery(
    USER_ROLLS,
    async () => {
      const profileParams: GetProfileParams = {
        membershipType: +accountState.defaultDestinyMembershipType,
        destinyMembershipId: accountState.defaultDestinyMembershipId,
        // 102 gives all items in inventory, 310 reusable plugs
        components: [102, 201, 205, 300, 302, 304, 305, 310],
      }
      let bungieAccessToken
      try {
        bungieAccessToken = await getBungieAccessToken(updateTokens)
      } catch (error) {
        logout()
        throw new Error(
          'Failed to load rolls: The server may be down. Try again later.',
          { cause: error },
        )
      }
      if (bungieAccessToken == null) {
        logout()
        throw new Error('Failed to load rolls: Please sign in again.')
      }
      const profile = (
        await getProfile(
          bungieHTTPClientWithAccessToken(bungieAccessToken.token),
          profileParams,
        )
      ).Response
      const profileInventory = profile.profileInventory.data
      const characterInventories = profile.characterInventories.data
      const characterEquipment = profile.characterEquipment.data
      const reusablePlugs = profile.itemComponents.reusablePlugs.data
      const sockets = profile.itemComponents.sockets.data
      if (
        profileInventory == null ||
        characterInventories == null ||
        characterEquipment == null ||
        reusablePlugs == null ||
        sockets == null
      ) {
        throw new Error(
          "Failed to load rolls: Something went wrong while communicating with Bungie's servers.",
        )
      }
      // TODO: Store location data (ie: warlock, hunter, titan, vault)
      const itemRolls: DestinyItemComponent[] = []
      Object.values(characterInventories).forEach((inventoryComponent) =>
        itemRolls.push(...inventoryComponent.items),
      )
      Object.values(characterEquipment).forEach((inventoryComponent) =>
        itemRolls.push(...inventoryComponent.items),
      )
      itemRolls.push(...profileInventory.items)
      return {
        allRolls: itemRolls,
        characterInventories,
        characterEquipment,
        reusablePlugsInstances: reusablePlugs,
        socketsInstances: sockets,
      }
    },
    { enabled: accountState.loggedIn, staleTime: 600000 },
  )
}

/** The god roll pertaining to the current roll page */
export const GOD_ROLL = 'GOD_ROLL'

export function useGodRollQuery(
  rollId: string | undefined,
  accountState: AccountState,
  updateTokens: AccountUpdateTokens,
  manifest: DestinyManifestSlices,
) {
  return useQuery(
    [GOD_ROLL, { rollId, accountState }],
    async () => {
      if (rollId == null) {
        throw new Error('No rollId provided')
      }
      const roll = await getRoll(
        accountState.accessToken,
        accountState.refreshToken,
        accountState.bungieTokens?.refreshToken.token as string,
        rollId,
        updateTokens,
      )
      if (!validateRollResponse(roll, roll.weaponHash, manifest)) {
        throw new Error('Invalid roll response')
      }

      return roll
    },
    { enabled: rollId != null, staleTime: 600000 },
  )
}

/** All of the signed in user's lists */
export const USER_LISTS = 'USER_LISTS'

export function useUserListsQuery(
  accountState: AccountState,
  updateTokens: AccountUpdateTokens,
) {
  return useQuery(
    [USER_LISTS, { accountState }],
    async () => {
      if (!accountState.loggedIn) {
        throw new Error('Not logged in')
      }
      const lists = await getUserLists(
        accountState.accessToken,
        accountState.refreshToken,
        accountState.bungieTokens?.refreshToken.token as string,
        updateTokens,
      )
      return lists
    },
    { enabled: accountState.loggedIn, staleTime: 600000 },
  )
}
