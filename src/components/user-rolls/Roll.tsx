import {
  DestinyItemComponent,
  DestinyItemReusablePlugsComponent,
  DestinyItemSocketsComponent,
} from 'bungie-api-ts/destiny2'
import styled from 'styled-components'
import { useState } from 'react'
import { BestRoll, isGodRoll } from '../../utils/rolls'
import WeaponIcon from '../common/WeaponIcon'
import { RollResponse } from '../../api/rolls'
import theme from '../../styles/theme'
import RollInfo from './RollInfo'
import RollColumn from './RollColumn'
import LastRollColumn from './LastRollColumn'
import { useManifest } from '../../context/ManifestContext'
import { MASTERWORK_TYPE_HASH } from '../../data/sockets'

const RollDiv = styled.div`
  background-color: ${theme.black90};
  margin-bottom: 0.5rem;
  padding: 0.5rem;
`

const ColumnLayoutDiv = styled.div`
  display: flex;
`

const ColumnDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  max-width: 50px;
  margin-left: 0.25rem;

  &:first-child {
    margin-left: 0;
  }
`

const WeaponIconDiv = styled.div`
  position: relative;
`

export default function Roll(props: {
  isBestRoll: boolean
  activeColumns: number[]
  roll: DestinyItemComponent
  reusablePlugsInstance: DestinyItemReusablePlugsComponent
  socketsInstance: DestinyItemSocketsComponent
  weaponHash: number
  godRollMatches: {
    userRoll: BestRoll
    godRoll: RollResponse
  }[]
}) {
  const manifest = useManifest()

  const [anchor, setAnchor] = useState<Element | null>(null)

  const perfectRolls = props.godRollMatches.filter((godRollMatch) =>
    isGodRoll(godRollMatch.userRoll, godRollMatch.godRoll, props.activeColumns),
  )

  const bestRolls = props.godRollMatches.filter(
    (godRollMatch) => !perfectRolls.includes(godRollMatch),
  )

  const masterworkColumnIndex = manifest.DestinyInventoryItemDefinition[
    props.weaponHash
  ].sockets?.socketEntries.findIndex(
    (socket) => socket.socketTypeHash === MASTERWORK_TYPE_HASH,
  )

  const lastColumnIndex =
    masterworkColumnIndex != null &&
    // eslint-disable-next-line no-bitwise
    (props.roll.state.valueOf() & 8) !== 8
      ? masterworkColumnIndex
      : 0

  let order = 3
  if (props.isBestRoll) {
    order = -1
  } else if (perfectRolls.length > 0) {
    order = 1
  } else if (bestRolls.length > 0) {
    order = 2
  }

  return (
    <RollDiv style={{ order }}>
      <ColumnLayoutDiv>
        <ColumnDiv>
          <WeaponIconDiv ref={setAnchor}>
            <WeaponIcon
              weaponHash={props.weaponHash}
              borderColor={(() => {
                if (perfectRolls.length > 0) return theme.exoticGold
                if (bestRolls.length > 0) return theme.legendaryPurple
                return theme.white
              })()}
            />
          </WeaponIconDiv>
          <RollInfo
            perfectRolls={perfectRolls}
            bestRolls={bestRolls}
            anchor={anchor}
          />
        </ColumnDiv>
        {props.activeColumns.map((column) => {
          if (column === lastColumnIndex || column === 0) return null
          return (
            <RollColumn
              key={column}
              column={column}
              reusablePlugsInstance={props.reusablePlugsInstance}
              socketsInstance={props.socketsInstance}
              weaponHash={props.weaponHash}
            />
          )
        })}
        <LastRollColumn
          column={lastColumnIndex}
          roll={props.roll}
          socketsInstance={props.socketsInstance}
          weaponHash={props.weaponHash}
        />
        {/* <button
          onClick={() =>
            navigator.clipboard.writeText(`id:${props.roll.itemInstanceId}`)
          }
          type="button"
        >
          Copy DIM Item Query
        </button> */}
      </ColumnLayoutDiv>
    </RollDiv>
  )
}
