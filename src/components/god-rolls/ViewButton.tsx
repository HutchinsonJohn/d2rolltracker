import { useNavigate } from 'react-router-dom'
import { useQueryClient } from 'react-query'
import { GOD_ROLL } from '../../api/queries'
import { useAccountState } from '../../context/AccountStateContext'
import { Button } from '../common/StyledComponents'
import { RollResponse } from '../../api/rolls'

export default function ViewButton(props: { rollResponse: RollResponse }) {
  const accountState = useAccountState()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  // TODO: Give warning first if the user has unsaved changes

  return (
    <Button
      type="button"
      onClick={() => {
        queryClient.setQueryData(
          [GOD_ROLL, { rollId: props.rollResponse.rollId, accountState }],
          props.rollResponse,
        )
        navigate(`/r/${props.rollResponse.rollId}`)
        window.scrollTo(0, 0)
      }}
    >
      View/Edit
    </Button>
  )
}
