import { cloneDeep } from 'lodash'
import { createContext, useContext, useMemo } from 'react'
import { getHighestPreferredColumnIndexes } from '../utils/perks'

export type PreferredPerks = Record<number, { hash: number; index: number }[]>
export type SelectedPerks = Record<number, null | number>
export type HighlightedPerks = Record<number, number[]>

export interface WeaponState {
  rollName: string
  preferredPerks: PreferredPerks
  sortedPreferredPerks: PreferredPerks
  selectedPerks: SelectedPerks
  highlightedPerks: HighlightedPerks
  selectedIndex: number
  selectedModifier: PerkModifiers
  highestPreferredColumnIndexes: Record<number, number>
}

export enum PerkModifiers {
  Selected = 'selected',
  Required = 'required',
  Preferred = 'preferred',
  Restricted = 'restricted',
  Deselected = 'deselected',
  Highlighted = 'highlighted',
}

export const initialWeaponState: WeaponState = {
  rollName: '',
  preferredPerks: {},
  sortedPreferredPerks: {},
  selectedPerks: {},
  highlightedPerks: {},
  selectedIndex: 0,
  selectedModifier: PerkModifiers.Selected,
  highestPreferredColumnIndexes: {},
}

export type WeaponDispatch = React.Dispatch<{
  type:
    | 'RESET'
    | 'SET_INDEX'
    | 'SET_MODIFIER'
    | 'PREVIEW'
    | 'PREFER'
    | 'PERK_ONCLICK'
    | 'SET_PERK_INDEX'
    | 'SORT'
    | 'SET_ROLL'
    | 'SET_ROLL_NAME'
  index?: number | undefined
  modifier?: PerkModifiers | undefined
  perkHash?: number | undefined
  column?: number | undefined
  rollId?: string
  preferredPerks?: PreferredPerks
  rollName?: string
}>

