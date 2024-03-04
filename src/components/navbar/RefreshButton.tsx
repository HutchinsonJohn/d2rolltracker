import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styled, { keyframes } from 'styled-components'
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons'
import { useIsFetching, useQueryClient } from 'react-query'
import theme from '../../styles/theme'

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const RefreshIcon = styled(FontAwesomeIcon)<{ spin: boolean }>`
  color: ${theme.lightGrey};
  margin: 0 8px;
  font-size: 1.5rem;
  animation: ${rotate} ${(props) => (props.spin ? 'infinite' : '0')} 2.5s linear;

  &:hover {
    color: ${theme.white};
  }
`

export default function RefreshButton() {
  const queryClient = useQueryClient()
  const isFetching = useIsFetching()
  return (
    <RefreshIcon
      type="button"
      title="Refresh Data"
      icon={faArrowsRotate}
      onClick={() => queryClient.invalidateQueries()}
      spin={isFetching > 0}
    />
  )
}
