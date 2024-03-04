import { memo } from 'react'
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons'
import { useUserGodRollsForWeaponQuery } from '../../api/queries'
import {
  useAccountUpdateTokens,
  useAccountState,
} from '../../context/AccountStateContext'
import { RightAlignedLoadingIcon, SubHeading } from '../common/StyledComponents'
import GodRollPreview from './GodRollPreview'
import { getAxiosError } from '../../utils/error'
import { useManifest } from '../../context/ManifestContext'
import ErrorIcon from '../error/ErrorIcon'

function GodRolls(props: { activeColumns: number[]; weaponHash: number }) {
  const manifest = useManifest()
  const accountState = useAccountState()
  const updateTokens = useAccountUpdateTokens()
  const godRollsQuery = useUserGodRollsForWeaponQuery(
    props.weaponHash,
    accountState,
    updateTokens,
    manifest,
  )

  if (!accountState.loggedIn) {
    return null
  }

  if (godRollsQuery.isLoading) {
    return (
      <SubHeading>
        Saved God Rolls
        <RightAlignedLoadingIcon
          title="Loading..."
          icon={faArrowsRotate}
          spin
        />
      </SubHeading>
    )
  }

  if (godRollsQuery.isError) {
    return (
      <SubHeading>
        Saved God Rolls
        <ErrorIcon {...getAxiosError(godRollsQuery.error)} />
      </SubHeading>
    )
  }

  if (godRollsQuery.data == null) {
    return (
      <SubHeading>
        Saved God Rolls
        <ErrorIcon message="Failed to load user's god rolls: The server may be down. Try again later." />
      </SubHeading>
    )
  }

  return (
    <>
      <SubHeading>
        Saved God Rolls {`(${godRollsQuery.data.length})`}
      </SubHeading>
      {godRollsQuery.data.map((roll) => (
        <GodRollPreview
          key={roll.rollId}
          activeColumns={props.activeColumns}
          rollResponse={roll}
          weaponHash={props.weaponHash}
        />
      ))}
    </>
  )
}

export default memo(GodRolls)