export function weaponReducer(
  draft: WeaponState,
  action: {
    type:
      | 'RESET'
      | 'SET_INDEX'
      | 'SET_MODIFIER'
      | 'PREVIEW'
      | 'PREFER'
      | 'PERK_ONCLICK'
      | 'SET_PERK_INDEX'
      | 'SORT'
      | 'SET_ROLL'
      | 'SET_ROLL_NAME'
    index?: number
    modifier?: PerkModifiers
    perkHash?: number
    column?: number
    rollId?: string
    preferredPerks?: PreferredPerks
    rollName?: string
  },
) {
  switch (action.type) {
    case 'RESET':
      return initialWeaponState
    case 'SET_INDEX': {
      const { index } = action
      if (index == null) {
        throw new Error('Incorrect reducer usage')
      }
      const maxIndex = 128
      if (index > maxIndex) {
        // Index cannot be larger than 128
        draft.selectedIndex = maxIndex
        break
      }
      if (index < 0) {
        // Index cannot be less than 0
        draft.selectedIndex = 0
        break
      }
      draft.selectedIndex = index
      break
    }
    case 'SET_MODIFIER': {
      const { modifier } = action
      if (modifier == null) {
        throw new Error('Incorrect reducer usage')
      }
      draft.selectedModifier = modifier
      break
    }
    case 'PREVIEW': {
      const { perkHash } = action
      const { column } = action
      if (perkHash == null || column == null) {
        throw new Error('Incorrect reducer usage')
      }
      draft.selectedPerks[column] =
        draft.selectedPerks[column] === perkHash ? null : perkHash
      break
    }
    case 'PREFER': {
      const { perkHash } = action
      const { column } = action
      if (perkHash == null || column == null) {
        throw new Error('Incorrect reducer usage')
      }
      let preferredPerkColumn = draft.preferredPerks[column]
      const preferredColumnIndex = preferredPerkColumn?.findIndex(
        (perk) => perk.hash === perkHash,
      )
      if (preferredColumnIndex != null && preferredColumnIndex !== -1) {
        if (
          preferredPerkColumn[preferredColumnIndex].index !==
          draft.selectedIndex
        ) {
          preferredPerkColumn[preferredColumnIndex].index = draft.selectedIndex
        } else {
          preferredPerkColumn.splice(preferredColumnIndex, 1)
        }
      } else {
        if (preferredPerkColumn == null) {
          draft.preferredPerks[column] = []
          preferredPerkColumn = draft.preferredPerks[column]
        }
        preferredPerkColumn.push({
          hash: perkHash,
          index: draft.selectedIndex,
        })
      }
      draft.highestPreferredColumnIndexes = getHighestPreferredColumnIndexes(
        draft.preferredPerks,
      )
      break
    }
    case 'PERK_ONCLICK': {
      const { perkHash } = action
      const { column } = action
      if (perkHash == null || column == null) {
        throw new Error('Incorrect reducer usage')
      }
      switch (draft.selectedModifier) {
        case PerkModifiers.Selected: {
          draft.selectedPerks[column] =
            draft.selectedPerks[column] === perkHash ? null : perkHash
          break
        }
        case PerkModifiers.Preferred: {
          let preferredPerkColumn = draft.preferredPerks[column]
          const preferredColumnIndex = preferredPerkColumn?.findIndex(
            (perk) => perk.hash === perkHash,
          )
          if (preferredColumnIndex != null && preferredColumnIndex !== -1) {
            if (
              preferredPerkColumn[preferredColumnIndex].index !==
              draft.selectedIndex
            ) {
              preferredPerkColumn[preferredColumnIndex].index =
                draft.selectedIndex
            } else {
              preferredPerkColumn.splice(preferredColumnIndex, 1)
            }
          } else {
            if (preferredPerkColumn == null) {
              draft.preferredPerks[column] = []
              preferredPerkColumn = draft.preferredPerks[column]
            }
            preferredPerkColumn.push({
              hash: perkHash,
              index: draft.selectedIndex,
            })
          }
          draft.highestPreferredColumnIndexes =
            getHighestPreferredColumnIndexes(draft.preferredPerks)
          break
        }
        case PerkModifiers.Highlighted: {
          const highlightedPerkColumn = draft.highlightedPerks[column]
          if (highlightedPerkColumn == null) {
            throw new Error('Incorrect reducer usage')
          }

          const highlightedColumnIndex = highlightedPerkColumn.indexOf(perkHash)
          if (highlightedColumnIndex !== -1) {
            highlightedPerkColumn.splice(highlightedColumnIndex, 1)
          } else {
            highlightedPerkColumn.push(perkHash)
          }
          break
        }
        default:
          break
      }
      break
    }
    case 'SET_PERK_INDEX': {
      if (
        action.index == null ||
        action.perkHash == null ||
        action.column == null
      ) {
        throw new Error('Incorrect reducer usage')
      }
      if (action.index >= 0) {
        const perk = draft.preferredPerks[action.column].find(
          (p) => p.hash === action.perkHash,
        )
        if (perk != null) {
          perk.index = action.index
        }
      }
      draft.highestPreferredColumnIndexes = getHighestPreferredColumnIndexes(
        draft.preferredPerks,
      )
      break
    }
    case 'SORT': {
      draft.sortedPreferredPerks = cloneDeep(draft.preferredPerks)
      break
    }
    case 'SET_ROLL': {
      const { preferredPerks, rollName } = action
      if (preferredPerks == null || rollName == null) {
        throw new Error('Incorrect reducer usage')
      }
      draft.preferredPerks = preferredPerks
      draft.highestPreferredColumnIndexes = getHighestPreferredColumnIndexes(
        draft.preferredPerks,
      )
      draft.sortedPreferredPerks = cloneDeep(draft.preferredPerks)
      draft.rollName = rollName
      break
    }
    case 'SET_ROLL_NAME': {
      const { rollName } = action
      if (rollName == null) {
        throw new Error('Incorrect reducer usage')
      }
      draft.rollName = rollName
      break
    }
    default:
      break
  }
  return draft
}

const WeaponStateContext = createContext<WeaponState | undefined>(undefined)
const WeaponDispatchContext = createContext<WeaponDispatch | undefined>(
  undefined,
)

export function useWeaponState() {
  const data = useContext(WeaponStateContext)
  if (data == null) {
    throw new Error(
      'A component that relies on weapon state is used while the weapon state has not been initialized',
    )
  }
  return data
}

export function useWeaponDispatch() {
  const data = useContext(WeaponDispatchContext)
  if (data == null) {
    throw new Error(
      'A component that relies on weapon state is used while the weapon state has not been initialized',
    )
  }
  return data
}

export default function WeaponStateProvider(props: {
  children: React.ReactNode
  weaponState: WeaponState
  weaponDispatch: WeaponDispatch
}) {
  const weaponState = useMemo(() => props.weaponState, [props.weaponState])
  const weaponDispatch = useMemo(
    () => props.weaponDispatch,
    [props.weaponDispatch],
  )
  return (
    <WeaponStateContext.Provider value={weaponState}>
      <WeaponDispatchContext.Provider value={weaponDispatch}>
        {props.children}
      </WeaponDispatchContext.Provider>
    </WeaponStateContext.Provider>
  )
}
