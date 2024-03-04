import styled from 'styled-components'
import theme from '../../../styles/theme'

const PerkIndexDiv = styled.div<{ backgroundFillColor: string }>`
  box-sizing: border-box;
  position: absolute;
  width: 25px;
  height: 25px;
  right: 0%;
  top: 0%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1em;
  font-weight: bold;
  z-index: 1;
  user-select: none;
  border: 1px solid ${theme.white};
  background-color: ${(props) => props.backgroundFillColor};
`

export const PerkDiv = styled.div<{ sortedIndex?: number }>`
  position: relative;
  order: ${(props) => props.sortedIndex};

  padding-bottom: 8px;
`

const ModifyPerkIndexDiv = styled.button<{
  isIncrement?: boolean
  backgroundFillColor: string
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
  background-color: ${(props) => props.backgroundFillColor};
  border: 1px solid ${theme.white};

  &:hover {
    filter: brightness(1.2);
  }

  ${PerkDiv}:hover & {
    opacity: 1;
  }
`

export default function PerkIndex(props: {
  perkIndex: number
  backgroundFillColor: string
  setPerkIndex?: (perkIndex: number) => void
}) {
  return (
    <>
      {props.perkIndex !== -1 && (
        <PerkIndexDiv backgroundFillColor={props.backgroundFillColor}>
          {props.setPerkIndex != null && (
            <ModifyPerkIndexDiv
              backgroundFillColor={props.backgroundFillColor}
              onClick={() =>
                props.setPerkIndex != null
                  ? props.setPerkIndex(props.perkIndex - 1)
                  : {}
              }
            >
              -
            </ModifyPerkIndexDiv>
          )}
          <>{props.perkIndex + 1}</>
          {props.setPerkIndex != null && (
            <ModifyPerkIndexDiv
              isIncrement
              backgroundFillColor={props.backgroundFillColor}
              onClick={() =>
                props.setPerkIndex != null
                  ? props.setPerkIndex(props.perkIndex + 1)
                  : {}
              }
            >
              +
            </ModifyPerkIndexDiv>
          )}
        </PerkIndexDiv>
      )}
    </>
  )
}
