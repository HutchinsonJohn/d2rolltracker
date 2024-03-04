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
import { useState } from 'react'
import { RollResponse } from '../../api/rolls'
import { BestRoll } from '../../utils/rolls'
import theme from '../../styles/theme'
import { PopoverDiv } from '../common/StyledComponents'

const WeaponInfoDiv = styled.div`
  background-color: ${theme.black};
  display: flex;
  flex-direction: row;
  width: max-content;
`

const WeaponInfoColumnUl = styled.ul`
  padding: 8px;
`

export default function RollInfo(props: {
  perfectRolls: {
    userRoll: BestRoll
    godRoll: RollResponse
  }[]
  bestRolls: {
    userRoll: BestRoll
    godRoll: RollResponse
  }[]
  anchor: Element | null
}) {
  const [isOpen, setIsOpen] = useState(false)

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'top-start',
    middleware: [offset(2), flip(), shift()],
    whileElementsMounted: autoUpdate,
    elements: { reference: props.anchor },
  })

  const hover = useHover(context)
  const dismiss = useDismiss(context)

  const { getFloatingProps } = useInteractions([hover, dismiss])
  return (
    <>
      {isOpen &&
        (props.perfectRolls.length > 0 || props.bestRolls.length > 0) && (
          <PopoverDiv
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
          >
            <WeaponInfoDiv>
              {props.perfectRolls.length > 0 && (
                <WeaponInfoColumnUl>
                  God roll for:
                  {props.perfectRolls.map((godRollMatch) => (
                    <li key={godRollMatch.godRoll.rollId}>
                      {godRollMatch.godRoll.rollName}
                    </li>
                  ))}
                </WeaponInfoColumnUl>
              )}
              {props.bestRolls.length > 0 && (
                <WeaponInfoColumnUl>
                  Best roll for:
                  {props.bestRolls.map((godRollMatch) => (
                    <li key={godRollMatch.godRoll.rollId}>
                      {godRollMatch.godRoll.rollName}
                    </li>
                  ))}
                </WeaponInfoColumnUl>
              )}
            </WeaponInfoDiv>
          </PopoverDiv>
        )}
    </>
  )
}
