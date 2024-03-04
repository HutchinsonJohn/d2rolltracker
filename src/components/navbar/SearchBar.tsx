import { DestinyInventoryItemDefinition } from 'bungie-api-ts/destiny2'
import { MouseEventHandler, useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { faCircleXmark } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useManifest } from '../../context/ManifestContext'
import { getWeaponsFromManifest } from '../../utils/manifest'
import theme from '../../styles/theme'
import WeaponListItem from './WeaponListItem'

const SearchBarDiv = styled.div`
  position: relative;
  flex-basis: 100%;
  box-sizing: border-box;
  margin: 0 8px;
`

const ClearSearchButton = styled(FontAwesomeIcon)`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto 4px;
  color: ${theme.lightGrey};

  &:hover {
    color: ${theme.white};
  }
`

const WeaponListDiv = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${theme.black};
  padding: 4px;
  position: absolute;
  z-index: 10;
  left: 0;
  top: 100%;
  width: 100%;
`

const SearchBarInput = styled.input`
  border: none;
  background-color: ${theme.black60};
  width: 100%;
  color: ${theme.white};

  &:focus {
    //outline: ${theme.white} 1px solid;
    outline: none;
  }
`

export default function SearchBar() {
  const manifest = useManifest()
  const [searchValue, setSearchValue] = useState<string>('')
  const [weaponMatches, setWeaponMatches] = useState<
    DestinyInventoryItemDefinition[]
  >([])
  const [cursor, setCursor] = useState<number>(-1)
  const weaponDefs = useMemo(
    () => getWeaponsFromManifest(manifest.DestinyInventoryItemDefinition),
    [manifest],
  )

  const weaponSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value
      setSearchValue(query)
      setCursor(-1)
      const matches: DestinyInventoryItemDefinition[] = []
      if (query.length === 0) {
        setWeaponMatches(matches)
        return
      }

      Object.values(weaponDefs).forEach((weaponDef) => {
        if (
          weaponDef.displayProperties.name
            .toLowerCase()
            .includes(query.toLowerCase())
        ) {
          matches.push(weaponDef)
        }
      })

      setWeaponMatches(matches)
    },
    [weaponDefs],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowUp' && cursor > 0) {
        e.preventDefault()
        setCursor(cursor - 1)
      } else if (
        (e.key === 'ArrowDown' || e.key === 'Tab') &&
        cursor < weaponMatches.length - 1 &&
        cursor < 14
      ) {
        e.preventDefault()
        setCursor(cursor + 1)
      } else if (e.key === 'Enter') {
        document.getElementById(cursor.toString())?.click()
        setCursor(-1)
      } else if (e.key === 'Escape') {
        setSearchValue('')
        setCursor(-1)
      } else if (e.key === 'Tab') {
        e.preventDefault()
      }
    },
    [cursor, weaponMatches.length],
  )

  const handleMouseEnter: MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      const index = parseInt(e.currentTarget.getAttribute('id') || '0', 10)
      setCursor(index)
    },
    [],
  )
  const handleMouseLeave = useCallback(() => {
    setCursor(-1)
  }, [])

  return (
    <SearchBarDiv>
      <SearchBarInput
        type="text"
        placeholder="Search"
        autoComplete="off"
        value={searchValue}
        onKeyDown={handleKeyDown}
        onChange={weaponSearchChange}
      />
      <ClearSearchButton
        type="button"
        title="Clear Search"
        icon={faCircleXmark}
        onClick={() => setSearchValue('')}
      />
      {searchValue.length !== 0 && (
        <WeaponListDiv>
          {weaponMatches.length === 0
            ? 'No matching weapons'
            : weaponMatches
                .slice(0, 15)
                .map((weaponDef, i) => (
                  <WeaponListItem
                    weaponDef={weaponDef}
                    setSearchValue={setSearchValue}
                    handleMouseEnter={handleMouseEnter}
                    handleMouseLeave={handleMouseLeave}
                    isHover={cursor === i}
                    i={i}
                    key={weaponDef.hash}
                  />
                ))}
        </WeaponListDiv>
      )}
    </SearchBarDiv>
  )
}
