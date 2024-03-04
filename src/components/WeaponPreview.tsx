import { Fragment, memo } from 'react'
import styled from 'styled-components'
import {
  faArrowDown19,
  faMagnifyingGlass,
  faPlus,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useHotkeys } from 'react-hotkeys-hook'
import { captureMessage } from '@sentry/react'
import ADEPT_WEAPONS from '../data/adeptWeapons'
import STATS from '../data/stats'
import { useManifest } from '../context/ManifestContext'
import { interpolateStat } from '../utils/perks'
import {
  SelectedPerks,
  PerkModifiers,
  WeaponDispatch,
} from '../context/WeaponStateContext'
import theme, { isMobile } from '../styles/theme'
import ErrorIcon from './error/ErrorIcon'
import { MASTERWORK_TYPE_HASH } from '../data/sockets'

const WeaponPreviewDiv = styled.div`
  position: relative;
  display: flex;
  margin-bottom: 0.5rem;

  @media screen and ${isMobile} {
    max-width: auto;
    font-size: 0.75em;
  }
`

const WeaponDiv = styled.div`
  padding: 0.5em;
  box-sizing: border-box;
  width: 100%;
  font-family:
    Neue Haas Display,
    sans-serif;
`

const WeaponNameH1 = styled.h1`
  font-size: 2.5em;
  display: flex;
  text-transform: uppercase;
  margin: 0;
  font-weight: bold;
`

const DamageTypeImg = styled.img`
  width: 1em;
  padding-right: 0.125em;
`

const WeaponTypeH3 = styled.h3`
  font-size: 1.75em;
  text-transform: uppercase;
  display: flex;
  margin: 0;
  font-weight: normal;
  align-items: center;
`

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
  overflow: hidden;
  white-space: nowrap;
`

const StatValueDiv = styled.div<{ change: number; hasBar: boolean }>`
  ${(props) => (props.hasBar ? '' : 'grid-column: 2 / 4;')}
  color: ${(props) => {
    if (props.change > 0) return 'green'
    if (props.change < 0) return 'red'
    return theme.white
  }};
`

const ModifiersDiv = styled.div`
  display: flex;
  position: absolute;
  right: 0px;
  bottom: 0px;
  margin: 6px;
`

const ModifierButton = styled.button<{
  isSelected?: boolean
}>`
  all: unset;
  margin: 3px;
  box-sizing: border-box;
  line-height: 50px;
  text-align: center;
  vertical-align: middle;
  width: 50px;
  height: 50px;
  border: 1px solid ${theme.white};
  ${(props) => props.isSelected && `background-color: ${theme.exoticGold}`};
  border-radius: 50%;

  &:hover {
    filter: brightness(1.2);
  }
`

const PreferContainerDiv = styled.div`
  position: relative;
`

const ModifyIndexDiv = styled.button<{
  isIncrement?: boolean
}>`
  all: unset;
  box-sizing: border-box;
  position: absolute;
  ${(props) => (props.isIncrement ? 'left' : 'right')}: 100%;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  background-color: ${theme.exoticGold};
  border: 1px solid ${theme.white};

  &:hover {
    filter: brightness(1.2);
  }

  ${PreferContainerDiv}:hover & {
    opacity: 1;
  }
`

const IndexDiv = styled.div`
  box-sizing: border-box;
  position: absolute;
  width: 25px;
  height: 25px;
  right: -10%;
  top: -10%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1em;
  font-weight: bold;
  z-index: 1;
  user-select: none;
  border: 1px solid ${theme.white};
  background-color: ${theme.exoticGold};
