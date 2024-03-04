import styled from 'styled-components'
import { useState } from 'react'
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react'
import { useNavigate } from 'react-router-dom'
import {
  useAccountLogout,
  useAccountState,
} from '../context/AccountStateContext'
import { useDeleteUserMutation } from '../api/mutations'
import { Button, FlexRowDiv, PopoverDiv } from './common/StyledComponents'

const SettingsContainer = styled.div`
  max-width: 800px;
  margin: auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`

export const RedButton = styled(Button)`
  color: red;
  border: 2px solid red;

  &:hover {
    color: red;
    border: 2px solid red;
    filter: brightness(2);
  }
`

function DeleteButton() {
  const accountState = useAccountState()
  const accountLogout = useAccountLogout()
  const navigate = useNavigate()

  const [isOpen, setIsOpen] = useState(false)

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'right-start',
    middleware: [
      offset(4),
      flip({
        fallbackAxisSideDirection: 'end',
      }),
      shift(),
    ],
    whileElementsMounted: autoUpdate,
  })

  const click = useClick(context)
  const dismiss = useDismiss(context)

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
  ])

  const deleteMutation = useDeleteUserMutation(
    accountState,
    accountLogout,
    navigate,
  )

  return (
    <>
      <RedButton type="button" ref={refs.setReference} {...getReferenceProps()}>
        Delete all user data
      </RedButton>
      {isOpen && (
        <PopoverDiv
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
        >
          Are you sure you would like to delete all information related to your
          account?
          <FlexRowDiv>
            <Button
              type="button"
              onClick={() => {
                deleteMutation.mutate()
              }}
            >
              Yes
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIsOpen(false)
              }}
            >
              No
            </Button>
          </FlexRowDiv>
        </PopoverDiv>
      )}
    </>
  )
}

export default function UserSettings() {
  return (
    <SettingsContainer>
      {/* <div>User Lists:</div>
      <div>rename, delete </div> */}

      {/* <div>Subscribed Lists: </div>
      <div>remove </div> */}
      <h2>Delete User Data</h2>
      <div>
        All user data, created rolls, and lists of rolls will be deleted
      </div>
      <div>
        This is irreversible but a new account can be created with the same
        bungie account at any time
      </div>
      <DeleteButton />
    </SettingsContainer>
  )
}
