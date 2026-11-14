// mobile/src/constants/cityBounds.ts
import cityBounds from '../../assets/shapes/stl_boundary_inverted.json'

type LatLng = { latitude: number; longitude: number }

const toLatLng = (point: number[]): LatLng => ({ latitude: point[1], longitude: point[0] })

// Built once at module load so map overlays get stable array references.
// Outer ring of the inverted boundary: covers the world.
export const worldPoints: LatLng[] = cityBounds.features[0].geometry.coordinates[0][0].map(toLatLng)

// Hole in the outer ring: the St. Louis city limits.
export const stlPoints: LatLng[] = cityBounds.features[0].geometry.coordinates[0][1].map(toLatLng)
