import styled from 'styled-components'
import { Link } from 'react-router-dom'
import SearchBar from './SearchBar'
import RefreshButton from './RefreshButton'
import Profile from './Profile'
import { isMobile } from '../../styles/theme'

const NavbarDiv = styled.div`
  display: flex;
  justify-content: center;
  height: 50px;
  flex-direction: row;
  padding: 0 20px;

  @media screen and ${isMobile} {
    padding: 0;
  }
`

const RowDiv = styled.div`
  display: flex;
  flex-direction: row;
  flex-basis: 1400px;
  align-items: center;
  position: relative;
`

const WebsiteNameLink = styled(Link)`
  all: unset;
  cursor: pointer;
  margin: 0 8px;
  font-weight: bold;

  @media screen and ${isMobile} {
    display: none;
  }
`

export default function Navbar() {
  return (
    <NavbarDiv>
      <RowDiv>
        <WebsiteNameLink to="/">d2rolltracker</WebsiteNameLink>
        <SearchBar />
        <RefreshButton />
        <Profile />
      </RowDiv>
    </NavbarDiv>
  )
}
