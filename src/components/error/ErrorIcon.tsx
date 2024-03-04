import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons'
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
import { useEffect, useState } from 'react'
import { captureException } from '@sentry/react'
import { PopoverDiv, RightAlignedStatusIcon } from '../common/StyledComponents'
import theme from '../../styles/theme'
import { isUserError } from '../../utils/error'

export default function ErrorIcon(props: { message: string; cause?: Error }) {
  useEffect(() => {
    if (props.cause != null && !isUserError(props.cause)) {
      captureException(props.cause)
    }
  }, [props.cause])

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

  return (
    <>
      <RightAlignedStatusIcon
        icon={faCircleExclamation}
        color={theme.warningRed}
        ref={refs.setReference}
        {...getReferenceProps()}
      />
      {isOpen && (
        <PopoverDiv
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
        >
          {props.message}
        </PopoverDiv>
      )}
    </>
  )
}
