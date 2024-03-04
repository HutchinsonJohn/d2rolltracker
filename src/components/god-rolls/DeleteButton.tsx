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
import { useQueryClient } from 'react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, FlexRowDiv, PopoverDiv } from '../common/StyledComponents'
import { RollResponse } from '../../api/rolls'
import {
  useAccountState,
  useAccountUpdateTokens,
} from '../../context/AccountStateContext'
import { useDeleteRollMutation } from '../../api/mutations'

export default function DeleteButton(props: {
  rollResponse: RollResponse
  weaponHash: number
}) {
  const { rollId } = useParams<{ rollId: string | undefined }>()
  const accountState = useAccountState()
  const updateTokens = useAccountUpdateTokens()
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

  const queryClient = useQueryClient()

  const deleteMutation = useDeleteRollMutation(
    props.rollResponse.rollId,
    rollId,
    props.weaponHash,
    accountState,
    updateTokens,
    queryClient,
    navigate,
  )

  return (
    <>
      <Button type="button" ref={refs.setReference} {...getReferenceProps()}>
        Delete
      </Button>
      {isOpen && (
        <PopoverDiv
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
        >
          Are you sure you would like to delete this roll?
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
