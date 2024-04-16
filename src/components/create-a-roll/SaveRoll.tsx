import { memo, useCallback, useEffect, useState } from 'react'
import { useQueryClient } from 'react-query'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { useGodRollQuery, useUserListsQuery } from '../../api/queries'
import { ListResponse } from '../../api/lists'
import {
  useWeaponState,
  useWeaponDispatch,
} from '../../context/WeaponStateContext'
import {
  useAccountState,
  useAccountUpdateTokens,
} from '../../context/AccountStateContext'
import { AlertMessageDiv, Button } from '../common/StyledComponents'
import theme from '../../styles/theme'
import StatusIcon from './StatusIcon'
import { getAxiosError } from '../../utils/error'
import { useSaveRollMutation } from '../../api/mutations'
import { useManifest } from '../../context/ManifestContext'
import ErrorMessage from '../error/ErrorMessage'
import ShareButton from '../common/ShareButton'
import { websiteURI } from '../../api/url'

const SaveRollDiv = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  margin: 0 16px 10px 16px;
`

const RollNameLabel = styled.label`
  font-size: 1.75em;
`

const NameInput = styled.input`
  border: none;
  background-color: ${theme.black60};
  color: ${theme.white};
  margin: 6px 6px;

  &:focus {
    //outline: ${theme.white} 1px solid;
    outline: none;
  }
`

/**
 * rollId should be undefined if creating a new roll or if the roll belongs
 * to a different user
 */
function SaveRoll(props: { weaponHash: number; rollId: string | undefined }) {
  const manifest = useManifest()
  const accountState = useAccountState()
  const updateTokens = useAccountUpdateTokens()
  const weaponState = useWeaponState()
  const weaponDispatch = useWeaponDispatch()

  const queryClient = useQueryClient()

  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [selectedList, setSelectedList] = useState<ListResponse | undefined>()

  const navigate = useNavigate()

  const saveMutation = useSaveRollMutation(
    props.rollId,
    props.weaponHash,
    selectedList?.listId,
    accountState,
    updateTokens,
    weaponState.rollName,
    weaponState.preferredPerks,
    queryClient,
    navigate,
  )

  const listsQuery = useUserListsQuery(accountState, updateTokens)

  useEffect(() => {
    setSelectedList(listsQuery.data?.find((list) => list.isPrivate))
  }, [listsQuery.data])

  const rollQuery = useGodRollQuery(
    props.rollId,
    accountState,
    updateTokens,
    manifest,
  )

  const rollNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      weaponDispatch({ type: 'SET_ROLL_NAME', rollName: e.target.value })
    },
    [weaponDispatch],
  )

  useEffect(() => {
    if (saveMutation.isError) {
      setErrorMessage(getAxiosError(saveMutation.error).message)
    }
  }, [saveMutation.isError, saveMutation.error])

  useEffect(() => {
    setErrorMessage(undefined)
  }, [weaponState.preferredPerks, weaponState.rollName])

  if (!accountState.loggedIn) {
    return <AlertMessageDiv>Please log in to save rolls</AlertMessageDiv>
  }

  if (listsQuery.isLoading) {
    return <SaveRollDiv>Loading user information</SaveRollDiv>
  }

  if (listsQuery.data == null || selectedList == null) {
    return (
      <ErrorMessage message="Cannot save rolls: The server may be down. Try again later." />
    )
  }

  const perksEqual = Object.entries(weaponState.preferredPerks).every(
    ([key, value]) =>
      value.every(
        ({ hash, index }, i) =>
          rollQuery.data?.columns[Number.parseInt(key, 10)]?.at(i)?.hash ===
            hash &&
          rollQuery.data?.columns[Number.parseInt(key, 10)]?.at(i)?.index ===
            index,
      ),
  )

  const perksSelected =
    Object.values(weaponState.preferredPerks).flat().length !== 0

  const unsavedChanges =
    (rollQuery.data == null && perksSelected) ||
    (rollQuery.data != null &&
      (!perksEqual || rollQuery.data.rollName !== weaponState.rollName))

  return (
    <SaveRollDiv>
      <RollNameLabel htmlFor="rollName">Roll Name: </RollNameLabel>
      <NameInput
        id="rollName"
        type="text"
        placeholder="God Roll"
        autoComplete="off"
        value={weaponState.rollName}
        onChange={rollNameChange}
      />
      <Button
        onClick={async () => {
          weaponDispatch({
            type: 'SORT',
          })
          if (unsavedChanges) {
            saveMutation.mutate()
          } else {
            setErrorMessage('No changes to save')
          }
        }}
      >
        Save
      </Button>
      <ShareButton
        URL={`${websiteURI}/r/${props.rollId}`}
        disabled={props.rollId == null || unsavedChanges}
      />
      <StatusIcon
        perksEqual={perksEqual}
        unsavedChanges={unsavedChanges}
        errorMessage={errorMessage}
        isSuccess={saveMutation.isSuccess}
      />
    </SaveRollDiv>
  )
}

export default memo(SaveRoll)
