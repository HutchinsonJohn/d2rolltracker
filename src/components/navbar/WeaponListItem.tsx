import styled from 'styled-components'
import { DestinyInventoryItemDefinition } from 'bungie-api-ts/destiny2'
import { memo } from 'react'
import WeaponIcon from '../common/WeaponIcon'
import theme from '../../styles/theme'
import { UnstyledLink } from '../common/StyledComponents'

const WeaponListItemDiv = styled.div<{ $hover: boolean }>`
  all: unset;
  cursor: pointer;
  text-decoration: none;
  box-sizing: content-box;
  color: ${theme.lightGrey};
  display: flex;
  height: 50px;
  border: 1px solid ${theme.lightGrey};
  text-align: left;
  align-items: center;
  font-size: 1em;
  padding: 0;
  margin: 4px 2px;

  &:hover,
  &:focus {
    color: ${theme.lightGrey};
  }
  ${(props) =>
    props.$hover &&
    `outline: ${theme.white} 1px solid;
    border-color: ${theme.white};
    color: ${theme.white};
    filter: brightness(1.2);`}
`

const WeaponName = styled.div`
  padding: 8px;
`

function WeaponListItem(props: {
  weaponDef: DestinyInventoryItemDefinition
  setSearchValue: (value: string) => void
  handleMouseEnter: (e: React.MouseEvent<HTMLDivElement>) => void
  handleMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => void
  isHover: boolean
  i: number
}) {
  return (
    <UnstyledLink to={`/w/${props.weaponDef.hash}`}>
      <WeaponListItemDiv
        onClick={() => props.setSearchValue('')}
        onMouseEnter={props.handleMouseEnter}
        onMouseLeave={props.handleMouseLeave}
        tabIndex={-1}
        $hover={props.isHover}
        id={props.i.toString()}
      >
        <WeaponIcon weaponHash={props.weaponDef.hash} />
        <WeaponName>{props.weaponDef.displayProperties.name}</WeaponName>
      </WeaponListItemDiv>
    </UnstyledLink>
  )
}

export default memo(WeaponListItem)
