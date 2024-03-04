import styled from 'styled-components'
import theme from '../../../styles/theme'
import { useManifest } from '../../../context/ManifestContext'
import { STAT_TYPE_MASTERWORK_TIER_TEN_HASHES } from '../../../data/masterworks'

const PerkIconCircle = styled.circle<{ stroke?: string; fill?: string }>`
  cx: 50px;
  cy: 50px;
  r: 46px;
  stroke: ${(props) => props.stroke ?? theme.white};
  fill: ${(props) => props.fill ?? 'transparent'};
  stroke-width: 3px;
`

const PerkIconRect = styled.rect<{ stroke?: string; fill?: string }>`
  x: 2px;
  y: 2px;
  width: 96px;
  height: 96px;
  stroke: ${(props) => props.stroke ?? theme.white};
  fill: ${(props) => props.fill ?? 'transparent'};
  stroke-width: 3px;
`

const PerkIconSvg = styled.svg`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`

function PerkIcon(props: {
  perkHash: number
  backgroundFillColor: string
  borderColor: string
}) {
  const manifest = useManifest()
  const perkDef = manifest.DestinyInventoryItemDefinition[props.perkHash]
  const iconURL = perkDef.displayProperties.icon
  const enhanced = perkDef.inventory?.tierType === 3
  return (
    <PerkIconSvg viewBox="0 0 100 100">
      <defs>
        <linearGradient id="mw" x1="0" x2="0" y1="0" y2="1">
          <stop stopColor="transparent" offset="20%" />
          <stop stopColor="#eade8b" offset="100%" />
        </linearGradient>
      </defs>
      <mask id="mask">
        <rect x="0" y="0" width="100" height="100" fill="black" />
        <circle cx="50" cy="50" r="45" fill="white" />
      </mask>
      <PerkIconCircle
        stroke={props.borderColor}
        fill={props.backgroundFillColor}
      />
      <image
        href={
          // displayProperties.icon should only be undefined for Empty Catalyst Socket
          iconURL != null ? `https://www.bungie.net${iconURL}` : ''
        }
        aria-label={`${perkDef.displayProperties.name} Icon`}
        x="10"
        y="10"
        width="80"
        height="80"
      />

      {enhanced && (
        <>
          <rect
            x="0"
            y="0"
            width="100"
            height="100"
            fill="url(#mw)"
            mask="url(#mask)"
          />
          <rect
            x="5"
            y="0"
            width="6"
            height="100"
            fill="#eade8b"
            mask="url(#mask)"
          />
        </>
      )}

      {enhanced && (
        <path
          d="M5,50 l0,-24 l-6,0 l9,-16 l9,16 l-6,0 l0,24 z"
          fill="#eade8b"
        />
      )}
    </PerkIconSvg>
  )
}

function MasterworkIcon(props: {
  masterworkHash: number
  backgroundFillColor: string
  borderColor: string
}) {
  const manifest = useManifest()
  const masterworkDef =
    manifest.DestinyInventoryItemDefinition[props.masterworkHash]
  const iconURL = masterworkDef.displayProperties.icon
  return (
    <PerkIconSvg viewBox="0 0 100 100">
      <PerkIconRect
        stroke={props.borderColor}
        fill={props.backgroundFillColor}
      />

      <image
        href={`https://www.bungie.net${iconURL}`}
        aria-label={`${masterworkDef.displayProperties.name} Icon`}
        x="8"
        y="8"
        width="84"
        height="84"
      />
    </PerkIconSvg>
  )
}

function IntrinsicIcon(props: {
  intrinsicHash: number
  backgroundFillColor: string
  borderColor: string
}) {
  const manifest = useManifest()
  const intrinsicDef =
    manifest.DestinyInventoryItemDefinition[props.intrinsicHash]
  const iconURL = intrinsicDef.displayProperties.icon
  const statTypeHash = intrinsicDef.investmentStats.at(0)?.statTypeHash
  const masterworkTierTenHash =
    statTypeHash != null
      ? STAT_TYPE_MASTERWORK_TIER_TEN_HASHES[statTypeHash]
      : undefined
  const masterworkTierTenHashDef =
    masterworkTierTenHash != null
      ? manifest.DestinyInventoryItemDefinition[masterworkTierTenHash]
      : undefined
  return (
    <PerkIconSvg viewBox="0 0 100 100">
      <PerkIconRect
        stroke={props.borderColor}
        fill={props.backgroundFillColor}
      />
      {masterworkTierTenHashDef == null && (
        <image
          href={`https://www.bungie.net${iconURL}`}
          aria-label={`${intrinsicDef.displayProperties.name} Icon`}
          width="99"
          height="99"
        />
      )}
      {masterworkTierTenHashDef != null && (
        <>
          <image
            href={`https://www.bungie.net${iconURL}`}
            aria-label={`${intrinsicDef.displayProperties.name} Icon`}
            width="90"
            height="90"
          />
          <image
            href={`https://www.bungie.net${masterworkTierTenHashDef.displayProperties.icon}`}
            aria-label={`${masterworkTierTenHashDef.displayProperties.name} Icon`}
            x="50"
            y="50"
            width="46.5"
            height="46.5"
          />
        </>
      )}
    </PerkIconSvg>
  )
}

export default function Icon(props: {
  perkHash: number
  backgroundFillColor: string
  borderColor: string
  isMasterwork?: boolean
  isIntrinsic?: boolean
}) {
  if (props.isMasterwork) {
    return (
      <MasterworkIcon
        masterworkHash={props.perkHash}
        backgroundFillColor={props.backgroundFillColor}
        borderColor={props.borderColor}
      />
    )
  }
  if (props.isIntrinsic) {
    return (
      <IntrinsicIcon
        intrinsicHash={props.perkHash}
        backgroundFillColor={props.backgroundFillColor}
        borderColor={props.borderColor}
      />
    )
  }
  return (
    <PerkIcon
      perkHash={props.perkHash}
      backgroundFillColor={props.backgroundFillColor}
      borderColor={props.borderColor}
    />
  )
}

const PerkIconText = styled.text`
  dominant-baseline: middle;
  text-anchor: middle;
  fill: ${theme.white};
  font-size: 30px;
`

export function AnyIcon(props: { isLastColumn: boolean }) {
  return (
    <PerkIconSvg viewBox="0 0 100 100">
      <PerkIconText x="50%" y="50%">
        Any
      </PerkIconText>
      {props.isLastColumn ? <PerkIconRect /> : <PerkIconCircle />}
    </PerkIconSvg>
  )
}

export function MultipleIcon(props: {
  isLastColumn: boolean
  numberOfPerks: number
}) {
  return (
    <PerkIconSvg viewBox="0 0 100 100">
      <PerkIconText x="50%" y="50%">
        +{props.numberOfPerks}
      </PerkIconText>
      {props.isLastColumn ? <PerkIconRect /> : <PerkIconCircle />}
    </PerkIconSvg>
  )
}
