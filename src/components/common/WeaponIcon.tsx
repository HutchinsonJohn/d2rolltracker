import styled, { keyframes } from 'styled-components'
import { memo } from 'react'
import theme from '../../styles/theme'
import { useManifest } from '../../context/ManifestContext'

const WeaponImg = styled.img<{ iconUrl: string; borderColor?: string }>`
  background-image: ${(props) => `url(${props.iconUrl})`};
  width: 50px;
  height: 50px;
  background-size: cover;
  border: 1px ${(props) => props.borderColor || theme.white} solid;
  box-sizing: border-box;
`

function WeaponIcon(props: { weaponHash: number; borderColor?: string }) {
  const manifest = useManifest()
  const weaponDef = manifest.DestinyInventoryItemDefinition[props.weaponHash]
  return (
    <WeaponImg
      loading="lazy"
      title={weaponDef.displayProperties.name}
      iconUrl={`https://www.bungie.net${weaponDef.displayProperties.icon}`}
      src={`https://www.bungie.net${weaponDef.quality?.displayVersionWatermarkIcons[0]}`}
      borderColor={props.borderColor}
    />
  )
}

export default memo(WeaponIcon)

const skeleton = keyframes`
  0% {
    background-color: hsl(240, 10%, 30%)
  }
  100% {
    background-color: hsl(240, 10%, 50%)
  }
`

export const SkeletonWeaponImg = styled.img`
  width: 50px;
  height: 50px;
  box-sizing: border-box;

  animation: ${skeleton} 1.5s infinite linear alternate;
`
