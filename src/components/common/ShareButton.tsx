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
import { Button, PopoverDiv } from './StyledComponents'

export default function ShareButton(props: {
  URL: string
  disabled?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'top',
    middleware: [offset(4), flip(), shift()],
    whileElementsMounted: autoUpdate,
  })

  const click = useClick(context)
  const dismiss = useDismiss(context)

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
  ])

  return (
    <>
      <Button
        disabled={props.disabled}
        type="button"
        ref={refs.setReference}
        {...getReferenceProps({
          onClick() {
            navigator.clipboard.writeText(props.URL)
          },
        })}
      >
        Share
      </Button>
      {isOpen && (
        <PopoverDiv
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
        >
          Copied to clipboard!
        </PopoverDiv>
      )}
    </>
  )
}
