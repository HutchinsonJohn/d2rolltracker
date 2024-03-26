import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowDown19,
  faMagnifyingGlass,
  faPlus,
} from '@fortawesome/free-solid-svg-icons'
import { memo } from 'react'
import theme from '../../styles/theme'
import { PerkModifiers, WeaponDispatch } from '../../context/WeaponStateContext'

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

function Modifiers(props: {
  selectedModifier: PerkModifiers
  index: number
  weaponDispatch: WeaponDispatch
}) {
  return (
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
  )
}

export default memo(Modifiers)
