import styled from 'styled-components'
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useDismiss,
  useFloating,
  useHover,
  useInteractions,
} from '@floating-ui/react'
import { Fragment, memo, useState } from 'react'
import { groupBy, sumBy } from 'lodash'
import theme, { isMobile } from '../../../styles/theme'
import { interpolateStat } from '../../../utils/perks'
import { useManifest } from '../../../context/ManifestContext'
import ADEPT_WEAPONS from '../../../data/adeptWeapons'
import ErrorMessage from '../../error/ErrorMessage'

const PerkDetailsDiv = styled.div`
  background-color: ${theme.black};
  padding: 10px;
  z-index: 2;
  border: 2px solid ${theme.white};
  width: min(400%, 300px, 40vw);
`

const PerkNameH4 = styled.h4`
  margin: 0.25rem 0;
`

const PerkRetiredDiv = styled.div`
  color: ${theme.cautionYellow};
  margin: 0.25rem 0;
`

const PerkDescriptionDiv = styled.div`
  white-space: pre-line;
  margin: 0.25rem 0;
`

const PerkStatListUl = styled.ul`
  list-style-type: none;
  padding: 0;
`

const PerkStatLi = styled.li`
  padding: 0;
  display: grid;
  grid-template-columns: 3rem 1fr;
  align-items: center;
  grid-column-gap: 0.4em;
  margin: 0.25rem 0;
  max-width: 700px;

  @media screen and not ${isMobile} {
    max-width: 30vw;
  }
`

const PerkStatValueDiv = styled.div`
  text-align: right;
`

function PerkDetails(props: {
  weaponHash: number
  perkHash: number
  isRetired?: boolean
}) {
  const manifest = useManifest()
  const weaponDef = manifest.DestinyInventoryItemDefinition[props.weaponHash]
  const perkDef = manifest.DestinyInventoryItemDefinition[props.perkHash]
  const statGroupHash = weaponDef.stats?.statGroupHash
  if (statGroupHash == null) {
    return (
      <ErrorMessage message="Something went wrong while trying to display perk details: Weapon definition did not contain a statGroupHash." />
    )
  }

  // This is useful for perks that have multiple definitions for the same stat,
  // such as Enhanced Elemental Capacitor
  const summedStatDefs = Object.values(
    groupBy(perkDef.investmentStats, (statDef) => statDef.statTypeHash),
  ).map((statDefs) => ({
    statTypeHash: statDefs[0].statTypeHash,
    value: sumBy(statDefs, (statDef) => statDef.value),
  }))

  return (
    <>
      <PerkNameH4>{perkDef.displayProperties.name}</PerkNameH4>
      {props.isRetired && (
        <PerkRetiredDiv>
          This perk no longer rolls on this weapon
        </PerkRetiredDiv>
      )}
      <PerkDescriptionDiv>
        {perkDef.displayProperties.description}
      </PerkDescriptionDiv>
      <PerkStatListUl>
        {summedStatDefs.map((statDef) => {
          const baseStat = weaponDef.investmentStats.find(
            (s) => s.statTypeHash === statDef.statTypeHash,
          )

          if (baseStat == null) {
            return null
          }

          const statDisplay = manifest.DestinyStatGroupDefinition[
            statGroupHash
          ].scaledStats.find(
            (scaledStat) => scaledStat.statHash === statDef.statTypeHash,
          )

          const statValue =
            statDisplay == null
              ? statDef.value
              : interpolateStat(baseStat.value + statDef.value, statDisplay) -
                interpolateStat(baseStat.value, statDisplay)

          return (
            <PerkStatLi key={statDef.statTypeHash}>
              <PerkStatValueDiv>{`${
                (statValue >= 0 ? '+' : '') + statValue
              }`}</PerkStatValueDiv>
              <div>{`${
                manifest.DestinyStatDefinition[statDef.statTypeHash]
                  .displayProperties.name
              }`}</div>
            </PerkStatLi>
          )
        })}
      </PerkStatListUl>
    </>
  )
}

function MasterworkDetails(props: {
  weaponHash: number
  masterworkHash: number
}) {
  const manifest = useManifest()
  const weaponDef = manifest.DestinyInventoryItemDefinition[props.weaponHash]
  const masterworkDef =
    manifest.DestinyInventoryItemDefinition[props.masterworkHash]
  const statGroupHash = weaponDef.stats?.statGroupHash
  if (statGroupHash == null) {
    return (
      <ErrorMessage message="Something went wrong while trying to display perk details: Weapon definition did not contain a statGroupHash." />
    )
  }
  return (
    <>
      <PerkNameH4>{masterworkDef.displayProperties.name}</PerkNameH4>
      <PerkStatListUl>
        {masterworkDef.investmentStats.map((statDef) => {
          const baseStat = weaponDef.investmentStats.find(
            (s) => s.statTypeHash === statDef.statTypeHash,
          )

          if (baseStat == null) {
            return null
          }

          const statDisplay = manifest.DestinyStatGroupDefinition[
            statGroupHash
          ].scaledStats.find(
            (scaledStat) => scaledStat.statHash === statDef.statTypeHash,
          )

          const statValue =
            statDisplay == null
              ? statDef.value
              : interpolateStat(baseStat.value + statDef.value, statDisplay) -
                interpolateStat(baseStat.value, statDisplay)

          return (
            baseStat != null &&
            statDisplay != null &&
            (!statDef.isConditionallyActive ||
              ADEPT_WEAPONS.some((adeptString) =>
                weaponDef.displayProperties.name.includes(adeptString),
              )) && (
              <PerkStatLi key={statDef.statTypeHash}>
                <PerkStatValueDiv>
                  {`${(statValue >= 0 ? '+' : '') + statValue}`}
                </PerkStatValueDiv>
                {
                  manifest.DestinyStatDefinition[statDef.statTypeHash]
                    .displayProperties.name
                }
              </PerkStatLi>
            )
          )
        })}
      </PerkStatListUl>
    </>
  )
}

