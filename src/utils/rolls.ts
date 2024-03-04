import type {
  DestinyInventoryItemDefinition,
  DestinyItemComponent,
  DestinyItemReusablePlugsComponent,
  DestinyItemSocketsComponent,
} from 'bungie-api-ts/destiny2'
import { isEqual } from 'lodash'
import { captureMessage, withScope } from '@sentry/react'
import type { RollResponse } from '../api/rolls'
import type { PreferredPerks } from '../context/WeaponStateContext'
import { getStatTypeHashFromDef } from './weapon'
import { DestinyManifestSlices } from '../context/ManifestContext'
import {
  STAT_TYPE_MASTERWORK_TIER_TEN_HASHES,
  WEAPON_TYPE_MASTERWORK_PLUGS,
  DEFAULT_MASTERWORK_PLUGS,
} from '../data/masterworks'
import getIntrinsicHashes from './intrinsics'
import { MASTERWORK_TYPE_HASH } from '../data/sockets'

export interface AllRollsData {
  allRolls: DestinyItemComponent[]
  reusablePlugsInstances: Record<string, DestinyItemReusablePlugsComponent>
  socketsInstances: Record<string, DestinyItemSocketsComponent>
}

/**
 * Returns the perk index and perk hash(es) of the perks with the lowest
 * perk index
 * */
export function getBestColumnIndex(
  destinyInventoryItemDefinitions: Record<
    number,
    DestinyInventoryItemDefinition
  >,
  reusablePlugsInstance: DestinyItemReusablePlugsComponent,
  socketsInstance: DestinyItemSocketsComponent,
  preferredPerks: PreferredPerks,
  column: number,
  isCrafted: boolean,
  weaponHash: number,
) {
  // Defaults to Infinity if matching perk does not exist
  let bestColumnIndex = Infinity

  let bestColumnPerkHashes: number[] = []

  const preferredColumn = preferredPerks[column]

  const isIntrinsic =
    column === 0 &&
    destinyInventoryItemDefinitions[weaponHash].inventory?.recipeItemHash !=
      null

  const isMasterwork =
    !isIntrinsic &&
    destinyInventoryItemDefinitions[weaponHash].sockets?.socketEntries[column]
      .socketTypeHash === MASTERWORK_TYPE_HASH

  // Handles masterwork and intrinsic columns
  if (isMasterwork || isIntrinsic) {
    const plugHash = isCrafted
      ? socketsInstance.sockets[0].plugHash
      : socketsInstance.sockets[column].plugHash
    if (plugHash == null) {
      // Weapon does not have a masterwork, valid response
      return {
        bestColumnIndex,
        bestColumnPerkHashes,
      }
    }
    const statTypeHash = getStatTypeHashFromDef(
      destinyInventoryItemDefinitions[plugHash],
    )

    const matchedPerk = preferredColumn?.find(
      (preferredPerk) =>
        getStatTypeHashFromDef(
          destinyInventoryItemDefinitions[preferredPerk.hash],
        ) === statTypeHash,
    )

    // Will break if there are ever weapons with multiple masterworks
    if (matchedPerk != null) {
      bestColumnIndex = matchedPerk.index
      bestColumnPerkHashes = [matchedPerk.hash]
    }
    return { bestColumnIndex, bestColumnPerkHashes }
  }

  // Handles non masterwork columns without random perks
  if (reusablePlugsInstance.plugs[column] == null) {
    const socketPerkPlugHash = socketsInstance.sockets[column].plugHash
    if (socketPerkPlugHash != null) {
      const matchedPerk = preferredColumn?.find(
        (preferredPerk) =>
          preferredPerk.hash === socketPerkPlugHash ||
          destinyInventoryItemDefinitions[preferredPerk.hash].displayProperties
            .name ===
            destinyInventoryItemDefinitions[socketPerkPlugHash]
              .displayProperties.name,
      )
      if (matchedPerk != null) {
        return {
          bestColumnIndex: matchedPerk.index,
          bestColumnPerkHashes: [matchedPerk.hash],
        }
      }
    }
    return {
      bestColumnIndex: Infinity,
      bestColumnPerkHashes: [],
    }
  }

  // Handles non masterwork columns with random perks
  reusablePlugsInstance.plugs[column].forEach((perk) => {
    // Comparing by display name is an easy solution for enhanced perks
    const matchedPerk = preferredColumn?.find(
      (preferredPerk) =>
        preferredPerk.hash === perk.plugItemHash ||
        destinyInventoryItemDefinitions[preferredPerk.hash].displayProperties
          .name ===
          destinyInventoryItemDefinitions[perk.plugItemHash].displayProperties
            .name,
    )
    if (matchedPerk != null) {
      if (bestColumnIndex > matchedPerk.index) {
        bestColumnIndex = matchedPerk.index
        bestColumnPerkHashes = [matchedPerk.hash]
      } else if (bestColumnIndex === matchedPerk.index) {
        bestColumnPerkHashes.push(matchedPerk.hash)
      }
    }
  })

  return { bestColumnIndex, bestColumnPerkHashes }
}

export interface BestRoll {
  itemComponent: DestinyItemComponent
  itemInstanceId: string
  bestColumnPerks: {
    bestColumnIndex: number
    bestColumnPerkHashes: number[]
  }[]
}
/**
 * This function gets the lowest matching index and perk hashes for each column for
 * all rolls.  The best perks in each column are then sorted and the roll(s)
 * with the best indexes are returned along with their indexes and perk hashes.
 *
 * The comparison is done by comparing arrays index by index.
 * Ex: [1, 2] > [1, 3, 4] > [2, 2, 2]
 *
 */
