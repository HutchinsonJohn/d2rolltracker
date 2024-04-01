import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import {
  autoUpdate,
  useDismiss,
  useFloating,
  useHover,
  useInteractions,
} from '@floating-ui/react'
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

  &:hover {
    filter: brightness(1.2);
  }
`

const ProfileDropdownDiv = styled.div`
  text-align: right;
  flex-direction: column;
  background-color: ${theme.black};
  padding: 4px;
  z-index: 1;
  white-space: nowrap;
  width: min(100vw, auto);
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

function ProfileDropdown(props: { anchor: Element | null }) {
  const accountState = useAccountState()
  const logout = useAccountLogout()

  const [isOpen, setIsOpen] = useState(false)

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom-end',
    whileElementsMounted: autoUpdate,
    elements: { reference: props.anchor },
  })

  const click = useHover(context)
  const dismiss = useDismiss(context)

  const { getFloatingProps } = useInteractions([click, dismiss])

  return (
    <>
      {isOpen && (
        <ProfileDropdownDiv
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
        >
          <div>Logged in as {accountState.displayName}</div>
          <Memberships />
          <SettingsButton type="button" to="/settings">
            Settings
          </SettingsButton>
          <br />
          <LoginButton type="button" onClick={() => logout()}>
            Log out
          </LoginButton>
        </ProfileDropdownDiv>
      )}
    </>
  )
}

export default function Profile() {
  const accountState = useAccountState()
  const [anchor, setAnchor] = useState<Element | null>(null)
  return (
    <ProfileDiv>
      {accountState.loggedIn ? (
        <ProfileImageContainer ref={setAnchor}>
          <ProfileImage
            src={`https://www.bungie.net${accountState.profilePicturePath}`}
          />
          <ProfileDropdown anchor={anchor} />
        </ProfileImageContainer>
      ) : (
        <LoginButton onClick={login} type="button">
          Log in
        </LoginButton>
      )}
    </ProfileDiv>
  )
}
