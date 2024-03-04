import type { DestinyManifestSlice } from 'bungie-api-ts/destiny2'
import { createContext, useContext, useMemo, ReactNode } from 'react'

export type DestinyManifestSlices = DestinyManifestSlice<
  [
    'DestinyInventoryItemDefinition',
    'DestinyPlugSetDefinition',
    'DestinySandboxPerkDefinition',
    'DestinySocketCategoryDefinition',
    'DestinySocketTypeDefinition',
    'DestinyStatGroupDefinition',
    'DestinyStatDefinition',
    'DestinyDamageTypeDefinition',
  ]
>

export type DestinyManifest = DestinyManifestSlices & { version: string }

const ManifestContext = createContext<DestinyManifest | undefined>(undefined)

export function useManifest() {
  const data = useContext(ManifestContext)
  if (data == null) {
    throw new Error(
      'A component that relies on the manifest is used while the manifest is not yet loaded',
    )
  }
  return data
}

export default function ManifestProvider(props: {
  children: ReactNode
  value: DestinyManifest
}) {
  const manifest = useMemo(() => props.value, [props.value])
  return (
    <ManifestContext.Provider value={manifest}>
      {props.children}
    </ManifestContext.Provider>
  )
}
