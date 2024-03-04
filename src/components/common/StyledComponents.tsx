import styled, { keyframes } from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'
import theme from '../../styles/theme'

export const SubHeading = styled.h2`
  font-size: 2em;
  display: flex;
  flex-direction: row;
  background-color: ${theme.black70};
  padding-left: 0.5rem;
  margin: 0.5rem 0;
`

export const Button = styled.button`
  all: unset;
  color: ${theme.lightGrey};
  background-color: ${theme.black80};
  border: 2px solid ${theme.lightGrey};
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: 5px;
  margin: 2px;
  line-height: 20px;
  font-size: 1rem;
  text-align: center;

  &:hover {
    color: ${theme.white};
    border: 2px solid ${theme.white};
  }

  &:disabled {
    color: ${theme.grey};
    border: 2px solid ${theme.grey};
  }
`

export const UnstyledLink = styled(Link)`
  all: unset;
`

export const StyledLink = styled(Link)`
  all: unset;
  color: ${theme.lightGrey};
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: ${theme.white};
  }
`

export const PopoverDiv = styled.div`
  font-size: 1rem;
  background-color: ${theme.black};
  padding: 4px;
  border: 2px solid ${theme.white};
  z-index: 20;
`

export const FlexRowDiv = styled.div`
  display: flex;
  flex-direction: row;
`

export const FlexColumnDiv = styled.div`
  display: flex;
  flex-direction: column;
`

export const AlertMessageDiv = styled.div`
  font-size: 1rem;
  align-self: center;
  margin-left: 1rem;
  color: ${theme.cautionYellow};
`

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

export const RightAlignedLoadingIcon = styled(FontAwesomeIcon)<{
  spin: boolean
}>`
  margin: 0 6px 0 auto;
  font-size: 1.5rem;
  animation: ${rotate} ${(props) => (props.spin ? 'infinite' : '0')} 2.5s linear;
  align-self: center;
`

export const RightAlignedStatusIcon = styled(FontAwesomeIcon)`
  margin: 0 2px 0 auto;
  align-self: center;
  font-size: 2rem;
`
