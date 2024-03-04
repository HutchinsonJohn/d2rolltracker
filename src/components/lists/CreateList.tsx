import { useQueryClient, useMutation } from 'react-query'
import { useState } from 'react'
import { RollResponse } from '../../api/rolls'
import {
  useAccountState,
  useAccountUpdateTokens,
} from '../../context/AccountStateContext'
import { USER_LISTS } from '../../api/queries'
import { saveList } from '../../api/lists'
import { AlertMessageDiv } from '../common/StyledComponents'

export default function CreateList() {
  const accountState = useAccountState()
  const updateTokens = useAccountUpdateTokens()

  const [listName, setListName] = useState<string>('')

  const queryClient = useQueryClient()

  const saveMutation = useMutation(
    async () =>
      saveList(
        {
          listName,
        },
        accountState,
        updateTokens,
      ),
    {
      onSuccess: (data) => {
        const oldData = queryClient.getQueryData<RollResponse[]>([
          USER_LISTS,
          { accountState },
        ])
        queryClient.setQueryData(
          [USER_LISTS, { accountState }],
          [...(oldData != null ? oldData : []), data],
        )
      },
    },
  )

  if (!accountState.loggedIn) {
    return <AlertMessageDiv>Please log in to save rolls</AlertMessageDiv>
  }

  return (
    <form
      name="rollName"
      onSubmit={(e) => {
        e.preventDefault()
        saveMutation.mutate()
      }}
    >
      <h2>Create A List</h2>
      <label htmlFor="listName">
        List Name:
        <input
          type="text"
          name="listName"
          autoComplete="off"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
        />
      </label>
      <input type="submit" value="Create List" />
    </form>
  )
}
