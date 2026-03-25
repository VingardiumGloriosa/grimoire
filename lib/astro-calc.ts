/**
 * Local planetary position calculator using the astronomia library.
 * Replaces the FreeAstroAPI dependency with offline VSOP87 calculations.
 *
 * Computes geocentric ecliptic longitudes for Sun, Moon, Mercury, Venus,
 * Mars, Jupiter, Saturn, Uranus, Neptune, and Pluto, plus the Ascendant.
 */


const astronomia = require('astronomia')
const { planetposition, julian, moonposition, solar, sidereal, nutation } = astronomia

// VSOP87 planet data (must use .default for ESM-packaged data)

const earthData = require('astronomia/data/vsop87Bearth').default

const mercuryData = require('astronomia/data/vsop87Bmercury').default

const venusData = require('astronomia/data/vsop87Bvenus').default

const marsData = require('astronomia/data/vsop87Bmars').default

const jupiterData = require('astronomia/data/vsop87Bjupiter').default

const saturnData = require('astronomia/data/vsop87Bsaturn').default

const uranusData = require('astronomia/data/vsop87Buranus').default

const neptuneData = require('astronomia/data/vsop87Bneptune').default

const SIGN_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
]

const RAD_TO_DEG = 180 / Math.PI

interface PlanetResult {
  planet: string
  sign: string
  degree: number
  house: number
  retrograde: boolean
}

interface HouseResult {
  house: number
  sign: string
  degree: number
}

interface AstroCalcResult {
  planets: PlanetResult[]
  houses: HouseResult[]
  aspects: { planet1: string; planet2: string; aspect: string; degree: number; orb: number }[]
  moonSign: string
  risingSign: string | null
}

function normalizeDeg(deg: number): number {
  return ((deg % 360) + 360) % 360
}

function degToSign(deg: number): string {
  return SIGN_NAMES[Math.floor(normalizeDeg(deg) / 30)]
}

/**
 * Convert heliocentric ecliptic coordinates to geocentric ecliptic longitude.
 */
function helioToGeoLon(
  planetLon: number, planetRange: number,
  earthLon: number, earthRange: number,
  planetLat: number
): number {
  const x = planetRange * Math.cos(planetLat) * Math.cos(planetLon) - earthRange * Math.cos(earthLon)
  const y = planetRange * Math.cos(planetLat) * Math.sin(planetLon) - earthRange * Math.sin(earthLon)
  return Math.atan2(y, x)
}

/**
 * Compute the Ascendant (rising sign) from local sidereal time and latitude.
 */
function computeAscendant(jd: number, longitude: number, latitude: number): number {
  // Greenwich mean sidereal time in radians
  const gmst = sidereal.mean(jd)
  // Local sidereal time
  const lst = gmst + (longitude * Math.PI / 180)

  // Obliquity of ecliptic
  const eps = nutation.meanObliquity(jd)

  const latRad = latitude * Math.PI / 180

  // Ascendant formula
  const y = -Math.cos(lst)
  const x = Math.sin(eps) * Math.tan(latRad) + Math.cos(eps) * Math.sin(lst)
  let asc = Math.atan2(y, x)
  asc = normalizeDeg(asc * RAD_TO_DEG)

  return asc
}

/**
 * Simple check if a planet might be retrograde (geocentric longitude decreasing).
 * We compare position at jd vs jd+1 day.
 */
function isRetrograde(
  planetObj: InstanceType<typeof planetposition.Planet>,
  earthObj: InstanceType<typeof planetposition.Planet>,
  jd: number
): boolean {
  const ePos1 = earthObj.position(jd)
  const pPos1 = planetObj.position(jd)
  const lon1 = helioToGeoLon(pPos1.lon, pPos1.range, ePos1.lon, ePos1.range, pPos1.lat)

  const ePos2 = earthObj.position(jd + 1)
  const pPos2 = planetObj.position(jd + 1)
  const lon2 = helioToGeoLon(pPos2.lon, pPos2.range, ePos2.lon, ePos2.range, pPos2.lat)

  const diff = normalizeDeg(lon2 * RAD_TO_DEG) - normalizeDeg(lon1 * RAD_TO_DEG)
  // If the difference is negative (or wraps past 360), the planet appears to move backward
  return diff < 0 && diff > -180
}

/**
 * Compute equal-house cusps from the Ascendant.
 */
function computeHouses(ascDeg: number): HouseResult[] {
  const houses: HouseResult[] = []
  for (let i = 0; i < 12; i++) {
    const cusp = normalizeDeg(ascDeg + i * 30)
    houses.push({
      house: i + 1,
      sign: degToSign(cusp),
      degree: cusp,
    })
  }
  return houses
}

/**
 * Determine which house a planet falls in given the house cusps.
 */
