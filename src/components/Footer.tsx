import styled from 'styled-components'
import { StyledLink } from './common/StyledComponents'

export const footerHeight = '100px'

const StyledFooter = styled.footer`
  width: 100%;
  height: ${footerHeight};
  display: flex;
  position: sticky;
  height: 100px;
  justify-content: center;
  align-items: center;
  padding: 20px;
  gap: 10px;
`

export default function Footer() {
  return (
    <StyledFooter>
      <StyledLink to="/about">About</StyledLink>
      <StyledLink to="/privacy">Privacy Policy</StyledLink>
      <StyledLink to="/cookies">Cookie Policy</StyledLink>
    </StyledFooter>
  )
}
