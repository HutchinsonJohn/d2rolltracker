import { DestinyInventoryItemDefinition } from 'bungie-api-ts/destiny2'
import { Dictionary, groupBy } from 'lodash'
import { useMemo, useState } from 'react'
import { Accordion } from 'react-bootstrap'
import { useQuery } from 'react-query'
import styled from 'styled-components'
import { getList } from '../../api/lists'
import { RollResponse } from '../../api/rolls'
import {
  useAccountState,
  useAccountUpdateTokens,
} from '../../context/AccountStateContext'
import { useManifest } from '../../context/ManifestContext'
import {
  WEAPON_PERK_CATEGORY_HASH,
  TRACKER_TYPE_HASH,
} from '../../data/sockets'
import { getWeaponsFromManifest } from '../../utils/manifest'
import { getHighestPreferredColumnIndexes } from '../../utils/perks'
import WeaponIcon from '../common/WeaponIcon'
import GodRollPreviewMemo from '../god-rolls/GodRollPreview'

const ListDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0.5rem;
`

const ListGrid = styled.div`
  display: grid;
  grid-template-columns: auto 200px 200px;
  grid-gap: 1rem;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
`

const RollsDiv = styled.div`
  width: 100%;
  height: 100%
  padding: 0 1rem;
  transition: height 0.5s;
`

const StyledAccordionButton = styled(Accordion.Button)`
  color: black;
  font-weight: bold;
  cursor: pointer;
  border-bottom: 1px solid #ccc;
  max-width: 1200px;
  padding: 0;

  &:not(.collapsed) {
    color: black;
    background-color: #f5f5f5;
  }
`

const ListAccordionHeader = styled.div``

const RollCountDiv = styled.div`
  width: 100%;
  text-align: right;
  padding-right: 1rem;
`

const WeaponDiv = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
`