function getHouseNumber(planetDeg: number, houses: HouseResult[]): number {
  const deg = normalizeDeg(planetDeg)
  for (let i = 0; i < 12; i++) {
    const cusp = houses[i].degree
    const nextCusp = houses[(i + 1) % 12].degree
    if (nextCusp > cusp) {
      if (deg >= cusp && deg < nextCusp) return i + 1
    } else {
      // Wraps around 360
      if (deg >= cusp || deg < nextCusp) return i + 1
    }
  }
  return 1
}

const ASPECT_DEFS: [number, string][] = [
  [0, 'Conjunction'],
  [60, 'Sextile'],
  [90, 'Square'],
  [120, 'Trine'],
  [180, 'Opposition'],
]

function computeAspects(planets: PlanetResult[]): AstroCalcResult['aspects'] {
  const aspects: AstroCalcResult['aspects'] = []
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const diff = Math.abs(planets[i].degree - planets[j].degree)
      const angle = diff > 180 ? 360 - diff : diff

      for (const [target, name] of ASPECT_DEFS) {
        const orb = Math.abs(angle - target)
        if (orb <= 8) {
          aspects.push({
            planet1: planets[i].planet,
            planet2: planets[j].planet,
            aspect: name,
            degree: target,
            orb: Math.round(orb * 100) / 100,
          })
          break
        }
      }
    }
  }
  return aspects
}

/**
 * Main calculation function. Computes all planetary positions, houses, and aspects.
 */
export function calculateChart(
  birthDate: string,
  birthTime: string,
  latitude: number,
  longitude: number,
  timezoneOffsetHours: number,
): AstroCalcResult {
  const [year, month, day] = birthDate.split('-').map(Number)
  const [hour, minute] = birthTime.split(':').map(Number)

  // Convert local time to UTC
  const utcHour = hour - timezoneOffsetHours
  const dayFraction = (utcHour + minute / 60) / 24
  const jd = julian.CalendarGregorianToJD(year, month, day + dayFraction)

  // Create planet objects
  const earth = new planetposition.Planet(earthData)
  const mercury = new planetposition.Planet(mercuryData)
  const venus = new planetposition.Planet(venusData)
  const mars = new planetposition.Planet(marsData)
  const jupiter = new planetposition.Planet(jupiterData)
  const saturn = new planetposition.Planet(saturnData)
  const uranus = new planetposition.Planet(uranusData)
  const neptune = new planetposition.Planet(neptuneData)

  const eHelio = earth.position(jd)

  // Sun (geocentric ecliptic longitude via VSOP87)
  const sunPos = solar.apparentVSOP87(earth, jd)
  const sunDeg = normalizeDeg(sunPos.lon * RAD_TO_DEG)

  // Moon
  const moonPos = moonposition.position(jd)
  const moonDeg = normalizeDeg(moonPos.lon * RAD_TO_DEG)

  // Outer planets: heliocentric to geocentric
  const planetDefs: [string, InstanceType<typeof planetposition.Planet>][] = [
    ['Mercury', mercury],
    ['Venus', venus],
    ['Mars', mars],
    ['Jupiter', jupiter],
    ['Saturn', saturn],
    ['Uranus', uranus],
    ['Neptune', neptune],
  ]

  // Ascendant
  const ascDeg = computeAscendant(jd, longitude, latitude)
  const houses = computeHouses(ascDeg)

  const planets: PlanetResult[] = []

  // Sun
  planets.push({
    planet: 'Sun',
    sign: degToSign(sunDeg),
    degree: sunDeg,
    house: getHouseNumber(sunDeg, houses),
    retrograde: false,
  })

  // Moon
  planets.push({
    planet: 'Moon',
    sign: degToSign(moonDeg),
    degree: moonDeg,
    house: getHouseNumber(moonDeg, houses),
    retrograde: false,
  })

  // Other planets
  for (const [name, obj] of planetDefs) {
    const helio = obj.position(jd)
    const geoLon = helioToGeoLon(helio.lon, helio.range, eHelio.lon, eHelio.range, helio.lat)
    const deg = normalizeDeg(geoLon * RAD_TO_DEG)
    const retro = isRetrograde(obj, earth, jd)

    planets.push({
      planet: name,
      sign: degToSign(deg),
      degree: deg,
      house: getHouseNumber(deg, houses),
      retrograde: retro,
    })
  }

  // Pluto (simplified, not in VSOP87; use a rough approximation)
  // Pluto moves very slowly (~1.5 deg/year). Approximate from known epoch.
  const plutoBaseDeg = 226.0 // Pluto was at ~226° (Sagittarius 16°) on Jan 1 2000
  const yearsFrom2000 = (jd - 2451545.0) / 365.25
  const plutoDeg = normalizeDeg(plutoBaseDeg + yearsFrom2000 * 1.48)
  planets.push({
    planet: 'Pluto',
    sign: degToSign(plutoDeg),
    degree: plutoDeg,
    house: getHouseNumber(plutoDeg, houses),
    retrograde: false,
  })

  const aspects = computeAspects(planets)

  return {
    planets,
    houses,
    aspects,
    moonSign: degToSign(moonDeg),
    risingSign: degToSign(ascDeg),
  }
}
