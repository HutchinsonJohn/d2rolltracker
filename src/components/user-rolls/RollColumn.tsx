import {
  DestinyItemReusablePlugsComponent,
  DestinyItemSocketsComponent,
} from 'bungie-api-ts/destiny2'
import styled from 'styled-components'
import { useManifest } from '../../context/ManifestContext'
import {
  getIndex,
  getRollBackgroundFillColor,
  getRollBorderColor,
} from '../../utils/weapon'
import { useWeaponState } from '../../context/WeaponStateContext'
import { Perk } from '../common/perk/Perk'

export const ColumnDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  max-width: 50px;
  margin-left: 0.25rem;

  &:first-child {
    margin-left: 0;
  }
`

export default function RollColumn(props: {
  column: number
  reusablePlugsInstance: DestinyItemReusablePlugsComponent
  socketsInstance: DestinyItemSocketsComponent
  weaponHash: number
}) {
  const manifest = useManifest()
  const weaponState = useWeaponState()

  let perkHashes: number[] = []
  const reusablePlugs = props.reusablePlugsInstance.plugs[props.column]

  // This is useful for hawkmoon, redrix, and a few swords
  if (reusablePlugs == null) {
    const socketPerkHash = props.socketsInstance.sockets[props.column].plugHash
    if (socketPerkHash != null) {
      perkHashes = [socketPerkHash]
    } else {
      // Can occur if user has an older weapon for which new rolls of
      // the weapon have an additional perk column
      return null
    }
  } else {
    perkHashes = reusablePlugs.map((plugItem) => plugItem.plugItemHash)
  }

  return (
    <ColumnDiv key={props.column}>
      {perkHashes.map((perkHash) => (
        <Perk
          key={perkHash}
          index={getIndex(
            weaponState.preferredPerks,
            perkHash,
            props.column,
            manifest,
          )}
          backgroundFillColor={getRollBackgroundFillColor(
            weaponState,
            perkHash,
            props.column,
            manifest,
          )}
          borderColor={getRollBorderColor(
            perkHash,
            props.column,
            props.socketsInstance,
          )}
          perkHash={perkHash}
          weaponHash={props.weaponHash}
        />
      ))}
    </ColumnDiv>
  )
}
