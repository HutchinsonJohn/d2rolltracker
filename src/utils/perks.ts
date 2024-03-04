import type { DestinyStatDisplayDefinition } from 'bungie-api-ts/destiny2'
import type { PreferredPerks } from '../context/WeaponStateContext'

/** Rounds half numbers to the nearest even number */
function bankersRound(x: number) {
  const r = Math.round(x)
  if (x % 1 === 0.5 && r % 2 !== 0) return r - 1
  return r
}

export function interpolateStat(
  value: number,
  statDisplay: DestinyStatDisplayDefinition,
) {
  const interpolationArray = statDisplay.displayInterpolation

  const adjustedValue = Math.min(value, statDisplay.maximumValue)

  let endIndex = interpolationArray.findIndex(
    (point) => point.value > adjustedValue,
  )

  if (endIndex < 0) {
    endIndex = interpolationArray.length - 1
  }

  const startIndex = Math.max(0, endIndex - 1)

  const start = interpolationArray[startIndex]
  const end = interpolationArray[endIndex]
  const range = end.value - start.value
  if (range === 0) {
    return start.weight
  }

  const t = (adjustedValue - start.value) / (end.value - start.value)

  return bankersRound(start.weight + t * (end.weight - start.weight))
}

function getHighestPreferredColumnIndex(
  preferredPerkColumn: {
    hash: number
    index: number
  }[],
) {
  let highestPreferredColumnIndex = Infinity
  preferredPerkColumn?.forEach((perk) => {
    highestPreferredColumnIndex = Math.min(
      perk.index,
      highestPreferredColumnIndex,
    )
  })
  return highestPreferredColumnIndex
}

export function getHighestPreferredColumnIndexes(
  preferredPerks: PreferredPerks,
) {
  const highestPreferredColumnIndexes: Record<number, number> = {}
  Object.entries(preferredPerks).forEach(([column, perkColumn]) => {
    highestPreferredColumnIndexes[+column] =
      getHighestPreferredColumnIndex(perkColumn)
  })
  return highestPreferredColumnIndexes
}