export function getBestRolls(
  activeColumns: number[],
  destinyInventoryItemDefinitions: Record<
    number,
    DestinyInventoryItemDefinition
  >,
  rolls: DestinyItemComponent[],
  rollsData: AllRollsData,
  preferredPerks: PreferredPerks,
): BestRoll[] {
  /** The best matching index per column (from lowest index to greatest) of all evaluated rolls  */
  let sortedBestIndex: number[] = []
  let bestRolls: BestRoll[] = []

  rolls.forEach((roll) => {
    const { itemInstanceId } = roll

    if (itemInstanceId == null) {
      withScope((scope) => {
        scope.setContext('roll', { roll })
        captureMessage('Item instance id is null', 'error')
      })
      return
    }

    const reusablePlugsInstance =
      rollsData.reusablePlugsInstances[itemInstanceId]
    const socketsInstance = rollsData.socketsInstances[itemInstanceId]

    // eslint-disable-next-line no-bitwise
    const isCrafted = (roll.state.valueOf() & 8) === 8

    const bestColumnPerks = activeColumns.map((column) =>
      getBestColumnIndex(
        destinyInventoryItemDefinitions,
        reusablePlugsInstance,
        socketsInstance,
        preferredPerks,
        column,
        isCrafted,
        roll.itemHash,
      ),
    )

    /** The best indexes per column (from lowest index to greatest) in the current roll */
    const sortedBestIndexInColumns = bestColumnPerks
      .map((perk) => perk.bestColumnIndex)
      .sort()

    const loopBreak = sortedBestIndexInColumns.some(
      (sortedBestIndexInColumn, i) => {
        // If current index is lower than previous best index or previous best
        // index is null, roll is better, so add roll to best rolls and
        // break loop
        if (
          sortedBestIndexInColumn < sortedBestIndex[i] ||
          sortedBestIndex[i] == null
        ) {
          bestRolls = [{ itemComponent: roll, itemInstanceId, bestColumnPerks }]
          sortedBestIndex = sortedBestIndexInColumns
          return true
        }
        // If current index is greater than previous best index, roll is
        // worse, so break loop without adding roll to best rolls
        return sortedBestIndexInColumns[i] > sortedBestIndex[i]
      },
    )

    // If loop did not break, best indexes must be equal, so add roll to best rolls
    if (!loopBreak) {
      bestRolls.push({ itemComponent: roll, itemInstanceId, bestColumnPerks })
    }
  })

  return bestRolls
}

export function isGodRoll(
  bestRoll: BestRoll,
  godRoll: RollResponse,
  activeColumns: number[],
) {
  const godRollIndexes = activeColumns.map((i) => {
    const godColumnIndexes = godRoll.columns[i]?.map((perk) => perk.index)
    if (godColumnIndexes === undefined) return Infinity
    return Math.min.apply(0, godColumnIndexes)
  })

  const rollIndexes = bestRoll.bestColumnPerks.map(
    (column) => column.bestColumnIndex,
  )

  return isEqual(godRollIndexes, rollIndexes)
}

export function validateRollResponse(
  rollResponse: RollResponse,
  weaponHash: number,
  manifest: DestinyManifestSlices,
) {
  const { columns } = rollResponse
  const weaponDef = manifest.DestinyInventoryItemDefinition[weaponHash]
  return Object.entries(columns).every(([key, value]) => {
    const plugSetHash =
      weaponDef.sockets?.socketEntries[Number.parseInt(key, 10)]
        .randomizedPlugSetHash ||
      weaponDef.sockets?.socketEntries[Number.parseInt(key, 10)]
        .reusablePlugSetHash

    // Check for duplicate hashes
    const hashList = value.map((perk) => perk.hash)
    if (hashList.length !== new Set(hashList).size) {
      captureMessage(
        `Duplicate hashes at column ${key} on rollId ${rollResponse.rollId}`,
        'error',
      )
      return false
    }

    const isIntrinsic =
      key === '0' &&
      manifest.DestinyInventoryItemDefinition[weaponHash].inventory
        ?.recipeItemHash != null

    const isMasterwork =
      !isIntrinsic &&
      manifest.DestinyInventoryItemDefinition[weaponHash].sockets
        ?.socketEntries[Number.parseInt(key, 10)].socketTypeHash ===
        MASTERWORK_TYPE_HASH

    if (isIntrinsic || isMasterwork) {
      let statTypeHashes = WEAPON_TYPE_MASTERWORK_PLUGS[weaponDef.itemSubType]
      if (statTypeHashes == null) {
        captureMessage(
          `No masterwork plugs for itemSubType ${weaponDef.itemSubType} on weapon ${weaponHash} on rollId ${rollResponse.rollId}`,
          'error',
        )
        statTypeHashes = DEFAULT_MASTERWORK_PLUGS
      }

      const intrinsicHashes = getIntrinsicHashes(
        manifest,
        weaponHash,
        statTypeHashes,
      )
      const acceptableHashes = Object.values(
        STAT_TYPE_MASTERWORK_TIER_TEN_HASHES,
      ).concat(intrinsicHashes)
      return value.every((perk) =>
        acceptableHashes.some((hash) => hash === perk.hash),
      )
    }

    if (plugSetHash == null) {
      captureMessage(
        `No randomizedPlugSetHash or reusablePlugSetHash in column ${key} on weapon ${weaponHash} on rollId ${rollResponse.rollId}`,
        'error',
      )
      return false
    }

    return value.every((perk) => {
      if (
        !manifest.DestinyPlugSetDefinition[plugSetHash].reusablePlugItems.some(
          (plugItem) => plugItem.plugItemHash === perk.hash,
        )
      ) {
        captureMessage(
          `Invalid perkHash ${perk.hash} at column ${key} on rollId ${rollResponse.rollId}`,
          'error',
        )
        return false
      }
      return true
    })
  })
}
