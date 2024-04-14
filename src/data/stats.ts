/** Name, hash, and whether to display stat bar of each stat in display order */
const STATS: readonly {
  name: string
  hash: number
  hasBar?: boolean
}[] = [
  { name: 'Impact', hash: 4043523819, hasBar: true },
  { name: 'Range', hash: 1240592695, hasBar: true },

  // Bows
  { name: 'Accuracy', hash: 1591432999, hasBar: true },

  // Glaives
  { name: 'Shield Duration', hash: 1842278586, hasBar: true },

  // Rockets
  { name: 'Blast Radius', hash: 3614673599, hasBar: true },
  { name: 'Velocity', hash: 2523465841, hasBar: true },

  { name: 'Stability', hash: 155624089, hasBar: true },
  { name: 'Handling', hash: 943549884, hasBar: true },
  { name: 'Reload Speed', hash: 4188031367, hasBar: true },

  // Swords
  { name: 'Swing Speed', hash: 2837207746, hasBar: true },
  { name: 'Charge Rate', hash: 3022301683, hasBar: true },
  { name: 'Guard Resistance', hash: 209426660, hasBar: true },
  { name: 'Guard Efficiency', hash: 2762071195, hasBar: true },
  { name: 'Guard Endurance', hash: 3736848092, hasBar: true },

  { name: 'Aim Assistance', hash: 1345609583, hasBar: true },
  { name: 'Airborne Effectiveness', hash: 2714457168, hasBar: true },
  { name: 'Zoom', hash: 3555269338, hasBar: true },
  { name: 'Recoil Direction', hash: 2715839340 },

  // Bows
  { name: 'Draw Time', hash: 447667954 },

  // Fusions
  { name: 'Charge Time', hash: 2961396640 },

  { name: 'Rounds Per Minute', hash: 4284893193 },
  { name: 'Magazine', hash: 3871231066 },
  { name: 'Ammo Capacity', hash: 925767036 },
]

export default STATS
