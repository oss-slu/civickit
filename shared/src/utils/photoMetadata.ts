export type PhotoMetadataSource = 'exif' | 'device';

export interface PhotoMetadata {
    latitude?: number;
    longitude?: number;
    takenAt?: string;
    /**
     * Display dimensions, supplied by the picker or camera asset -- never read
     * from EXIF. EXIF's ImageWidth/ImageLength are pre-rotation, so correcting
     * them means interpreting the Orientation tag, and the asset's own numbers
     * already have that applied.
     */
    width?: number;
    height?: number;
    orientation?: number;
}

const toNumber = (value: unknown): number | undefined => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
};

const parseDate = (value: unknown): string | undefined => {
    if (typeof value !== 'string' && typeof value !== 'number') return undefined;

    const normalized = typeof value === 'string'
        ? value.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3')
        : value;
    const date = new Date(normalized);

    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const isUsableCoordinate = (latitude?: number, longitude?: number): latitude is number => (
    latitude !== undefined &&
    longitude !== undefined &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    !(latitude === 0 && longitude === 0)
);

export function extractPhotoMetadataFromExif(exif?: Record<string, unknown> | null): PhotoMetadata {
    if (!exif) return {};

    const latitude = toNumber(exif.GPSLatitude ?? exif.latitude);
    const longitude = toNumber(exif.GPSLongitude ?? exif.longitude);
    const latitudeRef = typeof exif.GPSLatitudeRef === 'string' ? exif.GPSLatitudeRef : '';
    const longitudeRef = typeof exif.GPSLongitudeRef === 'string' ? exif.GPSLongitudeRef : '';

    const resolvedLatitude = latitude === undefined ? undefined : latitudeRef.toUpperCase() === 'S' ? -Math.abs(latitude) : latitude;
    const resolvedLongitude = longitude === undefined ? undefined : longitudeRef.toUpperCase() === 'W' ? -Math.abs(longitude) : longitude;
    const hasUsableLocation = isUsableCoordinate(resolvedLatitude, resolvedLongitude);

    const Orientation = toNumber(exif.Orientation)

    return {
        latitude: hasUsableLocation ? resolvedLatitude : undefined,
        longitude: hasUsableLocation ? resolvedLongitude : undefined,
        takenAt: parseDate(exif.DateTimeOriginal ?? exif.DateTimeDigitized ?? exif.DateTime ?? exif.timestamp),
        orientation: Orientation
    };
}

/**
 * An issue has one location, taken from the first photo that actually carries
 * usable coordinates -- not merely the first photo.
 *
 * Expect 'device' most of the time. expo-camera does not embed GPS into the
 * photos it takes, and Android strips GPS from library photos without
 * ACCESS_MEDIA_LOCATION. See "EXIF GPS availability" in
 * docs/design-decisions/photo-storage.md.
 */
export function resolveIssueLocation(
    photoMetadata: PhotoMetadata[],
    fallback: { latitude: number; longitude: number }
): { latitude: number; longitude: number; locationSource: PhotoMetadataSource } {
    const located = photoMetadata.find(
        metadata => isUsableCoordinate(metadata.latitude, metadata.longitude)
    );

    if (!located) {
        return {
            latitude: fallback.latitude,
            longitude: fallback.longitude,
            locationSource: 'device',
        };
    }

    return {
        latitude: located.latitude!,
        longitude: located.longitude!,
        locationSource: 'exif',
    };
}

/** Each photo has its own capture time. */
export function resolvePhotoTakenAt(
    metadata: PhotoMetadata,
    fallback: string
): { photoTakenAt: string; photoTakenAtSource: PhotoMetadataSource } {
    return metadata.takenAt
        ? { photoTakenAt: metadata.takenAt, photoTakenAtSource: 'exif' }
        : { photoTakenAt: fallback, photoTakenAtSource: 'device' };
}
