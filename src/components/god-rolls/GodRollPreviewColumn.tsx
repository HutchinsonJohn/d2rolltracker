import styled from 'styled-components'
import { RollResponse } from '../../api/rolls'
import { useManifest } from '../../context/ManifestContext'
import theme from '../../styles/theme'
import { AnyPerk, MultiplePerks, Perk } from '../common/perk/Perk'
import { MASTERWORK_TYPE_HASH } from '../../data/sockets'

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

export default function GodRollPreviewColumn(props: {
  column: number
  highestPreferredColumnIndex: number
  weaponHash: number
  rollResponse: RollResponse
}) {
  const manifest = useManifest()

  const preferredColumn = props.rollResponse.columns[props.column]

  const bestPerkHashes = preferredColumn
    ?.map((perk) => {
      if (perk.index === props.highestPreferredColumnIndex) {
        return perk.hash
      }
      return undefined
    })
    .filter((perkHash): perkHash is number => perkHash != null)

  const isIntrinsic =
    props.column === 0 &&
    manifest.DestinyInventoryItemDefinition[props.weaponHash].inventory
      ?.recipeItemHash != null

  const isMasterwork =
    !isIntrinsic &&
    manifest.DestinyInventoryItemDefinition[props.weaponHash].sockets
      ?.socketEntries[props.column].socketTypeHash === MASTERWORK_TYPE_HASH

  if (bestPerkHashes == null || bestPerkHashes.length === 0) {
    return (
      <ColumnDiv style={{ order: isMasterwork || isIntrinsic ? 2 : undefined }}>
        <AnyPerk isLastColumn={isMasterwork || isIntrinsic} />
      </ColumnDiv>
    )
  }

  if (bestPerkHashes.length > 2) {
    return (
      <ColumnDiv style={{ order: isMasterwork || isIntrinsic ? 2 : undefined }}>
        <Perk
          index={props.highestPreferredColumnIndex}
          backgroundFillColor={theme.exoticGold}
          borderColor={theme.white}
          perkHash={bestPerkHashes[0]}
          weaponHash={props.weaponHash}
          isMasterwork={isMasterwork}
          isIntrinsic={isIntrinsic}
        />
        <MultiplePerks
          numberOfPerks={bestPerkHashes.length - 1}
          isLastColumn={isMasterwork || isIntrinsic}
        />
      </ColumnDiv>
    )
  }
  return (
    <ColumnDiv style={{ order: isMasterwork || isIntrinsic ? 2 : undefined }}>
      {bestPerkHashes.map((perkHash) => (
        <Perk
          key={perkHash}
          index={props.highestPreferredColumnIndex}
          backgroundFillColor={theme.exoticGold}
          borderColor={theme.white}
          perkHash={perkHash}
          weaponHash={props.weaponHash}
          isMasterwork={isMasterwork}
          isIntrinsic={isIntrinsic}
        />
      ))}
    </ColumnDiv>
  )
}
