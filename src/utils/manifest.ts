import { get, set } from 'idb-keyval'
import {
  DestinyInventoryItemDefinition,
  getDestinyManifest,
  getDestinyManifestSlice,
} from 'bungie-api-ts/destiny2'
import { bungieHTTPClient, bungieHTTPClientWithApiKey } from './http'
import { BungieError } from './error'
import {
  DestinyManifest,
  DestinyManifestSlices,
} from '../context/ManifestContext'

export const manifestKey = 'manifest'
export const manifestVersionKey = 'manifest-version'

export default async function loadManifest(isCookieConsentRequired = false) {
  const manifestResponse = await getDestinyManifest(bungieHTTPClientWithApiKey)
  if (manifestResponse.ErrorCode !== 1) {
    throw new BungieError(manifestResponse)
  }
  const destinyManifest = manifestResponse.Response
  const path = destinyManifest.jsonWorldContentPaths.en
  // Even though the version is in the manifest, we still need to store it in
  // localStorage so that clearing the cache will force a reload. Otherwise,
  // clearing the cache may not clear it from IndexedDB.
  const localPath = localStorage.getItem(manifestVersionKey)

  // If path matches, load from IndexedDB
  if (localPath === path) {
    /**
     * Bug: On Firefox, retrieving the manifest from indexedDB interferes with
     * the loading screen animation. It also takes 8 times as long as Chrome.
     * This seems to be the case on DIM as well.
     */
    const manifestDefs = await get(manifestKey)
    if (manifestDefs != null) return manifestDefs
  }

  // Load from bungie
  const manifestDefs: DestinyManifestSlices = await getDestinyManifestSlice(
    bungieHTTPClient,
    {
      destinyManifest,
      tableNames: [
        'DestinyInventoryItemDefinition',
        'DestinyPlugSetDefinition',
        'DestinySandboxPerkDefinition',
        'DestinySocketCategoryDefinition',
        'DestinySocketTypeDefinition',
        'DestinyStatGroupDefinition',
        'DestinyStatDefinition',
        'DestinyDamageTypeDefinition',
      ],
      language: 'en',
    },
  )
  // We need to add the version to the manifest so that we can easily access it
  // in the CookieConsent component so that the manifest can be saved to
  // IndexedDB when the user accepts cookies.
  const manifest: DestinyManifest = { ...manifestDefs, version: path }
  // Non-essential cookies, but it would be nice to have the manifest cached
  if (
    !isCookieConsentRequired ||
    document.cookie.includes('cookie-consent=accepted')
  ) {
    set(manifestKey, manifest)
    localStorage.setItem(manifestVersionKey, path)
  }
  return manifest
}

export function getWeaponsFromManifest(
  destinyInventoryItemDefinition: Record<
    number,
    DestinyInventoryItemDefinition
  >,
) {
  const weaponsDefinitions: Record<number, DestinyInventoryItemDefinition> = {}

  Object.values(destinyInventoryItemDefinition).forEach((itemDef) => {
    if (
      itemDef.itemCategoryHashes?.includes(1) &&
      !itemDef.itemCategoryHashes?.includes(3109687656) // Dummy category
    ) {
      weaponsDefinitions[itemDef.hash] = itemDef
    }
  })

  return weaponsDefinitions
}

export function getWeaponsWithRandomRollsFromManifest(
  destinyInventoryItemDefinition: Record<
    number,
    DestinyInventoryItemDefinition
  >,
) {
  const weaponsDefinitions: Record<number, DestinyInventoryItemDefinition> = {}

  Object.values(destinyInventoryItemDefinition).forEach((itemDef) => {
    if (itemDef.itemCategoryHashes?.includes(1)) {
      if (
        itemDef.sockets?.socketEntries.some(
          (socketEntry, i) =>
            i > 0 && i < 5 && socketEntry.randomizedPlugSetHash != null,
        )
      ) {
        weaponsDefinitions[itemDef.hash] = itemDef
      }
    }
  })

  return weaponsDefinitions
}
