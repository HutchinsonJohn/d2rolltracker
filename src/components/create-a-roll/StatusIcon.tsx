import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleCheck,
  faCircleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import styled from 'styled-components'
import { useState } from 'react'
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useHover,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react'
import theme from '../../styles/theme'
import { PopoverDiv } from '../common/StyledComponents'

const StatusFontAwesomeIcon = styled(FontAwesomeIcon)`
  margin: 0 0 0 6px;
  align-self: center;
`

export default function StatusIcon(props: {
  perksEqual: boolean
  unsavedChanges: boolean
  errorMessage: string | undefined
  isSuccess: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'top',
    middleware: [offset(4), flip(), shift()],
    whileElementsMounted: autoUpdate,
  })

  const hover = useHover(context)
  const dismiss = useDismiss(context)

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    dismiss,
  ])

  if (
    props.errorMessage == null &&
    !(props.perksEqual && props.isSuccess) &&
    !props.unsavedChanges
  ) {
    return null
  }

  let icon = faCircleCheck
  let color = theme.white
  let message = 'Your changes are saved!'
  if (props.errorMessage) {
    icon = faCircleExclamation
    color = theme.warningRed
    message = props.errorMessage
  } else if (props.unsavedChanges) {
    icon = faCircleExclamation
    color = theme.cautionYellow
    message = 'You have unsaved changes'
  }

  return (
    <>
      <StatusFontAwesomeIcon
        icon={icon}
        color={color}
        fontSize="2rem"
        ref={refs.setReference}
        {...getReferenceProps()}
      />
      {isOpen && (
        <PopoverDiv
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
        >
          {message}
        </PopoverDiv>
      )}
    </>
  )
}
