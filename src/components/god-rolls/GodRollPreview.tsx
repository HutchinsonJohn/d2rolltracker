import { memo } from 'react'
import styled from 'styled-components'
import { RollResponse } from '../../api/rolls'
import { getHighestPreferredColumnIndexes } from '../../utils/perks'
import WeaponIcon from '../common/WeaponIcon'
import { FlexRowDiv } from '../common/StyledComponents'
import theme from '../../styles/theme'
import { websiteURI } from '../../api/url'
import DeleteButton from './DeleteButton'
import ShareButton from '../common/ShareButton'
import GodRollPreviewColumn from './GodRollPreviewColumn'
import ViewButton from './ViewButton'

const RollDiv = styled.div`
  background-color: ${theme.black90};
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
`

const ColumnLayoutDiv = styled.div`
  display: flex;
`

const ColumnDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  max-width: 50px;
  margin-left: 0.25rem;

  &:first-child {
    margin-left: 0;
  }
`

const RollNameH3 = styled.h3`
  font-size: 1.75em;
  word-break: break-word;
`

function GodRollPreview(props: {
  activeColumns: number[]
  rollResponse: RollResponse
  weaponHash: number
}) {
  const highestPreferredColumnIndexes = getHighestPreferredColumnIndexes(
    props.rollResponse.columns,
  )

  return (
    <RollDiv>
      <RollNameH3>{props.rollResponse.rollName}</RollNameH3>
      <ColumnLayoutDiv>
        <ColumnDiv>
          <WeaponIcon weaponHash={props.weaponHash} />
        </ColumnDiv>
        {props.activeColumns.map((column) => (
          <GodRollPreviewColumn
            key={column}
            column={column}
            highestPreferredColumnIndex={highestPreferredColumnIndexes[column]}
            weaponHash={props.weaponHash}
            rollResponse={props.rollResponse}
          />
        ))}
      </ColumnLayoutDiv>
      <FlexRowDiv>
        <ViewButton rollResponse={props.rollResponse} />
        <ShareButton URL={`${websiteURI}/r/${props.rollResponse.rollId}`} />
        <DeleteButton
          rollResponse={props.rollResponse}
          weaponHash={props.weaponHash}
        />
      </FlexRowDiv>
    </RollDiv>
  )
}
export default memo(GodRollPreview)
