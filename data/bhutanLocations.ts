/**
 * Elevation and typical temperature range per Bhutanese location used across
 * tour itineraries. Single source of truth so every itinerary day, the
 * client portal, and the sample-itinerary PDF stay consistent.
 */

export interface LocationInfo {
  elevation: string;
  tempRange: string;
}

export const LOCATION_INFO: Record<string, LocationInfo> = {
  'Paro':               { elevation: '2,200m (7,200ft)',  tempRange: '-5°C – 25°C' },
  'Thimphu':            { elevation: '2,300m (7,550ft)',  tempRange: '-2°C – 22°C' },
  'Punakha':            { elevation: '1,200m (3,940ft)',  tempRange: '8°C – 30°C' },
  'Wangdue Phodrang':   { elevation: '1,350m (4,430ft)',  tempRange: '7°C – 28°C' },
  'Trongsa':            { elevation: '2,200m (7,220ft)',  tempRange: '-3°C – 23°C' },
  'Bumthang':           { elevation: '2,600m (8,530ft)',  tempRange: '-8°C – 20°C' },
  'Gangtey':            { elevation: '2,900m (9,510ft)',  tempRange: '-10°C – 18°C' },
  'Jangothang':         { elevation: '4,080m (13,390ft)', tempRange: '-15°C – 10°C' },
  'Shana':              { elevation: '2,870m (9,420ft)',  tempRange: '-5°C – 20°C' },
  'Thangthangkha':      { elevation: '3,580m (11,750ft)', tempRange: '-8°C – 15°C' },
  'Jele Dzong':         { elevation: '3,450m (11,320ft)', tempRange: '-8°C – 15°C' },
  'Tsokam':             { elevation: '3,780m (12,400ft)', tempRange: '-10°C – 12°C' },
  'Jimilang Tsho':      { elevation: '3,880m (12,730ft)', tempRange: '-10°C – 12°C' },
  'Simkotra Tsho':      { elevation: '4,050m (13,290ft)', tempRange: '-12°C – 10°C' },
}

export function getLocationInfo(location?: string): LocationInfo | undefined {
  if (!location) return undefined
  return LOCATION_INFO[location]
}