`

function WeaponPreview(props: {
  weaponHash: number
  isWeaponStatic: boolean
  index: number
  selectedPerks: SelectedPerks
  selectedModifier: PerkModifiers
  weaponDispatch: WeaponDispatch
}) {
  const manifest = useManifest()
  const weaponDef = manifest.DestinyInventoryItemDefinition[props.weaponHash]

  useHotkeys(
    ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    (event) =>
      props.selectedModifier === PerkModifiers.Preferred &&
      props.weaponDispatch({
        type: 'SET_INDEX',
        index: Number.parseInt(event.key, 10) - 1,
      }),
  )

  const bungieURL = 'https://www.bungie.net'

  const stats = weaponDef.investmentStats

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

  const statGroupHash = weaponDef.stats?.statGroupHash

  return (
    <WeaponPreviewDiv>
      <WeaponDiv
        style={{
          backgroundImage: `url(${bungieURL + weaponDef.screenshot})`,
          backgroundSize: 'cover',
          backgroundPosition: '100%',
        }}
      >
        <WeaponNameH1>
          {weaponDef.displayProperties.name}
          {statGroupHash == null && (
            <ErrorIcon
              message="Something went wrong while trying to display this weapon: Weapon
            definition did not contain a statGroupHash."
            />
          )}
        </WeaponNameH1>
        <WeaponTypeH3>
          <DamageTypeImg
            src={
              bungieURL +
              manifest.DestinyDamageTypeDefinition[
                weaponDef.damageTypeHashes[0]
              ].displayProperties.icon
            }
            title={
              manifest.DestinyDamageTypeDefinition[
                weaponDef.damageTypeHashes[0]
              ].displayProperties.name
            }
            alt={`${
              manifest.DestinyDamageTypeDefinition[
                weaponDef.damageTypeHashes[0]
              ].displayProperties.name
            } Icon`}
          />
          {weaponDef.itemTypeDisplayName}
        </WeaponTypeH3>
        {statGroupHash != null && (
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
                  <StatValueDiv change={statChange} hasBar={!!statObj.hasBar}>
                    {baseStat + statChange}
                  </StatValueDiv>
                  {statObj.hasBar && (
                    <StatBarBackgroundDiv>
                      <StatBarBaseDiv width={baseStat} />
                      <StatBarChangeDiv base={baseStat} change={statChange} />
                    </StatBarBackgroundDiv>
                  )}
                </Fragment>
              )
            })}
          </StatsGridDiv>
        )}
        {!props.isWeaponStatic && (
          <ModifiersDiv>
            <ModifierButton
              title="Preview perk benefits"
              isSelected={props.selectedModifier === PerkModifiers.Selected}
              onClick={() =>
                props.weaponDispatch({
                  type: 'SET_MODIFIER',
                  modifier: PerkModifiers.Selected,
                })
              }
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </ModifierButton>
            <PreferContainerDiv>
              <ModifierButton
                title="Add perks to roll"
                isSelected={props.selectedModifier === PerkModifiers.Preferred}
                onClick={() =>
                  props.weaponDispatch({
                    type: 'SET_MODIFIER',
                    modifier: PerkModifiers.Preferred,
                  })
                }
              >
                <FontAwesomeIcon icon={faPlus} />
              </ModifierButton>
              {props.selectedModifier === PerkModifiers.Preferred && (
                <IndexDiv>
                  <ModifyIndexDiv
                    onClick={() =>
                      props.weaponDispatch({
                        type: 'SET_INDEX',
                        index: props.index - 1,
                      })
                    }
                  >
                    -
                  </ModifyIndexDiv>
                  <>{props.index + 1}</>
                  <ModifyIndexDiv
                    isIncrement
                    onClick={() =>
                      props.weaponDispatch({
                        type: 'SET_INDEX',
                        index: props.index + 1,
                      })
                    }
                  >
                    +
                  </ModifyIndexDiv>
                </IndexDiv>
              )}
            </PreferContainerDiv>
            <ModifierButton
              title="Sort"
              onClick={() => props.weaponDispatch({ type: 'SORT' })}
            >
              <FontAwesomeIcon icon={faArrowDown19} />
            </ModifierButton>
          </ModifiersDiv>
        )}
      </WeaponDiv>
    </WeaponPreviewDiv>
  )
}

export default memo(WeaponPreview)
