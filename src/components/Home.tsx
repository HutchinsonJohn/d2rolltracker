import styled from 'styled-components'
import { times } from 'lodash'
import {
  useAccountLogout,
  useAccountState,
  useAccountUpdateTokens,
} from '../context/AccountStateContext'
import { useUserRollsQuery } from '../api/queries'
import { AlertMessageDiv, FlexColumnDiv } from './common/StyledComponents'
import { getAxiosError } from '../utils/error'
import CharacterInventory, {
  SkeletonInventory,
} from './common/CharacterInventory'
import ErrorMessage from './error/ErrorMessage'
import { isMobile } from '../styles/theme'

const OuterGridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 410px);
  grid-gap: 30px;
  margin: 10px;

  @media screen and ${isMobile} {
    grid-template-columns: repeat(1, 100vw);
  }
`

const FlexColumnCenterDiv = styled(FlexColumnDiv)`
  align-items: center;
  text-align: center;
`

export default function Home() {
  const accountState = useAccountState()
  const updateTokens = useAccountUpdateTokens()
  const logout = useAccountLogout()
  const rollsQuery = useUserRollsQuery(accountState, updateTokens, logout)

  if (!accountState.loggedIn) {
    // TODO: Improve this message
    return <AlertMessageDiv>Log in to see your rolls</AlertMessageDiv>
  }

  if (rollsQuery.isLoading) {
    return (
      <FlexColumnCenterDiv>
        <div>Loading...</div>
        <OuterGridContainer>
          {times(3, (n) => (
            <SkeletonInventory key={n} />
          ))}
        </OuterGridContainer>
      </FlexColumnCenterDiv>
    )
  }

  if (rollsQuery.isError) {
    return (
      <FlexColumnCenterDiv>
        <ErrorMessage {...getAxiosError(rollsQuery.error)} />
      </FlexColumnCenterDiv>
    )
  }

  if (rollsQuery.data == null || rollsQuery.data.characterInventories == null) {
    return (
      <FlexColumnCenterDiv>
        <ErrorMessage
          message="An unknown error occurred, please try again later."
          cause={Error(
            'rollsQuery.data or rollsQuery.data.characterInventories is undefined.',
          )}
        />
      </FlexColumnCenterDiv>
    )
  }

  return (
    <FlexColumnCenterDiv>
      <div>
        Choose a weapon from your inventory or use the search bar above to get
        started.
      </div>
      <OuterGridContainer>
        {Object.entries(rollsQuery.data.characterInventories).map(
          ([key, inventory]) => (
            <CharacterInventory
              inventory={inventory}
              equipment={rollsQuery.data.characterEquipment[key]}
              key={key}
            />
          ),
        )}
      </OuterGridContainer>
    </FlexColumnCenterDiv>
  )
}
