import styled from 'styled-components'
import { captureException } from '@sentry/react'
import { useEffect } from 'react'
import theme, { isMobile } from '../../styles/theme'
import { isUserError } from '../../utils/error'

const FlexRowDiv = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  color: ${theme.warningRed};

  @media screen and ${isMobile} {
    flex-direction: column;
  }
`

const StatusDiv = styled.div`
  font-size: 4rem;
  align-self: flex-start;
  margin-right: 1rem;
  line-height: 1;
`

const MessageDiv = styled.div`
  font-size: 1.25rem;
  align-self: flex-end;

  @media screen and ${isMobile} {
    align-self: flex-start;
  }
`

export default function ErrorScreen(props: {
  message: string
  status?: number
  cause?: Error
}) {
  useEffect(() => {
    if (props.cause != null && !isUserError(props.cause)) {
      captureException(props.cause)
    }
  }, [props.cause])
  return (
    <div className="center">
      <div className="logo">
        d2r
        <div className="perk" />
        lltracker
      </div>
      <FlexRowDiv>
        <StatusDiv>{props.status ? props.status : 'Error'}:</StatusDiv>
        <MessageDiv>{props.message}</MessageDiv>
      </FlexRowDiv>
    </div>
  )
}
