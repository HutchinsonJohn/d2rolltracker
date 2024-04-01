import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styled from 'styled-components'
import { faHome } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import theme, { isMobile } from '../../styles/theme'

const HomeIcon = styled(FontAwesomeIcon)`
  color: ${theme.lightGrey};
  margin: 0 8px;
  font-size: 1.5rem;

  &:hover {
    color: ${theme.white};
  }

  @media screen and not ${isMobile} {
    display: none;
  }
`

export default function HomeButton() {
  const navigate = useNavigate()
  return (
    <HomeIcon
      type="button"
      title="Home"
      icon={faHome}
      onClick={() => navigate('/')}
    />
  )
}
