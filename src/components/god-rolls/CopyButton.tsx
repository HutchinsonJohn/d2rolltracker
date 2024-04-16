import { useEffect, useState } from 'react'
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
import { useNavigate } from 'react-router-dom'
import { Button, FlexRowDiv, PopoverDiv } from '../common/StyledComponents'
import { RollResponse } from '../../api/rolls'
import {
  useAccountState,
  useAccountUpdateTokens,
} from '../../context/AccountStateContext'
import { useSaveRollMutation } from '../../api/mutations'
import { useUserListsQuery } from '../../api/queries'
import { ListResponse } from '../../api/lists'

export default function CopyButton(props: {
  rollResponse: RollResponse
  weaponHash: number
}) {
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

  const [selectedList, setSelectedList] = useState<ListResponse | undefined>()

  const listsQuery = useUserListsQuery(accountState, updateTokens)

  useEffect(() => {
    setSelectedList(listsQuery.data?.find((list) => list.isPrivate))
  }, [listsQuery.data])

  const copyMutation = useSaveRollMutation(
    undefined,
    props.weaponHash,
    selectedList?.listId,
    accountState,
    updateTokens,
    `${props.rollResponse.rollName} (Copy)`,
    props.rollResponse.columns,
    queryClient,
    navigate,
  )

  return (
    <>
      <Button type="button" ref={refs.setReference} {...getReferenceProps()}>
        Copy
      </Button>
      {isOpen && (
        <PopoverDiv
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
        >
          Are you sure you would like to make a copy of this roll?
          <FlexRowDiv>
            <Button
              type="button"
              onClick={() => {
                copyMutation.mutate()
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
