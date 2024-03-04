import type {
  DestinyInventoryItemDefinition,
  DestinyItemSocketsComponent,
} from 'bungie-api-ts/destiny2'
import type { DestinyManifestSlices } from '../context/ManifestContext'
import type { WeaponState, PreferredPerks } from '../context/WeaponStateContext'
import theme from '../styles/theme'

/**
 * Returns itemDef.investmentStats[0].statTypeHash or 0 if undefined
 * Intended for use with Masterworks and Intrinsics only
 */
export function getStatTypeHashFromDef(
  itemDef: DestinyInventoryItemDefinition,
) {
  return itemDef.investmentStats[0]?.statTypeHash || 0
}

export function getBackgroundFillColor(
  weaponState: WeaponState,
  perkHash: number,
  column: number,
  manifest: DestinyManifestSlices,
  isMasterwork = false,
  isIntrinsic = false,
) {
  const statTypeHash = getStatTypeHashFromDef(
    manifest.DestinyInventoryItemDefinition[perkHash],
  )
  const preferredPerk = weaponState.preferredPerks[column]?.find((perk) =>
    isMasterwork || isIntrinsic
      ? getStatTypeHashFromDef(
          manifest.DestinyInventoryItemDefinition[perk.hash],
        ) === statTypeHash
      : perk.hash === perkHash ||
        manifest.DestinyInventoryItemDefinition[perk.hash].displayProperties
          .name ===
          manifest.DestinyInventoryItemDefinition[perkHash].displayProperties
            .name,
  )
  if (preferredPerk != null) {
    if (
      preferredPerk.index === weaponState.highestPreferredColumnIndexes[column]
    ) {
      return theme.exoticGold
    }
    return theme.legendaryPurple
  }
  return 'rgba(0,0,0,0)'
}

export function getBorderColor(
  weaponState: WeaponState,
  perkHash: number,
  column: number,
  manifest: DestinyManifestSlices,
  isMasterwork = false,
  isIntrinsic = false,
) {
  const statTypeHash = getStatTypeHashFromDef(
    manifest.DestinyInventoryItemDefinition[perkHash],
  )
  const selectedPerk = weaponState.selectedPerks[column]

  if (selectedPerk == null) {
    return theme.white
  }

  if (isMasterwork || isIntrinsic) {
    if (
      getStatTypeHashFromDef(
        manifest.DestinyInventoryItemDefinition[selectedPerk],
      ) === statTypeHash
    ) {
      return theme.selectedBlue
    }
    return theme.white
  }

  if (
    selectedPerk === perkHash ||
    manifest.DestinyInventoryItemDefinition[selectedPerk].displayProperties
      .name ===
      manifest.DestinyInventoryItemDefinition[perkHash].displayProperties.name
  ) {
    return theme.selectedBlue
  }

  return theme.white
}

export function getRollBackgroundFillColor(
  weaponState: WeaponState,
  perkHash: number,
  column: number,
  manifest: DestinyManifestSlices,
  isMasterwork = false,
  isIntrinsic = false,
) {
  const statTypeHash = getStatTypeHashFromDef(
    manifest.DestinyInventoryItemDefinition[perkHash],
  )
  const preferredPerk = weaponState.preferredPerks[column]?.find((perk) =>
    isMasterwork || isIntrinsic
      ? getStatTypeHashFromDef(
          manifest.DestinyInventoryItemDefinition[perk.hash],
        ) === statTypeHash
      : perk.hash === perkHash ||
        manifest.DestinyInventoryItemDefinition[perk.hash].displayProperties
          .name ===
          manifest.DestinyInventoryItemDefinition[perkHash].displayProperties
            .name,
  )
  if (preferredPerk != null) {
    if (
      preferredPerk.index === weaponState.highestPreferredColumnIndexes[column]
    ) {
      return theme.exoticGold
    }
    return theme.legendaryPurple
  }
  return 'rgba(0,0,0,0)'
}

export function getRollBorderColor(
  perkHash: number,
  column: number,
  socketsInstance?: DestinyItemSocketsComponent,
) {
  if (socketsInstance?.sockets[column]?.plugHash === perkHash) {
    return theme.selectedBlue
  }

  return theme.white
}

export function getIndex(
  preferredPerks: PreferredPerks,
  perkHash: number,
  column: number,
  manifest: DestinyManifestSlices,
  isMasterwork = false,
  isIntrinsic = false,
) {
  if (isMasterwork || isIntrinsic) {
    const statTypeHash = getStatTypeHashFromDef(
      manifest.DestinyInventoryItemDefinition[perkHash],
    )
    const index = preferredPerks[column]?.find(
      (perk) =>
        getStatTypeHashFromDef(
          manifest.DestinyInventoryItemDefinition[perk.hash],
        ) === statTypeHash,
    )?.index
    if (index == null) {
      return -1
    }
    return index
  }

  const index = preferredPerks[column]?.find(
    (perk) =>
      perk.hash === perkHash ||
      manifest.DestinyInventoryItemDefinition[perk.hash].displayProperties
        .name ===
        manifest.DestinyInventoryItemDefinition[perkHash].displayProperties
          .name,
  )?.index
  if (index == null) {
    return -1
  }
  return index
}

export function getSortedOrder(
  sortedPreferredPerks: PreferredPerks,
  perkHash: number,
  column: number,
  manifest: DestinyManifestSlices,
  isMasterwork = false,
  isIntrinsic = false,
) {
  if (isMasterwork || isIntrinsic) {
    const statTypeHash = getStatTypeHashFromDef(
      manifest.DestinyInventoryItemDefinition[perkHash],
    )
    const index = sortedPreferredPerks[column]?.find(
      (perk) =>
        getStatTypeHashFromDef(
          manifest.DestinyInventoryItemDefinition[perk.hash],
        ) === statTypeHash,
    )?.index
    if (index == null || index === -1) {
      return Number.MAX_SAFE_INTEGER
    }
    return index
  }
  const index = sortedPreferredPerks[column]?.find(
    (perk) =>
      perk.hash === perkHash ||
      manifest.DestinyInventoryItemDefinition[perk.hash].displayProperties
        .name ===
        manifest.DestinyInventoryItemDefinition[perkHash].displayProperties
          .name,
  )?.index
  if (index == null || index === -1) {
    return Number.MAX_SAFE_INTEGER
  }
  return index
}
