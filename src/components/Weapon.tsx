import { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useImmerReducer } from 'use-immer'
import styled from 'styled-components'
import { captureMessage } from '@sentry/react'
import Rolls from './user-rolls/Rolls'
import WeaponPreview from './WeaponPreview'
import CreateARoll from './create-a-roll/CreateARoll'
import GodRolls from './god-rolls/GodRolls'
import {
  MASTERWORK_TYPE_HASH,
  TRACKER_TYPE_HASH,
  WEAPON_PERK_CATEGORY_HASH,
} from '../data/sockets'
import { useGodRollQuery } from '../api/queries'
import { useManifest } from '../context/ManifestContext'
import WeaponStateProvider, {
  initialWeaponState,
  weaponReducer,
} from '../context/WeaponStateContext'
import {
  useAccountUpdateTokens,
  useAccountState,
} from '../context/AccountStateContext'
import LoadingScreen from './LoadingScreen'
import { getAxiosError } from '../utils/error'
import ErrorScreen from './error/ErrorScreen'
import { isMobile } from '../styles/theme'

const WeaponLayoutGrid = styled.div`
  display: grid;
  position: relative;
  box-sizing: border-box;
  margin: 10px auto;
  grid-template-columns: min(calc(50vw - 43.5px), 685px) min(
      calc(50vw - 43.5px),
      685px
    );
  column-gap: 30px;
  width: min-content;

  @media screen and ${isMobile} {
    grid-template-columns: 1fr;
    margin: 5px;
    width: auto;
  }
`

const CreateARollDiv = styled.div`
  grid-column: 2;
  grid-row: 1 / 5;
  order: 2;

  @media screen and ${isMobile} {
    grid-column: 1;
    grid-row: 2;
  }
`

const WeaponPreviewDiv = styled.div`
  order: 1;

  @media screen and ${isMobile} {
  }
`

const UserRollsDiv = styled.div`
  order: 3;

  @media screen and ${isMobile} {
    max-width: initial;
  }
`

const GodRollsDiv = styled.div`
  grid-column: 1;
  order: 4;

  @media screen and ${isMobile} {
    max-width: initial;
  }
`

export default function Weapon(): JSX.Element {
  const manifest = useManifest()
  const accountState = useAccountState()
  const updateTokens = useAccountUpdateTokens()
  const { hash, rollId } = useParams<{
    hash: string | undefined
    rollId: string | undefined
  }>()

  const [weaponState, weaponDispatch] = useImmerReducer(
    weaponReducer,
    initialWeaponState,
  )

  const rollQuery = useGodRollQuery(
    rollId,
    accountState,
    updateTokens,
    manifest,
  )

  useEffect(() => {
    if (rollQuery.data == null) {
      weaponDispatch({ type: 'RESET' })
    } else {
      weaponDispatch({
        type: 'SET_ROLL',
        rollName: rollQuery.data.rollName,
        preferredPerks: rollQuery.data.columns,
      })
    }
  }, [weaponDispatch, hash, rollId, rollQuery.data])

  const weaponHash = hash != null ? +hash : rollQuery.data?.weaponHash

  const weaponDef = weaponHash
    ? manifest.DestinyInventoryItemDefinition[weaponHash]
    : undefined

  const isWeaponStatic = useMemo(
    () =>
      weaponDef == null ||
      !weaponDef.sockets?.socketEntries.some(
        (socketEntry) => socketEntry.randomizedPlugSetHash != null,
      ),
    [weaponDef],
  )

  const activeColumns = useMemo(() => {
    const columns: number[] = []
    weaponDef?.sockets?.socketEntries.forEach((socketEntryDef, column) => {
      const { socketTypeHash } = socketEntryDef
      const socketTypeDef = manifest.DestinySocketTypeDefinition[socketTypeHash]

      // Perk socket type
      if (
        socketTypeDef?.socketCategoryHash === WEAPON_PERK_CATEGORY_HASH &&
        socketTypeHash !== TRACKER_TYPE_HASH
      ) {
        if (column > 8 || column === 5 || column === 6) {
          captureMessage(
            `Unexpected column index ${column} on weapon: ${weaponHash}`,
            'warning',
          )
        }
        columns.push(column)
      }
      // Masterwork socket type
      if (socketTypeHash === MASTERWORK_TYPE_HASH) {
        if (weaponDef?.inventory?.recipeItemHash == null) {
          columns.push(column)
        } else {
          // Intrinsic socket type
          columns.push(0)
        }
      }
    })

    return columns
  }, [manifest.DestinySocketTypeDefinition, weaponDef, weaponHash])

  if (rollQuery.isLoading) {
    return <LoadingScreen message="Loading roll information" />
  }

  if (rollQuery.isError) {
    return <ErrorScreen {...getAxiosError(rollQuery.error)} />
  }

  if (weaponHash == null || weaponDef == null || weaponDef.itemType !== 3) {
    return (
      <ErrorScreen
        status={404}
        message="Invalid URL (Hash does not match any weapons in the manifest)"
      />
    )
  }

  return (
    <WeaponLayoutGrid>
      <CreateARollDiv>
        <WeaponStateProvider
          weaponState={weaponState}
          weaponDispatch={weaponDispatch}
        >
          <CreateARoll
            weaponHash={weaponHash}
            isWeaponStatic={isWeaponStatic}
            rollId={rollId}
          />
        </WeaponStateProvider>
      </CreateARollDiv>
      <WeaponPreviewDiv>
        <WeaponPreview
          weaponHash={weaponHash}
          isWeaponStatic={isWeaponStatic}
          index={weaponState.selectedIndex}
          selectedPerks={weaponState.selectedPerks}
          selectedModifier={weaponState.selectedModifier}
          weaponDispatch={weaponDispatch}
        />
      </WeaponPreviewDiv>
      {!isWeaponStatic && (
        <>
          <GodRollsDiv>
            <GodRolls activeColumns={activeColumns} weaponHash={weaponHash} />
          </GodRollsDiv>
          <UserRollsDiv>
            <WeaponStateProvider
              weaponState={weaponState}
              weaponDispatch={weaponDispatch}
            >
              <Rolls activeColumns={activeColumns} weaponHash={weaponHash} />
            </WeaponStateProvider>
          </UserRollsDiv>
        </>
      )}
    </WeaponLayoutGrid>
  )
}
