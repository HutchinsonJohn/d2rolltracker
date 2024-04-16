export const IMPACT_STAT = { name: 'Impact', hash: 4043523819, hasBar: true }
export const RANGE_STAT = { name: 'Range', hash: 1240592695, hasBar: true }
export const ACCURACY_STAT = {
  name: 'Accuracy',
  hash: 1591432999,
  hasBar: true,
}
export const SHIELD_DURATION_STAT = {
  name: 'Shield Duration',
  hash: 1842278586,
  hasBar: true,
}
export const BLAST_RADIUS_STAT = {
  name: 'Blast Radius',
  hash: 3614673599,
  hasBar: true,
}
export const VELOCITY_STAT = {
  name: 'Velocity',
  hash: 2523465841,
  hasBar: true,
}
export const STABILITY_STAT = {
  name: 'Stability',
  hash: 155624089,
  hasBar: true,
}
export const HANDLING_STAT = { name: 'Handling', hash: 943549884, hasBar: true }
export const RELOAD_SPEED_STAT = {
  name: 'Reload Speed',
  hash: 4188031367,
  hasBar: true,
}
export const SWING_SPEED_STAT = {
  name: 'Swing Speed',
  hash: 2837207746,
  hasBar: true,
}
export const CHARGE_RATE_STAT = {
  name: 'Charge Rate',
  hash: 3022301683,
  hasBar: true,
}
export const GUARD_RESISTANCE_STAT = {
  name: 'Guard Resistance',
  hash: 209426660,
  hasBar: true,
}
export const GUARD_EFFICIENCY_STAT = {
  name: 'Guard Efficiency',
  hash: 2762071195,
  hasBar: true,
}
export const GUARD_ENDURANCE_STAT = {
  name: 'Guard Endurance',
  hash: 3736848092,
  hasBar: true,
}
export const AIM_ASSISTANCE_STAT = {
  name: 'Aim Assistance',
  hash: 1345609583,
  hasBar: true,
}
export const AIRBORNE_EFFECTIVENESS_STAT = {
  name: 'Airborne Effectiveness',
  hash: 2714457168,
  hasBar: true,
}
export const ZOOM_STAT = { name: 'Zoom', hash: 3555269338, hasBar: true }
export const RECOIL_DIRECTION_STAT = {
  name: 'Recoil Direction',
  hash: 2715839340,
}
export const DRAW_TIME_STAT = { name: 'Draw Time', hash: 447667954 }
export const CHARGE_TIME_STAT = { name: 'Charge Time', hash: 2961396640 }
export const RPM_STAT = { name: 'Rounds Per Minute', hash: 4284893193 }
export const MAGAZINE_STAT = { name: 'Magazine', hash: 3871231066 }
export const AMMO_CAPACITY_STAT = { name: 'Ammo Capacity', hash: 925767036 }

/** Name, hash, and whether to display stat bar of each stat in display order */
const STATS: readonly {
  name: string
  hash: number
  hasBar?: boolean
}[] = [
  IMPACT_STAT,
  RANGE_STAT,

  // Bows
  ACCURACY_STAT,

  // Glaives
  SHIELD_DURATION_STAT,

  // Rockets
  BLAST_RADIUS_STAT,
  VELOCITY_STAT,

  STABILITY_STAT,
  HANDLING_STAT,
  RELOAD_SPEED_STAT,

  // Swords
  SWING_SPEED_STAT,
  CHARGE_RATE_STAT,
  GUARD_RESISTANCE_STAT,
  GUARD_EFFICIENCY_STAT,
  GUARD_ENDURANCE_STAT,

  AIM_ASSISTANCE_STAT,
  AIRBORNE_EFFECTIVENESS_STAT,
  ZOOM_STAT,
  RECOIL_DIRECTION_STAT,

  // Bows
  DRAW_TIME_STAT,

  // Fusions
  CHARGE_TIME_STAT,

  RPM_STAT,
  MAGAZINE_STAT,
  AMMO_CAPACITY_STAT,
]

export default STATS
