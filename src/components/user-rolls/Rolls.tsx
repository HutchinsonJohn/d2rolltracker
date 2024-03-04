import { useMemo } from 'react'
import styled from 'styled-components'
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons'
import Roll from './Roll'
import { getBestRolls, BestRoll } from '../../utils/rolls'
import { useManifest } from '../../context/ManifestContext'
import {
  useUserGodRollsForWeaponQuery,
  useUserRollsQuery,
} from '../../api/queries'
import { useWeaponState } from '../../context/WeaponStateContext'
import {
  useAccountLogout,
  useAccountState,
  useAccountUpdateTokens,
} from '../../context/AccountStateContext'
import { RollResponse } from '../../api/rolls'
import {
  AlertMessageDiv,
  RightAlignedLoadingIcon,
  SubHeading,
} from '../common/StyledComponents'
import { getAxiosError } from '../../utils/error'
import ErrorIcon from '../error/ErrorIcon'

const RollsColumnLayout = styled.div`
  display: flex;
  flex-direction: column;
`

const MessageDiv = styled.div`
  margin-left: 1rem;
`

export default function Rolls(props: {
  activeColumns: number[]
  weaponHash: number
}): JSX.Element {
  const manifest = useManifest()
  const accountState = useAccountState()
  const updateTokens = useAccountUpdateTokens()
  const logout = useAccountLogout()
  const weaponState = useWeaponState()

  const godRollsQuery = useUserGodRollsForWeaponQuery(
    props.weaponHash,
    accountState,
    updateTokens,
    manifest,
  )

  const rollsQuery = useUserRollsQuery(accountState, updateTokens, logout)

  const rolls = useMemo(
    () =>
      rollsQuery.data?.allRolls.filter((i) => i.itemHash === props.weaponHash),
    [props.weaponHash, rollsQuery.data],
  )

  const bestRolls = useMemo(() => {
    if (rolls == null || rollsQuery.data == null) {
      return []
    }
    return getBestRolls(
      props.activeColumns,
      manifest.DestinyInventoryItemDefinition,
      rolls,
      rollsQuery.data,
      weaponState.preferredPerks,
    )
  }, [
    manifest,
    rolls,
    rollsQuery.data,
    weaponState.preferredPerks,
    props.activeColumns,
  ])

  // Checks that the roll(s) actually have a matching perk
  const partialMatch = useMemo(
    () =>
      bestRolls != null &&
      bestRolls.length > 0 &&
      bestRolls[0].bestColumnPerks.some((i) => i.bestColumnIndex !== Infinity),
    [bestRolls],
  )

  const userRollGodRollMatches = useMemo(() => {
    const matches: {
      userRoll: BestRoll
      godRoll: RollResponse
    }[] = []
    godRollsQuery.data?.forEach((godRoll) => {
      if (rolls == null || rollsQuery.data == null) {
        return
      }
      // User roll(s) that are the best match for the god roll
      const userRollMatches = getBestRolls(
        props.activeColumns,
        manifest.DestinyInventoryItemDefinition,
        rolls,
        rollsQuery.data,
        godRoll.columns,
      )
      // Checks that the roll(s) actually have a matching perk
      if (
        userRollMatches != null &&
        userRollMatches.length > 0 &&
        userRollMatches[0].bestColumnPerks.some(
          (i) => i.bestColumnIndex !== Infinity,
        )
      ) {
        matches.push(
          ...userRollMatches.map((userRoll) => ({
            userRoll,
            godRoll,
          })),
        )
      }
    })
    return matches
  }, [
    godRollsQuery.data,
    manifest,
    rolls,
    rollsQuery.data,
    props.activeColumns,
  ])

  if (!accountState.loggedIn) {
    return <AlertMessageDiv>Log in to see your rolls</AlertMessageDiv>
  }

  if (rollsQuery.isLoading) {
    return (
      <SubHeading>
        Your Rolls
        <RightAlignedLoadingIcon
          title="Loading..."
          icon={faArrowsRotate}
          spin
        />
      </SubHeading>
    )
  }

  if (rollsQuery.isError) {
    return (
      <SubHeading>
        Your Rolls
        <ErrorIcon {...getAxiosError(rollsQuery.error)} />
      </SubHeading>
    )
  }

  if (rollsQuery.data == null || rolls == null) {
    return (
      <SubHeading>
        Your Rolls
        <ErrorIcon message="An unknown error occurred, please try again later." />
      </SubHeading>
    )
  }

  return (
    <RollsColumnLayout>
      {partialMatch && (
        <SubHeading style={{ order: -2 }}>
          Your Best Roll
          {partialMatch &&
            bestRolls != null &&
            bestRolls.length > 1 &&
            `s (${bestRolls.length})`}
        </SubHeading>
      )}
      <SubHeading style={{ order: 0 }}>
        {partialMatch
          ? `Your Other Rolls (${rolls.length - bestRolls.length})`
          : `Your Rolls (${rolls.length})`}
      </SubHeading>
      {partialMatch && bestRolls.length === rolls.length && (
        <MessageDiv style={{ order: 1 }}>No other rolls to show</MessageDiv>
      )}
      {rolls.map((roll) => {
        if (roll.itemInstanceId == null) {
          return null
        }
        return (
          <Roll
            key={roll.itemInstanceId}
            isBestRoll={
              partialMatch &&
              bestRolls.find(
                (bestRoll) => bestRoll.itemInstanceId === roll.itemInstanceId,
              ) != null
            }
            activeColumns={props.activeColumns}
            roll={roll}
            reusablePlugsInstance={
              rollsQuery.data.reusablePlugsInstances[roll.itemInstanceId]
            }
            socketsInstance={
              rollsQuery.data.socketsInstances[roll.itemInstanceId]
            }
            weaponHash={props.weaponHash}
            godRollMatches={userRollGodRollMatches.filter(
              (userRollGodRoll) =>
                userRollGodRoll.userRoll.itemInstanceId === roll.itemInstanceId,
            )}
          />
        )
      })}
    </RollsColumnLayout>
  )
}
