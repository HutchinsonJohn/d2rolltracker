import { DestinyInventoryComponent } from 'bungie-api-ts/destiny2'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { times } from 'lodash'
import WeaponIcon, { SkeletonWeaponImg } from './WeaponIcon'
import { WEAPON_BUCKET_TYPE_HASHES } from '../../data/buckets'
import { useManifest } from '../../context/ManifestContext'

const GridContainer = styled.div<{ columns: number }>`
  display: grid;
  grid-template-columns: repeat(${(props) => props.columns}, max-content);
  grid-gap: 10px;
  margin: 10px;
  height: 170px;
  align-content: start;

  &:not(:first-child) {
    margin-left: 0px;
  }
`

const WeaponLink = styled(Link)`
  all: 'unset';

  :hover {
    filter: brightness(1.2);
  }
`

const NonWeaponDiv = styled.div`
  filter: brightness(0.6);

  :hover {
    filter: brightness(0.7);
  }
`

const FlexDiv = styled.div`
  display: flex;
`

export default function CharacterInventory(props: {
  inventory: DestinyInventoryComponent
  equipment: DestinyInventoryComponent
}) {
  const manifest = useManifest()
  return (
    <div>
      <GridContainer columns={7}>
        {props.inventory.items
          .filter((item) => item.bucketHash === 215593132)
          .sort(
            (a, b) =>
              (Number(a.itemInstanceId) ?? 0) - (Number(b.itemInstanceId) ?? 0),
          )
          .map((item) => {
            const selectable =
              manifest.DestinyInventoryItemDefinition[
                item.itemHash
              ].itemCategoryHashes?.includes(1) ?? false
            return selectable ? (
              <WeaponLink to={`/w/${item.itemHash}`} key={item.itemInstanceId}>
                <WeaponIcon weaponHash={item.itemHash} />
              </WeaponLink>
            ) : (
              <NonWeaponDiv key={item.itemInstanceId}>
                <WeaponIcon weaponHash={item.itemHash} />
              </NonWeaponDiv>
            )
          })}
      </GridContainer>
      {WEAPON_BUCKET_TYPE_HASHES.map((bucketTypeHash) => (
        <FlexDiv key={bucketTypeHash}>
          <GridContainer columns={1}>
            {props.equipment.items
              .filter((item) => item.bucketHash === bucketTypeHash)
              .map((item) => (
                <WeaponLink
                  to={`/w/${item.itemHash}`}
                  key={item.itemInstanceId}
                >
                  <WeaponIcon weaponHash={item.itemHash} />
                </WeaponLink>
              ))}
          </GridContainer>
          <GridContainer columns={3}>
            {props.inventory.items
              .filter((item) => item.bucketHash === bucketTypeHash)
              .sort(
                (a, b) =>
                  (Number(a.itemInstanceId) ?? 0) -
                  (Number(b.itemInstanceId) ?? 0),
              )
              .map((item) => (
                <WeaponLink
                  to={`/w/${item.itemHash}`}
                  key={item.itemInstanceId}
                >
                  <WeaponIcon weaponHash={item.itemHash} />
                </WeaponLink>
              ))}
          </GridContainer>
        </FlexDiv>
      ))}
    </div>
  )
}

export function SkeletonInventory() {
  return (
    <div>
      <GridContainer columns={7}>
        {times(21, (n) => (
          <SkeletonWeaponImg key={n} />
        ))}
      </GridContainer>
      {times(3, (n) => (
        <FlexDiv key={n}>
          <GridContainer columns={1}>
            <SkeletonWeaponImg />
          </GridContainer>
          <GridContainer columns={3}>
            {times(9, (o) => (
              <SkeletonWeaponImg key={o} />
            ))}
          </GridContainer>
        </FlexDiv>
      ))}
    </div>
  )
}