export default function List(props: { listId: string }) {
  // eslint-disable-next-line react/destructuring-assignment
  const { listId } = props
  const [expanded, setExpanded] = useState(true)

  const accountState = useAccountState()
  const updateTokens = useAccountUpdateTokens()
  const manifest = useManifest()

  const listQuery = useQuery(
    ['list', { listId }],
    async () => {
      const list = await getList(listId, accountState, updateTokens)
      return list
    },
    { enabled: expanded },
  )

  const [searchValue, setSearchValue] = useState<string>('')
  const [weaponMatches, setWeaponMatches] = useState<
    Dictionary<
      {
        activeColumns: number[]
        rollResponse: RollResponse
        weaponHash: number
        weaponDef: DestinyInventoryItemDefinition
      }[]
    >
  >({})
  const [weaponMatchesWithNoRolls, setWeaponMatchesWithNoRolls] = useState<
    DestinyInventoryItemDefinition[]
  >([])
  const weaponDefs = getWeaponsFromManifest(
    manifest.DestinyInventoryItemDefinition,
  )

  const weapons = useMemo(
    () =>
      groupBy(
        listQuery.data?.rolls?.map((rollResponse) => {
          const { weaponHash } = rollResponse
          const weaponDef =
            manifest.DestinyInventoryItemDefinition[rollResponse.weaponHash]

          const columns: number[] = []
          weaponDef?.sockets?.socketEntries.forEach(
            (socketEntryDef, column) => {
              const { socketTypeHash } = socketEntryDef
              const socketTypeDef =
                manifest.DestinySocketTypeDefinition[socketTypeHash]

              // Perk socket type
              if (
                socketTypeDef != null &&
                socketTypeDef.socketCategoryHash ===
                  WEAPON_PERK_CATEGORY_HASH &&
                socketTypeHash !== TRACKER_TYPE_HASH
              ) {
                if (column > 8 || column < 1 || column === 5 || column === 6) {
                  console.log('column value different than expected')
                }
                columns.push(column)
              }
            },
          )

          if (columns.length > 0) {
            // TODO: Handle weapons with intrinsic perks
            columns.push(7)
          } else {
            console.log('Unexpected behavior')
          }
          const activeColumns = columns
          return { activeColumns, rollResponse, weaponHash, weaponDef }
        }),
        'rollResponse.weaponHash',
      ),
    [listQuery.data?.rolls, manifest],
  )

  function weaponSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const query = e.target.value
    setSearchValue(query)
    const matches: Dictionary<
      {
        activeColumns: number[]
        rollResponse: RollResponse
        weaponHash: number
        weaponDef: DestinyInventoryItemDefinition
      }[]
    > = {}
    if (query.length === 0) {
      setWeaponMatches(weapons)
      setWeaponMatchesWithNoRolls([])
      return
    }

    Object.entries(weapons).forEach(([weaponHash, weapon]) => {
      const { weaponDef } = weapon[0]
      if (
        weaponDef.displayProperties.name
          .toLowerCase()
          .includes(query.toLowerCase())
      ) {
        matches[weaponHash] = weapon
      }
    })

    setWeaponMatches(matches)

    const weaponHashMatches = Object.keys(matches)
    if (weaponHashMatches.length < 5) {
      const weaponDefMatches: DestinyInventoryItemDefinition[] = []
      Object.values(weaponDefs).forEach((weaponDef) => {
        if (
          weaponDef.displayProperties.name
            .toLowerCase()
            .includes(query.toLowerCase())
        ) {
          if (
            weaponHashMatches.length + weaponDefMatches.length >= 5 ||
            weaponHashMatches.includes(weaponDef.hash.toString())
          )
            return
          weaponDefMatches.push(weaponDef)
        }
      })

      setWeaponMatchesWithNoRolls(weaponDefMatches)
    }
  }

  const test = useMemo(
    () =>
      Object.entries(weapons).map(([weaponHash, rolls]) => (
        <Accordion.Item key={weaponHash} eventKey={weaponHash}>
          <StyledAccordionButton>
            <WeaponDiv>
              <WeaponIcon weaponHash={+weaponHash} />
              <div>
                {
                  manifest.DestinyInventoryItemDefinition[+weaponHash]
                    .displayProperties.name
                }
              </div>
            </WeaponDiv>
            <RollCountDiv>{`${rolls.length} roll${
              rolls.length === 1 ? '' : 's'
            }`}</RollCountDiv>
          </StyledAccordionButton>
          <Accordion.Body>
            {rolls.map((roll) => {
              const highestPreferredColumnIndex =
                getHighestPreferredColumnIndexes(roll.rollResponse.columns)[2]
              const bestPerkHash = roll.rollResponse.columns[2]
                ?.map((perk) => {
                  if (perk.index === highestPreferredColumnIndex) {
                    return perk.hash
                  }
                  return undefined
                })
                .filter((perkHash): perkHash is number => perkHash != null)[0]
              return (
                <GodRollPreviewMemo
                  key={roll.rollResponse.rollId}
                  activeColumns={roll.activeColumns}
                  rollResponse={roll.rollResponse}
                  weaponHash={roll.weaponHash}
                />
              )
            })}
          </Accordion.Body>
        </Accordion.Item>
      )),
    [manifest, weapons],
  )

  return (
    <Accordion flush>
      <Accordion.Item eventKey="0">
        <StyledAccordionButton>
          <ListGrid>
            <div>{listQuery.data?.listName}</div>
            <div>{listQuery.data?.subscribedUsers.length}</div>
            <div>{listQuery.data?.createdBy.displayName}</div>
          </ListGrid>
        </StyledAccordionButton>
        <Accordion.Body>
          <RollsDiv>
            <input
              type="text"
              placeholder="Search"
              autoComplete="off"
              value={searchValue}
              onChange={weaponSearchChange}
            />
            <Accordion flush>
              {/* {Object.entries(weapons).map(([weaponHash, rolls]) => (
                <Accordion.Item key={weaponHash} eventKey={weaponHash}>
                  <StyledAccordionButton>
                    <WeaponDiv>
                      <WeaponIcon
                        weaponDef={
                          manifest.DestinyInventoryItemDefinition[+weaponHash]
                        }
                      />
                      <div>
                        {
                          manifest.DestinyInventoryItemDefinition[+weaponHash]
                            .displayProperties.name
                        }
                      </div>
                    </WeaponDiv>
                    <RollCountDiv>{`${rolls.length} roll${
                      rolls.length === 1 ? '' : 's'
                    }`}</RollCountDiv>
                  </StyledAccordionButton>
                  <Accordion.Body>
                    {rolls.map((roll) => (
                      <RollSchemaPreviewMemo
                        key={roll.rollResponse.rollId}
                        activeColumns={roll.activeColumns}
                        rollResponse={roll.rollResponse}
                        weaponDef={roll.weaponDef}
                      />
                    ))}
                  </Accordion.Body>
                </Accordion.Item>
              ))} */}
              {Object.entries(weaponMatches).map(([weaponHash, rolls]) => (
                <Accordion.Item key={weaponHash} eventKey={weaponHash}>
                  <StyledAccordionButton>
                    <WeaponDiv>
                      <WeaponIcon weaponHash={+weaponHash} />
                      <div>
                        {
                          manifest.DestinyInventoryItemDefinition[+weaponHash]
                            .displayProperties.name
                        }
                      </div>
                    </WeaponDiv>
                    <RollCountDiv>{`${rolls.length} roll${
                      rolls.length === 1 ? '' : 's'
                    }`}</RollCountDiv>
                  </StyledAccordionButton>
                  <Accordion.Body>
                    {rolls.map((roll) => (
                      <GodRollPreviewMemo
                        key={roll.rollResponse.rollId}
                        activeColumns={roll.activeColumns}
                        rollResponse={roll.rollResponse}
                        weaponHash={roll.weaponHash}
                      />
                    ))}
                  </Accordion.Body>
                </Accordion.Item>
              ))}
              {weaponMatchesWithNoRolls.map((weaponDef) => (
                <Accordion.Item
                  key={weaponDef.hash}
                  eventKey={weaponDef.hash.toString()}
                >
                  <StyledAccordionButton>
                    <WeaponDiv>
                      <WeaponIcon weaponHash={weaponDef.hash} />
                      <div>{weaponDef.displayProperties.name}</div>
                    </WeaponDiv>
                    <RollCountDiv>0 rolls</RollCountDiv>
                  </StyledAccordionButton>
                </Accordion.Item>
              ))}
            </Accordion>
          </RollsDiv>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  )
}
