import {
  DestinyItemComponent,
  DestinyItemSocketsComponent,
} from 'bungie-api-ts/destiny2'
import { useManifest } from '../../context/ManifestContext'
import {
  getIndex,
  getRollBackgroundFillColor,
  getRollBorderColor,
} from '../../utils/weapon'
import { useWeaponState } from '../../context/WeaponStateContext'
import { Perk } from '../common/perk/Perk'
import { ColumnDiv } from './RollColumn'

export default function LastRollColumn(props: {
  column: number
  roll: DestinyItemComponent
  socketsInstance: DestinyItemSocketsComponent
  weaponHash: number
}) {
  const manifest = useManifest()
  const weaponState = useWeaponState()

  const masterworkHash = props.socketsInstance.sockets[props.column]?.plugHash

  // 233125175 is a placeholder masterwork for crafted weapons
  // if (masterworkHash != null && masterworkHash != 233125175) {}
  const intrinsicHash =
    // eslint-disable-next-line no-bitwise
    (props.roll.state.valueOf() & 8) === 8 &&
    props.socketsInstance.sockets[0].plugHash

  const lastColumnHash = intrinsicHash || masterworkHash

  if (lastColumnHash == null) {
    return null
  }

  const isMasterwork = !intrinsicHash
  const isIntrinsic = !!intrinsicHash

  return (
    <ColumnDiv>
      <Perk
        index={getIndex(
          weaponState.preferredPerks,
          lastColumnHash,
          props.column,
          manifest,
          isMasterwork,
          isIntrinsic,
        )}
        backgroundFillColor={getRollBackgroundFillColor(
          weaponState,
          lastColumnHash,
          props.column,
          manifest,
          isMasterwork,
          isIntrinsic,
        )}
        borderColor={getRollBorderColor(
          lastColumnHash,
          props.column,
          props.socketsInstance,
        )}
        perkHash={lastColumnHash}
        weaponHash={props.weaponHash}
        isMasterwork={isMasterwork}
        isIntrinsic={isIntrinsic}
      />
    </ColumnDiv>
  )
}
