import styled from 'styled-components'
import { Link } from 'react-router-dom'
import {
  useAccountLogout,
  useAccountState,
} from '../../context/AccountStateContext'
import login from '../../utils/login'
import theme from '../../styles/theme'
import Memberships from './Memberships'

const ProfileDiv = styled.div`
  font-weight: bold;
  margin: 0 8px;
  white-space: nowrap;
`

const ProfileImageContainer = styled.div`
  position: relative;
`

const ProfileImage = styled.img`
  max-width: 36px;
  min-width: 24px;
  background-size: cover;
  border: 1px ${theme.white} solid;
  box-sizing: border-box;
`

const ProfileDropdown = styled.div`
  text-align: right;
  display: none;
  flex-direction: column;
  background-color: ${theme.black};
  padding: 4px;
  position: absolute;
  z-index: 1;
  right: 0;
  top: 100%;
  white-space: nowrap;
  width: min(100vw, auto);

  ${ProfileImageContainer}:hover & {
    display: block;
  }
`

const LoginButton = styled.button`
  all: unset;
  color: ${theme.lightGrey};

  &:hover {
    color: ${theme.white};
  }
`

const SettingsButton = styled(Link)`
  all: unset;
  color: ${theme.lightGrey};

  &:hover {
    color: ${theme.white};
  }
`

export default function Profile() {
  const accountState = useAccountState()
  const logout = useAccountLogout()
  return (
    <ProfileDiv>
      {accountState.loggedIn ? (
        <ProfileImageContainer>
          <ProfileImage
            src={`https://www.bungie.net${accountState.profilePicturePath}`}
          />
          <ProfileDropdown>
            <div>Logged in as {accountState.displayName}</div>
            <Memberships />
            <SettingsButton type="button" to="/settings">
              Settings
            </SettingsButton>
            <br />
            <LoginButton type="button" onClick={() => logout()}>
              Log out
            </LoginButton>
          </ProfileDropdown>
        </ProfileImageContainer>
      ) : (
        <LoginButton onClick={login} type="button">
          Log in
        </LoginButton>
      )}
    </ProfileDiv>
  )
}
