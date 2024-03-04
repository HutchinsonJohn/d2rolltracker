import { captureMessage } from '@sentry/react'
import {
  WEAPON_TYPE_MASTERWORK_PLUGS,
  STAT_TYPE_MASTERWORK_TIER_TEN_HASHES,
  DEFAULT_MASTERWORK_PLUGS,
} from '../../data/masterworks'
import { MASTERWORK_TYPE_HASH } from '../../data/sockets'
import { useManifest } from '../../context/ManifestContext'
import {
  getIndex,
  getSortedOrder,
  getBackgroundFillColor,
  getBorderColor,
} from '../../utils/weapon'
import { useWeaponState } from '../../context/WeaponStateContext'
import { PerkColumnDiv } from './PerkColumn'
import { WeaponPerk } from '../common/perk/Perk'
import getIntrinsicHashes from '../../utils/intrinsics'

export default function LastColumn(props: { weaponHash: number }) {
  const manifest = useManifest()
  const weaponState = useWeaponState()

  const weaponDef = manifest.DestinyInventoryItemDefinition[props.weaponHash]
  const masterworkColumn = weaponDef.sockets?.socketEntries.findIndex(
    (socket) => socket.socketTypeHash === MASTERWORK_TYPE_HASH,
  )
  const masterworkSocket =
    masterworkColumn != null && masterworkColumn !== -1
      ? weaponDef.sockets?.socketEntries[masterworkColumn]
      : undefined

  let statTypeHashes = WEAPON_TYPE_MASTERWORK_PLUGS[weaponDef.itemSubType]

  if (statTypeHashes == null) {
    captureMessage(
      `No masterwork plugs for itemSubType ${weaponDef.itemSubType} on weapon ${props.weaponHash}`,
      'error',
    )
    statTypeHashes = DEFAULT_MASTERWORK_PLUGS
  }

  // Handles weapons that can be crafted
  const intrinsicHashes = getIntrinsicHashes(
    manifest,
    props.weaponHash,
    statTypeHashes,
  )

  // Handles weapons with set masterworks
  let singleInitialItemHash
  if (masterworkSocket?.reusablePlugItems.length === 0) {
    singleInitialItemHash = masterworkSocket.singleInitialItemHash
  }
  if (singleInitialItemHash != null) {
    const { statTypeHash } =
      manifest.DestinyInventoryItemDefinition[singleInitialItemHash]
        .investmentStats[0]
    statTypeHashes = [statTypeHash]
  }

  if (
    intrinsicHashes.length === 0 &&
    singleInitialItemHash == null &&
    masterworkSocket == null
  ) {
    return null
  }

  const perkHashes =
    intrinsicHashes.length > 0
      ? intrinsicHashes
      : statTypeHashes
          .map(
            (statTypeHash) =>
              STAT_TYPE_MASTERWORK_TIER_TEN_HASHES[statTypeHash],
          )
          .filter((statTypeHash, i): statTypeHash is number => {
            if (statTypeHash == null) {
              captureMessage(
                `Missing masterwork tier 10 hash for statTypeHash ${statTypeHash} at index ${i} on weapon ${props.weaponHash}`,
                `error`,
              )
              return false
            }
            return true
          })

  const isMasterwork = intrinsicHashes.length === 0
  const isIntrinsic = intrinsicHashes.length > 0
  const column = intrinsicHashes.length === 0 ? masterworkColumn : 0
  if (column == null || column === -1) {
    return null
  }

  return (
    <PerkColumnDiv>
      {perkHashes.map((perkHash) => (
        <WeaponPerk
          key={perkHash}
          column={column}
          index={getIndex(
            weaponState.preferredPerks,
            perkHash,
            masterworkColumn || 0,
            manifest,
            isMasterwork,
            isIntrinsic,
          )}
          sortedIndex={getSortedOrder(
            weaponState.sortedPreferredPerks,
            perkHash,
            masterworkColumn || 0,
            manifest,
            isMasterwork,
            isIntrinsic,
          )}
          backgroundFillColor={getBackgroundFillColor(
            weaponState,
            perkHash,
            column,
            manifest,
            isMasterwork,
            isIntrinsic,
          )}
          borderColor={getBorderColor(
            weaponState,
            perkHash,
            column,
            manifest,
            isMasterwork,
            isIntrinsic,
          )}
          perkHash={perkHash}
          weaponHash={props.weaponHash}
          isMasterwork={intrinsicHashes.length === 0}
          isIntrinsic={intrinsicHashes.length > 0}
        />
      ))}
    </PerkColumnDiv>
  )
}
