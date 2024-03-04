import styled from 'styled-components'
import { useEffect } from 'react'
import { captureException } from '@sentry/react'
import theme from '../../styles/theme'
import { isUserError } from '../../utils/error'

export const ErrorMessageDiv = styled.div`
  font-size: 1rem;
  align-self: center;
  margin-left: 1rem;
  color: ${theme.warningRed};
`

export default function ErrorMessage(props: {
  message: string
  cause?: Error
}) {
  useEffect(() => {
    if (props.cause != null && !isUserError(props.cause)) {
      captureException(props.cause)
    }
  }, [props.cause])
  return <ErrorMessageDiv>{props.message}</ErrorMessageDiv>
}
