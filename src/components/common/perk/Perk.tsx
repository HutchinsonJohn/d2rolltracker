import { useState, memo, useCallback } from 'react'
import styled from 'styled-components'
import { useWeaponDispatch } from '../../../context/WeaponStateContext'
import Icon, { AnyIcon, MultipleIcon } from './Icon'
import Details, { SimpleDetails } from './Details'
import PerkIndex, { PerkDiv } from './PerkIndex'

const PerkIconContainer = styled.button<{ isRetired?: boolean }>`
  all: unset;
  aspect-ratio: 1/1;
  display: flex;
  justify-content: center;
  align-items: center;
  ${(props) => props.isRetired && 'filter: brightness(0.6);'}

  :hover {
    filter: ${(props) =>
      props.isRetired ? 'brightness(0.7)' : 'brightness(1.2)'};
  }
`

export const Perk = memo(
  (props: {
    index: number
    sortedIndex?: number
    backgroundFillColor: string
    borderColor: string
    perkHash: number
    weaponHash: number
    isMasterwork?: boolean
    isIntrinsic?: boolean
    isRetired?: boolean
    perkOnClick?: () => void
    setPerkIndex?: (perkIndex: number) => void
  }) => {
    const [anchor, setAnchor] = useState<Element | null>(null)

    return (
      <PerkDiv sortedIndex={props.sortedIndex}>
        <PerkIconContainer
          isRetired={props.perkOnClick && props.isRetired}
          ref={setAnchor}
          onClick={props.perkOnClick ? props.perkOnClick : () => {}}
          type="button"
        >
          <Icon
            perkHash={props.perkHash}
            backgroundFillColor={props.backgroundFillColor}
            borderColor={props.borderColor}
            isMasterwork={props.isMasterwork}
            isIntrinsic={props.isIntrinsic}
          />
        </PerkIconContainer>
        <Details
          anchor={anchor}
          isMasterwork={props.isMasterwork}
          isIntrinsic={props.isIntrinsic}
          perkHash={props.perkHash}
          weaponHash={props.weaponHash}
          isIndexOpen={
            props.setPerkIndex != null &&
            props.backgroundFillColor !== 'rgba(0,0,0,0)'
          }
          isRetired={props.isRetired}
        />
        <PerkIndex
          backgroundFillColor={props.backgroundFillColor}
          perkIndex={props.index}
          setPerkIndex={props.setPerkIndex}
        />
      </PerkDiv>
    )
  },
)

export const WeaponPerk = memo(
  (props: {
    column: number
    index: number
    sortedIndex?: number
    backgroundFillColor: string
    borderColor: string
    perkHash: number
    weaponHash: number
    isMasterwork?: boolean
    isIntrinsic?: boolean
    isRetired?: boolean
  }) => {
    const weaponDispatch = useWeaponDispatch()
    const perkOnClick = useCallback(() => {
      weaponDispatch({
        type: 'PERK_ONCLICK',
        perkHash: props.perkHash,
        column: props.column,
      })
    }, [props.column, props.perkHash, weaponDispatch])
    const setPerkIndex = useCallback(
      (index: number) => {
        weaponDispatch({
          type: 'SET_PERK_INDEX',
          index,
          perkHash: props.perkHash,
          column: props.column,
        })
      },
      [props.column, props.perkHash, weaponDispatch],
    )
    return (
      <Perk
        index={props.index}
        sortedIndex={props.sortedIndex}
        backgroundFillColor={props.backgroundFillColor}
        borderColor={props.borderColor}
        perkHash={props.perkHash}
        weaponHash={props.weaponHash}
        isMasterwork={props.isMasterwork}
        isIntrinsic={props.isIntrinsic}
        isRetired={props.isRetired}
        perkOnClick={perkOnClick}
        setPerkIndex={setPerkIndex}
      />
    )
  },
)

export const AnyPerk = memo((props: { isLastColumn: boolean }) => {
  const [anchor, setAnchor] = useState<Element | null>(null)

  return (
    <PerkDiv>
      <PerkIconContainer ref={setAnchor} type="button">
        <AnyIcon isLastColumn={props.isLastColumn} />
      </PerkIconContainer>
      <SimpleDetails anchor={anchor}>
        No preferred perks specified
      </SimpleDetails>
    </PerkDiv>
  )
})

export const MultiplePerks = memo(
  (props: { numberOfPerks: number; isLastColumn: boolean }) => {
    const [anchor, setAnchor] = useState<Element | null>(null)

    return (
      <PerkDiv>
        <PerkIconContainer ref={setAnchor} type="button">
          <MultipleIcon
            isLastColumn={props.isLastColumn}
            numberOfPerks={props.numberOfPerks}
          />
          <SimpleDetails anchor={anchor}>
            {props.numberOfPerks} more best perks specified
          </SimpleDetails>
        </PerkIconContainer>
      </PerkDiv>
    )
  },
)
