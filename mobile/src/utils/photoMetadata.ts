export type PhotoMetadataSource = 'exif' | 'device';

export interface PhotoMetadata {
    latitude?: number;
    longitude?: number;
    takenAt?: string;
}

export interface ResolvedPhotoMetadata {
    latitude: number;
    longitude: number;
    locationSource: PhotoMetadataSource;
    photoTakenAt: string;
    photoTakenAtSource: PhotoMetadataSource;
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

    return {
        latitude: hasUsableLocation ? resolvedLatitude : undefined,
        longitude: hasUsableLocation ? resolvedLongitude : undefined,
        takenAt: parseDate(exif.DateTimeOriginal ?? exif.DateTimeDigitized ?? exif.DateTime ?? exif.timestamp),
    };
}

export function resolvePhotoMetadata(
    photoMetadata: PhotoMetadata[],
    fallback: { latitude: number; longitude: number; takenAt: string }
): ResolvedPhotoMetadata {
    const locationMetadata = photoMetadata.find(
        metadata => isUsableCoordinate(metadata.latitude, metadata.longitude)
    );
    const timestampMetadata = photoMetadata.find(metadata => metadata.takenAt !== undefined);

    return {
        latitude: locationMetadata?.latitude ?? fallback.latitude,
        longitude: locationMetadata?.longitude ?? fallback.longitude,
        locationSource: locationMetadata ? 'exif' : 'device',
        photoTakenAt: timestampMetadata?.takenAt ?? fallback.takenAt,
        photoTakenAtSource: timestampMetadata ? 'exif' : 'device',
    };
}
