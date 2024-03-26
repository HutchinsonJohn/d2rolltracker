import { memo } from 'react'
import styled from 'styled-components'
import { useHotkeys } from 'react-hotkeys-hook'
import { useManifest } from '../../context/ManifestContext'
import {
  SelectedPerks,
  PerkModifiers,
  WeaponDispatch,
} from '../../context/WeaponStateContext'
import { isMobile } from '../../styles/theme'
import ErrorIcon from '../error/ErrorIcon'
import StatsGrid from './StatsGrid'
import Modifiers from './Modifiers'

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
  background-size: cover;
  background-position: right;
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

  const statGroupHash = weaponDef.stats?.statGroupHash

  return (
    <WeaponPreviewDiv>
      <WeaponDiv
        style={{
          backgroundImage: `url(${bungieURL + weaponDef.screenshot})`,
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
          <StatsGrid
            selectedPerks={props.selectedPerks}
            weaponHash={props.weaponHash}
          />
        )}
        {!props.isWeaponStatic && (
          <Modifiers
            selectedModifier={props.selectedModifier}
            index={props.index}
            weaponDispatch={props.weaponDispatch}
          />
        )}
      </WeaponDiv>
    </WeaponPreviewDiv>
  )
}

export default memo(WeaponPreview)