function IntrinsicDetails(props: {
  weaponHash: number
  intrinsicHash: number
}) {
  const manifest = useManifest()
  const weaponDef = manifest.DestinyInventoryItemDefinition[props.weaponHash]
  const intrinsicDef =
    manifest.DestinyInventoryItemDefinition[props.intrinsicHash]
  const statGroupHash = weaponDef.stats?.statGroupHash
  if (statGroupHash == null) {
    return (
      <ErrorMessage message="Something went wrong while trying to display perk details: Weapon definition did not contain a statGroupHash." />
    )
  }
  return (
    <>
      <PerkNameH4>{`${
        intrinsicDef.investmentStats.length > 0
          ? `${
              manifest.DestinyStatDefinition[
                intrinsicDef.investmentStats[0].statTypeHash
              ].displayProperties.name
            } `
          : ''
      }Intrinsic ${intrinsicDef.displayProperties.name}`}</PerkNameH4>
      <PerkStatListUl>
        {intrinsicDef.investmentStats.map((statDef, i) => {
          const baseStat = weaponDef.investmentStats.find(
            (s) => s.statTypeHash === statDef.statTypeHash,
          )

          if (baseStat == null) {
            return null
          }

          const statDisplay = manifest.DestinyStatGroupDefinition[
            statGroupHash
          ].scaledStats.find(
            (scaledStat) => scaledStat.statHash === statDef.statTypeHash,
          )

          const statValue =
            statDisplay == null
              ? statDef.value
              : interpolateStat(baseStat.value + statDef.value, statDisplay) -
                interpolateStat(baseStat.value, statDisplay)

          return (
            baseStat != null &&
            statDisplay != null && (
              <Fragment key={statDef.statTypeHash}>
                <PerkStatLi>
                  <PerkStatValueDiv>
                    {`${(statValue >= 0 ? '+' : '') + statValue}`}
                  </PerkStatValueDiv>
                  {
                    manifest.DestinyStatDefinition[statDef.statTypeHash]
                      .displayProperties.name
                  }
                </PerkStatLi>
                {i === 0 && (
                  <>
                    This weapon will earn an additional minor stat boost at
                    Level 20
                  </>
                )}
              </Fragment>
            )
          )
        })}
      </PerkStatListUl>
    </>
  )
}

export default memo(
  (props: {
    weaponHash: number
    perkHash: number
    isMasterwork?: boolean
    isIntrinsic?: boolean
    anchor: Element | null
    isIndexOpen?: boolean
    isRetired?: boolean
  }) => {
    const [isOpen, setIsOpen] = useState(false)

    const { refs, floatingStyles, context } = useFloating({
      open: isOpen,
      onOpenChange: setIsOpen,
      placement: 'right-start',
      middleware: [
        {
          ...offset(({ x }) => {
            if (props.isIndexOpen && x > 0) {
              return 27
            }
            return 2
          }),
          options: props.isIndexOpen,
        },
        flip(),
        shift(),
      ],
      whileElementsMounted: autoUpdate,
      elements: { reference: props.anchor },
    })

    const hover = useHover(context)
    const dismiss = useDismiss(context)

    const { getFloatingProps } = useInteractions([hover, dismiss])

    return (
      <>
        {isOpen && (
          <PerkDetailsDiv
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
          >
            {props.isMasterwork && (
              <MasterworkDetails
                weaponHash={props.weaponHash}
                masterworkHash={props.perkHash}
              />
            )}
            {props.isIntrinsic && (
              <IntrinsicDetails
                weaponHash={props.weaponHash}
                intrinsicHash={props.perkHash}
              />
            )}
            {!props.isMasterwork && !props.isIntrinsic && (
              <PerkDetails
                weaponHash={props.weaponHash}
                perkHash={props.perkHash}
                isRetired={props.isRetired}
              />
            )}
          </PerkDetailsDiv>
        )}
      </>
    )
  },
)

export function SimpleDetails(props: {
  anchor: Element | null
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'right-start',
    middleware: [offset(2), flip(), shift()],
    whileElementsMounted: autoUpdate,
    elements: { reference: props.anchor },
  })

  const hover = useHover(context)
  const dismiss = useDismiss(context)

  const { getFloatingProps } = useInteractions([hover, dismiss])

  return (
    <>
      {isOpen && (
        <PerkDetailsDiv
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
        >
          {props.children}
        </PerkDetailsDiv>
      )}
    </>
  )
}
