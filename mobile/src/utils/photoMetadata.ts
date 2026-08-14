export type PhotoMetadataSource = 'exif' | 'device';

export interface PhotoMetadata {
    latitude?: number;
    longitude?: number;
    takenAt?: string;
    width?: number;
    height?: number;
    orientation?: number
}

export interface ResolvedPhotoMetadata {
    latitude: number;
    longitude: number;
    locationSource: PhotoMetadataSource;
    photoTakenAt: string;
    photoTakenAtSource: PhotoMetadataSource;
    width?: number;
    height?: number
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

    console.log(exif)

    const latitude = toNumber(exif.GPSLatitude ?? exif.latitude);
    const longitude = toNumber(exif.GPSLongitude ?? exif.longitude);
    const latitudeRef = typeof exif.GPSLatitudeRef === 'string' ? exif.GPSLatitudeRef : '';
    const longitudeRef = typeof exif.GPSLongitudeRef === 'string' ? exif.GPSLongitudeRef : '';
    let width = toNumber(exif.ImageWidth)
    let height = toNumber(exif.ImageLength)

    const resolvedLatitude = latitude === undefined ? undefined : latitudeRef.toUpperCase() === 'S' ? -Math.abs(latitude) : latitude;
    const resolvedLongitude = longitude === undefined ? undefined : longitudeRef.toUpperCase() === 'W' ? -Math.abs(longitude) : longitude;
    const hasUsableLocation = isUsableCoordinate(resolvedLatitude, resolvedLongitude);
    console.log(width)
    if (toNumber(exif.Orientation) == 6) {
        width = toNumber(exif.ImageLength)
        height = toNumber(exif.ImageWidth)
    }
    console.log(width)
    return {
        latitude: hasUsableLocation ? resolvedLatitude : undefined,
        longitude: hasUsableLocation ? resolvedLongitude : undefined,
        takenAt: parseDate(exif.DateTimeOriginal ?? exif.DateTimeDigitized ?? exif.DateTime ?? exif.timestamp),
        width: width,
        height: height,
    };
}

export function resolvePhotoMetadata(
    photoMetadata: PhotoMetadata[],
    fallback: { latitude: number; longitude: number; takenAt: string }
): ResolvedPhotoMetadata[] {

    const resolved = photoMetadata.map((metadata) => {
        const locationSource: PhotoMetadataSource = metadata ? 'exif' : 'device'
        const photoTakenAtSource: PhotoMetadataSource = metadata ? 'exif' : 'device'
        return {
            latitude: metadata.latitude ?? fallback.latitude,
            longitude: metadata.longitude ?? fallback.longitude,
            locationSource: locationSource,
            photoTakenAt: metadata.takenAt ?? fallback.takenAt,
            photoTakenAtSource: photoTakenAtSource,
            width: metadata.width,
            height: metadata.height,
        }

    })

    return resolved
}
