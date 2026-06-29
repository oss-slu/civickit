import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export type LocationSource = {
  latitude: number;
  longitude: number;
  priority?: 'exif' | 'gps' | 'fallback'; // extensible for future sources
};

//if we want to add more data points in the future (e.g. country, timezone, etc.)
//this data is good to keep for data analytics
export type ResolvedLocationMetadata = {
  district?: string;
  subregion?: string;
  name?: string;
};

export function extractResolvedLocationMetadata(
  address: Pick<Location.LocationGeocodedAddress, 'district' | 'subregion' | 'name'>
): ResolvedLocationMetadata {
  return {
    district: address.district || undefined,
    subregion: address.subregion || undefined,
    name: address.name || undefined,
  };
}

//this function takes the raw reversed geocoded location object from expo and turns it into one clean, human-readable string
export function formatResolvedAddress(
  address: Pick<
    Location.LocationGeocodedAddress,
    'streetNumber' | 'street' | 'city' | 'region' | 'postalCode'
  >
): string {
  const { streetNumber, street, city, region, postalCode } = address;
  const parts = [
    streetNumber && street ? `${streetNumber} ${street}` : street,
    city,
    region,
    postalCode,
  ].filter(Boolean);

  return parts.join(', ');
}

/**
 * Resolves a human-readable address from one or more location sources.
 * Sources are tried in order — first one that resolves wins.
 * 
 * Future use: pass EXIF-derived coords as the first source for higher accuracy.
 */
export function useResolvedAddress(sources: LocationSource[]): string {
  const [address, setAddress] = useState<string>('Loading location...');

  useEffect(() => {
    if (!sources.length) return;

    let cancelled = false;

    const resolve = async () => {
      for (const source of sources) {
        try {
          const geocode = await Location.reverseGeocodeAsync({
            latitude: source.latitude,
            longitude: source.longitude,
          });

          if (cancelled) return;

          if (geocode.length > 0) {
            const formattedAddress = formatResolvedAddress(geocode[0]);
            if (formattedAddress) {
              setAddress(formattedAddress);
              return; // first successful resolution wins
            }
          }
        } catch {
          // this source failed, try the next one
          continue;
        }
      }

      if (!cancelled) setAddress('Location unavailable');
    };

    resolve();
    return () => { cancelled = true; };
  }, []);  // sources are derived from the issue, stable for the lifetime of this screen

  return address;
}
