import styled from 'styled-components'
import { captureMessage } from '@sentry/react'
import { Fragment, memo } from 'react'
import theme from '../../styles/theme'
import { interpolateStat } from '../../utils/perks'
import STATS from '../../data/stats'
import { useManifest } from '../../context/ManifestContext'
import { MASTERWORK_TYPE_HASH } from '../../data/sockets'
import { SelectedPerks } from '../../context/WeaponStateContext'
import ADEPT_WEAPONS from '../../data/adeptWeapons'

const StatsGridDiv = styled.div`
  padding: 0;
  display: grid;
  grid-template-columns: max-content 1.2em 0.75fr;
  align-items: center;
  grid-column-gap: 0.75em;
  padding: 0.5rem;
  margin: 0;
  max-width: 700px;
`

const StatBarBackgroundDiv = styled.div`
  background-color: rgba(255, 255, 255, 0.2);
  height: 1em;
  position: relative;
`

const StatBarBaseDiv = styled.div<{ width: number }>`
  width: ${(props) => props.width}%;
  height: 100%;
  background-color: ${theme.white};
  position: absolute;
`

const StatBarChangeDiv = styled.div<{ base: number; change: number }>`
  height: 100%;
  left: ${(props) => props.base + Math.min(props.change, 0)}%;
  float: ${(props) => (props.change > 0 ? 'left' : 'right')};
  width: ${(props) => Math.abs(props.change)}%;
  background-color: ${(props) => {
    if (props.change > 0) return 'green'
    if (props.change < 0) return 'red'
    return theme.white
  }};
  position: absolute;
  transition:
    width 0.3s,
    background-color 0.3s,
    left 0.3s;
`

const StatNameDiv = styled.div`
  text-align: right;
  white-space: nowrap;
  text-shadow:
    #000 0px 0px 1px,
    #000 0px 0px 1px,
    #000 0px 0px 1px,
    #000 0px 0px 1px,
    #000 0px 0px 1px,
    #000 0px 0px 1px;
`

const StatValueDiv = styled.div<{ change: number }>`
  color: ${(props) => {
    if (props.change > 0) return 'green'
    if (props.change < 0) return 'red'
    return theme.white
  }};
  text-shadow:
    #000 0px 0px 1px,
    #000 0px 0px 1px,
    #000 0px 0px 1px,
    #000 0px 0px 1px,
    #000 0px 0px 1px,
    #000 0px 0px 1px;
`

function StatsGrid(props: {
  weaponHash: number
  selectedPerks: SelectedPerks
}) {
  const manifest = useManifest()
  const weaponDef = manifest.DestinyInventoryItemDefinition[props.weaponHash]
  const stats = weaponDef.investmentStats
  const statGroupHash = weaponDef.stats?.statGroupHash

  if (statGroupHash == null) {
    return null
  }

  const perkStats: Record<number, number> = {}
  Object.entries(props.selectedPerks).forEach(([column, perkHash]) => {
    if (perkHash != null) {
      const isIntrinsic =
        column === '0' &&
        manifest.DestinyInventoryItemDefinition[props.weaponHash].inventory
          ?.recipeItemHash != null

      const isMasterwork =
        !isIntrinsic &&
        manifest.DestinyInventoryItemDefinition[props.weaponHash].sockets
          ?.socketEntries[Number.parseInt(column, 10)].socketTypeHash ===
          MASTERWORK_TYPE_HASH

      if (isIntrinsic || isMasterwork) {
        const masterworkDef = manifest.DestinyInventoryItemDefinition[perkHash]
        masterworkDef.investmentStats.forEach((stat) => {
          if (
            !stat.isConditionallyActive ||
            weaponDef.inventory?.recipeItemHash != null ||
            ADEPT_WEAPONS.some((adeptString) =>
              weaponDef.displayProperties.name.includes(adeptString),
            )
          ) {
            const statValue = perkStats[stat.statTypeHash]
            perkStats[stat.statTypeHash] = stat.value + (statValue ?? 0)
          }
        })
      } else {
        const perkDef = manifest.DestinyInventoryItemDefinition[perkHash]
        perkDef.investmentStats.forEach((stat) => {
          if (stat.isConditionallyActive) {
            captureMessage(
              `Non-masterwork conditionally active stat on perk: ${perkHash} on weapon: ${props.weaponHash}`,
              'warning',
            )
          }
          const statValue = perkStats[stat.statTypeHash]
          perkStats[stat.statTypeHash] = stat.value + (statValue ?? 0)
        })
      }
    }
  })

  return (
    <StatsGridDiv>
      {STATS.map((statObj) => {
        const stat = stats.find((s) => s.statTypeHash === statObj.hash)

        if (stat == null) {
          return null
        }
        // Don't show charge time for bow or glaive
        if (
          statObj.name === 'Charge Time' &&
          (weaponDef.itemSubType === 31 || weaponDef.itemSubType === 33)
        ) {
          return null
        }
        const perkStat = perkStats[stat.statTypeHash]
        const statDisplay = manifest.DestinyStatGroupDefinition[
          statGroupHash
        ].scaledStats.find(
          (scaledStat) => scaledStat.statHash === stat.statTypeHash,
        )

        const baseStat =
          statDisplay == null
            ? stat.value
            : interpolateStat(stat.value, statDisplay)
        const statChange =
          statDisplay == null
            ? perkStat || 0
            : interpolateStat(stat.value + (perkStat || 0), statDisplay) -
              baseStat
        return (
          <Fragment key={statObj.hash}>
            <StatNameDiv>{statObj.name}</StatNameDiv>
            <StatValueDiv change={statChange}>
              {baseStat + statChange}
            </StatValueDiv>
            {statObj.hasBar && (
              <StatBarBackgroundDiv>
                <StatBarBaseDiv width={baseStat} />
                <StatBarChangeDiv base={baseStat} change={statChange} />
              </StatBarBackgroundDiv>
            )}
            {!statObj.hasBar && <div />}
          </Fragment>
        )
      })}
    </StatsGridDiv>
  )
}

export default memo(StatsGrid)
