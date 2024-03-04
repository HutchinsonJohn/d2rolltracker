import styled from 'styled-components'
import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import LastColumn from './LastColumn'
import { useManifest } from '../../context/ManifestContext'
import SaveRoll from './SaveRoll'
import PerkColumn from './PerkColumn'
import { Button, SubHeading } from '../common/StyledComponents'
import {
  useAccountState,
  useAccountUpdateTokens,
} from '../../context/AccountStateContext'
import { useGodRollQuery } from '../../api/queries'
import { isMobile } from '../../styles/theme'

const PerkColumnLayout = styled.div`
  display: flex;
  justify-content: flex-start;
  margin: 0 16px;

  @media screen and ${isMobile} {
    max-width: 100vw;
    justify-content: space-evenly;
  }
`

function CreateARoll(props: {
  weaponHash: number
  isWeaponStatic: boolean
  rollId: string | undefined
}) {
  const manifest = useManifest()
  const accountState = useAccountState()
  const updateTokens = useAccountUpdateTokens()
  const navigate = useNavigate()
  const rollQuery = useGodRollQuery(
    props.rollId,
    accountState,
    updateTokens,
    manifest,
  )

  const weaponDef = manifest.DestinyInventoryItemDefinition[props.weaponHash]

  const rollBelongsToUser =
    rollQuery.data?.createdBy.bungieMembershipId ===
    accountState.bungieMembershipId

  return (
    <>
      {props.isWeaponStatic ? (
        <>
          <SubHeading>Preview Weapon Stats</SubHeading>Weapon does not have
          random rolls
        </>
      ) : (
        <>
          <SubHeading>
            Create A Roll {' — '}
            {rollQuery.data == null && 'New Roll'}
            {rollQuery.data != null && rollBelongsToUser && (
              <>
                Editing &quot;{rollQuery.data?.rollName}&quot;
                <Button
                  style={{ marginLeft: 'auto' }}
                  onClick={() => navigate(`/w/${props.weaponHash}`)}
                >
                  Create New Roll
                </Button>
              </>
            )}
            {rollQuery.data != null &&
              !rollBelongsToUser &&
              `Editing a copy of "${rollQuery.data?.rollName}"`}
          </SubHeading>
          <SaveRoll
            weaponHash={props.weaponHash}
            rollId={rollBelongsToUser ? props.rollId : undefined}
          />
        </>
      )}
      <PerkColumnLayout>
        {weaponDef.sockets?.socketEntries.map((socketEntryDef, column) => (
          <PerkColumn
            // eslint-disable-next-line react/no-array-index-key
            key={column}
            socketEntryDef={socketEntryDef}
            column={column}
            weaponHash={props.weaponHash}
          />
        ))}
        <LastColumn weaponHash={props.weaponHash} />
      </PerkColumnLayout>
    </>
  )
}

export default memo(CreateARoll)
