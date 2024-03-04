import { DestinyItemSocketEntryDefinition } from 'bungie-api-ts/destiny2'
import styled from 'styled-components'
import { captureMessage } from '@sentry/react'
import {
  WEAPON_PERK_CATEGORY_HASH,
  TRACKER_TYPE_HASH,
} from '../../data/sockets'
import { useManifest } from '../../context/ManifestContext'
import {
  getIndex,
  getSortedOrder,
  getBackgroundFillColor,
  getBorderColor,
} from '../../utils/weapon'
import { useWeaponState } from '../../context/WeaponStateContext'
import { WeaponPerk } from '../common/perk/Perk'

export const PerkColumnDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  max-width: 100px;
  margin: 4px;
`

export default function PerkColumn(props: {
  socketEntryDef: DestinyItemSocketEntryDefinition
  column: number
  weaponHash: number
}) {
  const manifest = useManifest()
  const weaponState = useWeaponState()

  const { socketTypeHash } = props.socketEntryDef
  const socketTypeDef = manifest.DestinySocketTypeDefinition[socketTypeHash]

  // Perk socket type
  if (
    socketTypeDef == null ||
    socketTypeDef.socketCategoryHash !== WEAPON_PERK_CATEGORY_HASH ||
    socketTypeHash === TRACKER_TYPE_HASH
  ) {
    return null
  }

  let plugSetHash = props.socketEntryDef.randomizedPlugSetHash
  if (plugSetHash == null) {
    plugSetHash = props.socketEntryDef.reusablePlugSetHash
  }
  if (plugSetHash == null) {
    captureMessage(
      `No randomizedPlugSetHash or reusablePlugSetHash in column ${props.column} on weapon ${props.weaponHash}`,
      'error',
    )
    return null
  }
  if (
    props.column > 8 ||
    props.column < 1 ||
    props.column === 5 ||
    props.column === 6
  ) {
    captureMessage(
      `Unexpected column index ${props.column} on weapon: ${props.weaponHash}`,
      'warning',
    )
  }
  const plugSet = manifest.DestinyPlugSetDefinition[plugSetHash]

  // If the weapon has enhanced perks, filters out non-enhanced perks
  const plugItems = (
    plugSet.reusablePlugItems.find(
      (plugItem) =>
        manifest.DestinyInventoryItemDefinition[plugItem.plugItemHash].inventory
          ?.tierType === 3,
    ) != null
      ? plugSet.reusablePlugItems.filter(
          (plugItem) =>
            manifest.DestinyInventoryItemDefinition[plugItem.plugItemHash]
              .inventory?.tierType === 3,
        )
      : plugSet.reusablePlugItems
  ).filter(
    // Filters out perks listed twice in the api
    (plugItem, index, self) =>
      index ===
      self.findIndex((item) => item.plugItemHash === plugItem.plugItemHash),
  )

  return (
    <PerkColumnDiv key={props.column}>
      {plugItems.map((plugItem) => (
        <WeaponPerk
          key={plugItem.plugItemHash}
          column={props.column}
          index={getIndex(
            weaponState.preferredPerks,
            plugItem.plugItemHash,
            props.column,
            manifest,
          )}
          sortedIndex={getSortedOrder(
            weaponState.sortedPreferredPerks,
            plugItem.plugItemHash,
            props.column,
            manifest,
          )}
          backgroundFillColor={getBackgroundFillColor(
            weaponState,
            plugItem.plugItemHash,
            props.column,
            manifest,
          )}
          borderColor={getBorderColor(
            weaponState,
            plugItem.plugItemHash,
            props.column,
            manifest,
          )}
          perkHash={plugItem.plugItemHash}
          weaponHash={props.weaponHash}
          isRetired={!plugItem.currentlyCanRoll}
        />
      ))}
    </PerkColumnDiv>
  )
}
